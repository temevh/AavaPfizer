"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional


class MigraineFeatures(BaseModel):
    """Input features for migraine prediction."""

    age: int = Field(..., ge=0, le=120, description="Patient age")
    duration: int = Field(..., ge=0, le=3, description="Duration of headache (0-3 scale)")
    frequency: int = Field(..., ge=0, le=7, description="Frequency of episodes (0-7 scale)")
    location: int = Field(..., ge=0, le=1, description="Pain location (0 or 1)")
    character: int = Field(..., ge=0, le=1, description="Pain character (0 or 1)")
    intensity: int = Field(..., ge=0, le=3, description="Pain intensity (0-3 scale)")

    # Symptoms (binary)
    nausea: int = Field(..., ge=0, le=1, description="Nausea present")
    vomit: int = Field(..., ge=0, le=1, description="Vomiting present")
    phonophobia: int = Field(..., ge=0, le=1, description="Phonophobia present")
    photophobia: int = Field(..., ge=0, le=1, description="Photophobia present")
    visual: int = Field(..., ge=0, le=3, description="Visual symptoms (0-3)")
    sensory: int = Field(..., ge=0, le=1, description="Sensory symptoms")
    dysphasia: int = Field(..., ge=0, le=1, description="Dysphasia present")
    dysarthria: int = Field(..., ge=0, le=1, description="Dysarthria present")
    vertigo: int = Field(..., ge=0, le=1, description="Vertigo present")
    tinnitus: int = Field(..., ge=0, le=1, description="Tinnitus present")
    hypoacusis: int = Field(..., ge=0, le=1, description="Hypoacusis present")
    diplopia: int = Field(..., ge=0, le=1, description="Diplopia present")
    defect: int = Field(..., ge=0, le=1, description="Visual defect present")
    ataxia: int = Field(..., ge=0, le=1, description="Ataxia present")
    conscience: int = Field(..., ge=0, le=1, description="Consciousness alteration")
    paresthesia: int = Field(..., ge=0, le=1, description="Paresthesia present")
    dpf: int = Field(..., ge=0, le=1, description="Family history (DPF)")

    def to_tensor(self):
        """Convert to list in correct order for model input."""
        return [
            self.age, self.duration, self.frequency, self.location,
            self.character, self.intensity, self.nausea, self.vomit,
            self.phonophobia, self.photophobia, self.visual, self.sensory,
            self.dysphasia, self.dysarthria, self.vertigo, self.tinnitus,
            self.hypoacusis, self.diplopia, self.defect, self.ataxia,
            self.conscience, self.paresthesia, self.dpf
        ]

    class Config:
        schema_extra = {
            "example": {
                "age": 35,
                "duration": 2,
                "frequency": 5,
                "location": 1,
                "character": 1,
                "intensity": 3,
                "nausea": 1,
                "vomit": 1,
                "phonophobia": 1,
                "photophobia": 1,
                "visual": 0,
                "sensory": 0,
                "dysphasia": 0,
                "dysarthria": 0,
                "vertigo": 0,
                "tinnitus": 0,
                "hypoacusis": 0,
                "diplopia": 0,
                "defect": 0,
                "ataxia": 0,
                "conscience": 0,
                "paresthesia": 0,
                "dpf": 1
            }
        }


class PredictionResponse(BaseModel):
    """Response from prediction endpoint."""

    prediction: str = Field(..., description="Predicted migraine type")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence (0-1)")
    all_probabilities: dict = Field(..., description="Probabilities for all classes")
    timestamp: str = Field(..., description="Prediction timestamp")


class UpdateRequest(BaseModel):
    """Request to update model with new data."""

    features: MigraineFeatures
    true_label: str = Field(..., description="True migraine type (user confirmed)")
    force_update: bool = Field(default=False, description="Force update even if high confidence")

    class Config:
        schema_extra = {
            "example": {
                "features": {
                    "age": 35, "duration": 2, "frequency": 5, "location": 1,
                    "character": 1, "intensity": 3, "nausea": 1, "vomit": 1,
                    "phonophobia": 1, "photophobia": 1, "visual": 0, "sensory": 0,
                    "dysphasia": 0, "dysarthria": 0, "vertigo": 0, "tinnitus": 0,
                    "hypoacusis": 0, "diplopia": 0, "defect": 0, "ataxia": 0,
                    "conscience": 0, "paresthesia": 0, "dpf": 1
                },
                "true_label": "Migraine without aura",
                "force_update": False
            }
        }


class UpdateResponse(BaseModel):
    """Response from model update endpoint."""

    status: str = Field(..., description="Update status")
    updated: bool = Field(..., description="Whether model was actually updated")
    loss: Optional[float] = Field(None, description="Training loss if updated")
    confidence: float = Field(..., description="Model confidence before update")
    update_count: Optional[int] = Field(None, description="Total number of updates")
    reason: Optional[str] = Field(None, description="Reason if not updated")


class MetricsResponse(BaseModel):
    """Response from metrics endpoint."""

    total_updates: int = Field(..., description="Total number of model updates")
    skipped_updates: int = Field(..., description="Number of skipped updates (high confidence)")
    replay_buffer_size: int = Field(..., description="Current replay buffer size")
    avg_recent_loss: Optional[float] = Field(None, description="Average recent loss")
    learning_rate: float = Field(..., description="Current learning rate")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(..., description="Service status")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    version: str = Field(..., description="API version")


class AccumulateRequest(BaseModel):
    """Request to accumulate data for later batch update."""

    features: MigraineFeatures
    true_label: str = Field(..., description="True migraine type (user confirmed)")

    class Config:
        schema_extra = {
            "example": {
                "features": {
                    "age": 35, "duration": 2, "frequency": 5, "location": 1,
                    "character": 1, "intensity": 3, "nausea": 1, "vomit": 1,
                    "phonophobia": 1, "photophobia": 1, "visual": 0, "sensory": 0,
                    "dysphasia": 0, "dysarthria": 0, "vertigo": 0, "tinnitus": 0,
                    "hypoacusis": 0, "diplopia": 0, "defect": 0, "ataxia": 0,
                    "conscience": 0, "paresthesia": 0, "dpf": 1
                },
                "true_label": "Migraine without aura"
            }
        }


class AccumulateResponse(BaseModel):
    """Response from accumulate endpoint."""

    status: str = Field(..., description="Accumulation status")
    session_size: int = Field(..., description="Number of samples in current session")
    message: str = Field(..., description="Status message")


class BatchUpdateResponse(BaseModel):
    """Response from batch model update."""

    status: str = Field(..., description="Update status")
    samples_processed: int = Field(..., description="Number of samples processed")
    avg_loss: Optional[float] = Field(None, description="Average training loss")
    total_updates: int = Field(..., description="Total number of updates performed")
    session_cleared: bool = Field(..., description="Whether session data was cleared")


class ClearSessionResponse(BaseModel):
    """Response from clear session endpoint."""

    status: str = Field(..., description="Clear status")
    samples_cleared: int = Field(..., description="Number of samples cleared")
    message: str = Field(..., description="Status message")
