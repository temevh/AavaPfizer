"""
FastAPI backend for migraine classification with online learning.
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path

import torch
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

# Add parent folder and cloud folder to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "cloud"))

from model import MigraineClassifier, CLASS_NAMES
from online_learning import OnlineLearningManager
from schemas import (
    MigraineFeatures,
    PredictionResponse,
    UpdateRequest,
    UpdateResponse,
    MetricsResponse,
    HealthResponse,
    AccumulateRequest,
    AccumulateResponse,
    BatchUpdateResponse,
    ClearSessionResponse,
    ChatRequest,
    ChatResponse
)
from config import settings

# Gemini AI
import google.generativeai as genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Migraine Classifier API",
    description="Real-time migraine classification with online learning",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model_manager: OnlineLearningManager = None
scaler = None
label_encoder = None
update_counter = 0

# Session storage for accumulated data
session_data = []  # List of (features, label) tuples


def load_model():
    """Load model from GCS or local storage."""
    global model_manager, scaler, label_encoder

    logger.info("Loading model artifacts...")

    try:
        # Try to load from GCS if configured
        if settings.USE_GCS and settings.GCS_BUCKET_NAME:
            from cloud.gcs_utils import GCSModelManager
            gcs_manager = GCSModelManager(
                bucket_name=settings.GCS_BUCKET_NAME,
                model_path=settings.GCS_MODEL_PATH
            )
            state_dict, scaler, label_encoder = gcs_manager.download_model(
                local_dir="artifacts",
                version="latest"
            )
            logger.info("✓ Model loaded from GCS")
        else:
            # Load from local files
            state_dict = torch.load("artifacts/model.pt", map_location=torch.device('cpu'))
            scaler = joblib.load("artifacts/scaler.pkl")
            label_encoder = joblib.load("artifacts/label_encoder.pkl")
            logger.info("✓ Model loaded from local files")

        # Initialize model
        model = MigraineClassifier(
            input_dim=settings.MODEL_INPUT_DIM,  # 50 features
            hidden_dims=settings.MODEL_HIDDEN_DIMS,
            num_classes=settings.MODEL_NUM_CLASSES,
            dropout_rate=settings.MODEL_DROPOUT
        )
        model.load_state_dict(state_dict)

        # Initialize online learning manager
        model_manager = OnlineLearningManager(
            model=model,
            learning_rate=settings.ONLINE_LEARNING_RATE,
            replay_buffer_size=settings.REPLAY_BUFFER_SIZE,
            replay_frequency=settings.REPLAY_FREQUENCY,
            confidence_threshold=settings.CONFIDENCE_THRESHOLD,
            device="cpu"
        )

        logger.info("✓ Online learning manager initialized")
        logger.info(f"✓ Model ready with {len(CLASS_NAMES)} classes")

    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize model on startup."""
    logger.info("="*60)
    logger.info("STARTING MIGRAINE CLASSIFIER API")
    logger.info("="*60)
    load_model()

    # Configure Gemini
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        logger.info("✓ Gemini API configured")
    else:
        logger.warning("⚠ Gemini API key not configured")

    logger.info("="*60)
    logger.info("✓ API READY")
    logger.info("="*60)


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=model_manager is not None,
        version="1.0.0"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check."""
    return HealthResponse(
        status="healthy" if model_manager is not None else "unhealthy",
        model_loaded=model_manager is not None,
        version="1.0.0"
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(features: MigraineFeatures):
    """
    Make a migraine classification prediction.

    Args:
        features: Patient features

    Returns:
        Prediction with confidence scores
    """
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Preprocess features
        feature_array = np.array([features.to_tensor()], dtype=np.float32)
        feature_scaled = scaler.transform(feature_array)
        feature_tensor = torch.FloatTensor(feature_scaled)

        # Make prediction
        pred_idx, probs, confidence = model_manager.predict(feature_tensor)

        # Convert to class name
        predicted_class = CLASS_NAMES[pred_idx]

        # Build probability dict
        prob_dict = {
            class_name: float(probs[0][i])
            for i, class_name in enumerate(CLASS_NAMES)
        }

        logger.info(f"Prediction: {predicted_class} (confidence: {confidence:.3f})")

        return PredictionResponse(
            prediction=predicted_class,
            confidence=float(confidence),
            all_probabilities=prob_dict,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/accumulate", response_model=AccumulateResponse)
async def accumulate_data(request: AccumulateRequest):
    """
    Accumulate labeled data for later batch update.
    Data is stored in session and not used to update model until /update is called.

    Args:
        request: Features and true label

    Returns:
        Accumulation status
    """
    global session_data

    if model_manager is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Validate label
        if request.true_label not in CLASS_NAMES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid label. Must be one of: {CLASS_NAMES}"
            )

        # Preprocess features
        feature_array = np.array([request.features.to_tensor()], dtype=np.float32)
        feature_scaled = scaler.transform(feature_array)
        feature_tensor = torch.FloatTensor(feature_scaled)

        # Get label index
        label_idx = CLASS_NAMES.index(request.true_label)

        # Store in session
        session_data.append((feature_tensor, label_idx))

        logger.info(f"Data accumulated: {request.true_label} (session size: {len(session_data)})")

        return AccumulateResponse(
            status="success",
            session_size=len(session_data),
            message=f"Data accumulated. Total samples in session: {len(session_data)}"
        )

    except Exception as e:
        logger.error(f"Accumulate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update", response_model=BatchUpdateResponse)
async def update_model(background_tasks: BackgroundTasks):
    """
    Update model with accumulated session data (batch learning).
    Processes all data accumulated via /accumulate endpoint.

    Args:
        background_tasks: FastAPI background tasks

    Returns:
        Batch update status and metrics
    """
    global update_counter, session_data

    if model_manager is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Check if there's session data
        if len(session_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="No session data to update. Use /accumulate to add data first."
            )

        logger.info(f"Starting batch update with {len(session_data)} samples")

        # Perform batch update
        update_result = model_manager.batch_update(session_data)

        # Increment counter and save
        update_counter += 1
        background_tasks.add_task(save_model_to_gcs)

        # Clear session data after successful update
        samples_processed = len(session_data)
        session_data = []

        logger.info(f"Batch update complete: {samples_processed} samples, avg_loss={update_result.get('avg_loss', 0):.4f}")

        return BatchUpdateResponse(
            status="success",
            samples_processed=samples_processed,
            avg_loss=update_result.get("avg_loss"),
            total_updates=update_result.get("total_updates", 0),
            session_cleared=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update_single", response_model=UpdateResponse)
async def update_model_single(request: UpdateRequest, background_tasks: BackgroundTasks):
    """
    Update model with single labeled data point (immediate online learning).
    This is the legacy endpoint for immediate updates without session accumulation.

    Args:
        request: Features and true label
        background_tasks: FastAPI background tasks

    Returns:
        Update status and metrics
    """
    global update_counter

    if model_manager is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Validate label
        if request.true_label not in CLASS_NAMES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid label. Must be one of: {CLASS_NAMES}"
            )

        # Preprocess features
        feature_array = np.array([request.features.to_tensor()], dtype=np.float32)
        feature_scaled = scaler.transform(feature_array)
        feature_tensor = torch.FloatTensor(feature_scaled)

        # Get label index
        label_idx = CLASS_NAMES.index(request.true_label)

        # Perform online update
        update_result = model_manager.online_update(
            feature_tensor,
            label_idx,
            force_update=request.force_update
        )

        # Increment counter and save periodically
        if update_result["updated"]:
            update_counter += 1

            # Save to GCS in background every N updates
            if update_counter % settings.SAVE_FREQUENCY == 0:
                background_tasks.add_task(save_model_to_gcs)

        logger.info(f"Update result: {update_result}")

        return UpdateResponse(
            status="success",
            updated=update_result["updated"],
            loss=update_result.get("loss"),
            confidence=update_result["confidence"],
            update_count=update_result.get("update_count"),
            reason=update_result.get("reason")
        )

    except Exception as e:
        logger.error(f"Update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear_session", response_model=ClearSessionResponse)
async def clear_session():
    """
    Clear accumulated session data without updating the model.
    Useful if user wants to discard accumulated data.

    Returns:
        Clear status
    """
    global session_data

    samples_cleared = len(session_data)
    session_data = []

    logger.info(f"Session cleared: {samples_cleared} samples discarded")

    return ClearSessionResponse(
        status="success",
        samples_cleared=samples_cleared,
        message=f"Session cleared. {samples_cleared} samples discarded."
    )


@app.get("/session_info")
async def get_session_info():
    """
    Get information about current session data.

    Returns:
        Session information
    """
    return {
        "session_size": len(session_data),
        "status": "ready" if len(session_data) > 0 else "empty"
    }


@app.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """Get current online learning metrics."""
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    metrics = model_manager.get_metrics()
    return MetricsResponse(**metrics)


@app.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    """
    Chat with Gemini AI.

    Args:
        request: Chat request with message and optional system prompt

    Returns:
        Gemini's response
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key not configured")

    try:
        # Initialize the model (using gemini-2.5-flash for faster, cheaper responses)
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Prepare the prompt
        if request.system_prompt:
            full_prompt = f"{request.system_prompt}\n\nUser: {request.message}\n\nAssistant:"
        else:
            full_prompt = request.message

        # Generate response
        response = model.generate_content(full_prompt)

        logger.info(f"Gemini chat - User: {request.message[:50]}... Response: {response.text[:50]}...")

        return ChatResponse(
            response=response.text,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        logger.error(f"Gemini chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def save_model_to_gcs():
    """Background task to save model to GCS."""
    if not settings.USE_GCS:
        logger.info("GCS disabled, skipping save")
        return

    try:
        from cloud.gcs_utils import GCSModelManager

        logger.info("Saving updated model to GCS...")

        gcs_manager = GCSModelManager(
            bucket_name=settings.GCS_BUCKET_NAME,
            model_path=settings.GCS_MODEL_PATH
        )

        # Save with timestamp version
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

        gcs_manager.upload_model(
            model_state_dict=model_manager.model.state_dict(),
            scaler=scaler,
            label_encoder=label_encoder,
            version=f"online_{timestamp}"
        )

        # Also save as "latest"
        gcs_manager.upload_model(
            model_state_dict=model_manager.model.state_dict(),
            scaler=scaler,
            label_encoder=label_encoder,
            version="latest"
        )

        logger.info(f"✓ Model saved to GCS (update #{update_counter})")

    except Exception as e:
        logger.error(f"Failed to save model to GCS: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
