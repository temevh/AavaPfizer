"""
Utility functions for Google Cloud Storage operations.
"""

import os
import io
import torch
import joblib
from google.cloud import storage
from typing import Optional


class GCSModelManager:
    """Manage model artifacts in Google Cloud Storage."""

    def __init__(self, bucket_name: str, model_path: str = "models/migraine-classifier"):
        """
        Initialize GCS Model Manager.

        Args:
            bucket_name: Name of the GCS bucket
            model_path: Path within the bucket to store/retrieve models
        """
        self.bucket_name = bucket_name
        self.model_path = model_path
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)

    def upload_model(self, model_state_dict: dict, scaler=None, label_encoder=None, version: Optional[str] = None):
        """
        Upload model artifacts to GCS.

        Args:
            model_state_dict: PyTorch model state dictionary
            scaler: Fitted sklearn StandardScaler
            label_encoder: Fitted sklearn LabelEncoder
            version: Optional version string (e.g., "v1", "latest")
        """
        version_path = f"{self.model_path}/{version}" if version else self.model_path

        # Upload model state dict
        model_blob = self.bucket.blob(f"{version_path}/model.pt")
        buffer = io.BytesIO()
        torch.save(model_state_dict, buffer)
        buffer.seek(0)
        model_blob.upload_from_file(buffer)
        print(f"✓ Uploaded model to gs://{self.bucket_name}/{version_path}/model.pt")

        # Upload scaler if provided
        if scaler is not None:
            scaler_blob = self.bucket.blob(f"{version_path}/scaler.pkl")
            buffer = io.BytesIO()
            joblib.dump(scaler, buffer)
            buffer.seek(0)
            scaler_blob.upload_from_file(buffer)
            print(f"✓ Uploaded scaler to gs://{self.bucket_name}/{version_path}/scaler.pkl")

        # Upload label encoder if provided
        if label_encoder is not None:
            encoder_blob = self.bucket.blob(f"{version_path}/label_encoder.pkl")
            buffer = io.BytesIO()
            joblib.dump(label_encoder, buffer)
            buffer.seek(0)
            encoder_blob.upload_from_file(buffer)
            print(f"✓ Uploaded label encoder to gs://{self.bucket_name}/{version_path}/label_encoder.pkl")

    def download_model(self, local_dir: str = "artifacts", version: Optional[str] = None):
        """
        Download model artifacts from GCS.

        Args:
            local_dir: Local directory to save artifacts
            version: Optional version string to download specific version

        Returns:
            Tuple of (model_state_dict, scaler, label_encoder)
        """
        os.makedirs(local_dir, exist_ok=True)
        version_path = f"{self.model_path}/{version}" if version else self.model_path

        # Download model
        model_blob = self.bucket.blob(f"{version_path}/model.pt")
        model_path = os.path.join(local_dir, "model.pt")
        model_blob.download_to_filename(model_path)
        model_state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        print(f"✓ Downloaded model from gs://{self.bucket_name}/{version_path}/model.pt")

        # Download scaler
        scaler = None
        try:
            scaler_blob = self.bucket.blob(f"{version_path}/scaler.pkl")
            scaler_path = os.path.join(local_dir, "scaler.pkl")
            scaler_blob.download_to_filename(scaler_path)
            scaler = joblib.load(scaler_path)
            print(f"✓ Downloaded scaler from gs://{self.bucket_name}/{version_path}/scaler.pkl")
        except Exception as e:
            print(f"Warning: Could not download scaler: {e}")

        # Download label encoder
        label_encoder = None
        try:
            encoder_blob = self.bucket.blob(f"{version_path}/label_encoder.pkl")
            encoder_path = os.path.join(local_dir, "label_encoder.pkl")
            encoder_blob.download_to_filename(encoder_path)
            label_encoder = joblib.load(encoder_path)
            print(f"✓ Downloaded label encoder from gs://{self.bucket_name}/{version_path}/label_encoder.pkl")
        except Exception as e:
            print(f"Warning: Could not download label encoder: {e}")

        return model_state_dict, scaler, label_encoder

    def list_model_versions(self):
        """List all available model versions in GCS."""
        blobs = self.client.list_blobs(self.bucket_name, prefix=f"{self.model_path}/")
        versions = set()

        for blob in blobs:
            parts = blob.name.split('/')
            if len(parts) > len(self.model_path.split('/')):
                version_idx = len(self.model_path.split('/'))
                versions.add(parts[version_idx])

        return sorted(list(versions))

    def upload_data(self, local_file_path: str, gcs_path: str):
        """
        Upload data file to GCS.

        Args:
            local_file_path: Path to local file
            gcs_path: Destination path in GCS bucket
        """
        blob = self.bucket.blob(gcs_path)
        blob.upload_from_filename(local_file_path)
        print(f"✓ Uploaded {local_file_path} to gs://{self.bucket_name}/{gcs_path}")

    def download_data(self, gcs_path: str, local_file_path: str):
        """
        Download data file from GCS.

        Args:
            gcs_path: Path in GCS bucket
            local_file_path: Local destination path
        """
        blob = self.bucket.blob(gcs_path)
        blob.download_to_filename(local_file_path)
        print(f"✓ Downloaded gs://{self.bucket_name}/{gcs_path} to {local_file_path}")


def upload_dataset_to_gcs(bucket_name: str, local_csv_path: str, gcs_path: str):
    """
    Quick helper to upload dataset to GCS.

    Args:
        bucket_name: GCS bucket name
        local_csv_path: Local path to CSV file
        gcs_path: Destination path in GCS
    """
    manager = GCSModelManager(bucket_name)
    manager.upload_data(local_csv_path, gcs_path)
