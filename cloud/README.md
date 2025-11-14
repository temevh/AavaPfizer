# Cloud Training Setup

This folder contains scripts for training the migraine classifier on Google Cloud Vertex AI.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Google Cloud:**
   ```bash
   # Authenticate
   gcloud auth login
   gcloud auth application-default login

   # Set project
   gcloud config set project YOUR_PROJECT_ID

   # Create GCS bucket
   gsutil mb -l us-central1 gs://YOUR_BUCKET_NAME
   ```

3. **Update config.yaml:**
   - Set your `project_id`
   - Set your `bucket_name`

## Usage

### Option 1: Quick Local Training (for testing)

```bash
python train.py \
  --data-path ../data/augmented_dataset.csv \
  --epochs 50 \
  --batch-size 32
```

### Option 2: Upload Data and Train on Vertex AI

```bash
# 1. Upload dataset to GCS
python -c "from gcs_utils import upload_dataset_to_gcs; \
  upload_dataset_to_gcs('YOUR_BUCKET_NAME', '../data/augmented_dataset.csv', 'data/augmented_dataset.csv')"

# 2. Submit training job to Vertex AI
python deploy_training_job.py \
  --project-id YOUR_PROJECT_ID \
  --bucket-name YOUR_BUCKET_NAME \
  --dataset-path data/augmented_dataset.csv

# With GPU (faster but more expensive):
python deploy_training_job.py \
  --project-id YOUR_PROJECT_ID \
  --bucket-name YOUR_BUCKET_NAME \
  --dataset-path data/augmented_dataset.csv \
  --gpu
```

### Option 3: Manual GCS Operations

```python
from gcs_utils import GCSModelManager

# Initialize manager
manager = GCSModelManager(bucket_name="YOUR_BUCKET_NAME")

# Upload dataset
manager.upload_data(
    local_file_path="../data/augmented_dataset.csv",
    gcs_path="data/augmented_dataset.csv"
)

# After training, download model
state_dict, scaler, encoder = manager.download_model(version="latest")
```

## Files

- **model.py**: PyTorch model definition
- **train.py**: Training script (works locally or on Vertex AI)
- **gcs_utils.py**: Utilities for GCS operations
- **deploy_training_job.py**: Submit training jobs to Vertex AI
- **config.yaml**: Configuration file
- **requirements.txt**: Python dependencies

## Model Artifacts

After training, the following artifacts are saved to GCS:

```
gs://YOUR_BUCKET_NAME/models/migraine-classifier/
├── model.pt              # PyTorch state dict
├── scaler.pkl            # StandardScaler for feature normalization
└── label_encoder.pkl     # LabelEncoder for class labels
```

## Monitoring

Monitor your training job:
- Console: https://console.cloud.google.com/vertex-ai/training/custom-jobs
- CLI: `gcloud ai custom-jobs list --region=us-central1`

## Costs

Approximate costs for training:
- **CPU (n1-standard-4)**: ~$0.20/hour
- **GPU (n1-standard-4 + T4)**: ~$0.50/hour
- **Storage (GCS)**: ~$0.02/GB/month

Expected training time: 5-15 minutes on CPU, 2-5 minutes on GPU
