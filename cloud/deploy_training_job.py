"""
Script to deploy a training job to Vertex AI.
This submits the training script to run on Google Cloud infrastructure.
"""

import argparse
from google.cloud import aiplatform
from datetime import datetime


def submit_training_job(
    project_id: str,
    location: str,
    bucket_name: str,
    dataset_gcs_path: str,
    display_name: str = None,
    machine_type: str = "n1-standard-4",
    accelerator_type: str = None,
    accelerator_count: int = 0,
):
    """
    Submit a custom training job to Vertex AI.

    Args:
        project_id: GCP project ID
        location: GCP region (e.g., 'us-central1')
        bucket_name: GCS bucket name for model output
        dataset_gcs_path: GCS path to the dataset CSV
        display_name: Name for the training job
        machine_type: VM machine type
        accelerator_type: GPU type (e.g., 'NVIDIA_TESLA_T4')
        accelerator_count: Number of GPUs
    """

    # Initialize Vertex AI
    aiplatform.init(project=project_id, location=location, staging_bucket=f"gs://{bucket_name}")

    # Generate job name
    if display_name is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        display_name = f"migraine-classifier-{timestamp}"

    print("="*60)
    print("SUBMITTING VERTEX AI TRAINING JOB")
    print("="*60)
    print(f"Project: {project_id}")
    print(f"Location: {location}")
    print(f"Job Name: {display_name}")
    print(f"Machine Type: {machine_type}")
    if accelerator_type:
        print(f"Accelerator: {accelerator_type} x{accelerator_count}")
    print(f"Dataset: gs://{bucket_name}/{dataset_gcs_path}")
    print("="*60)

    # Define the custom training job
    job = aiplatform.CustomPythonPackageTrainingJob(
        display_name=display_name,
        python_package_gcs_uri=f"gs://{bucket_name}/trainer.tar.gz",  # Will need to package this
        python_module_name="train",
        container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-13.py310:latest"
        if accelerator_type
        else "us-docker.pkg.dev/vertex-ai/training/pytorch-cpu.1-13.py310:latest",
    )

    # Submit the job
    model = job.run(
        replica_count=1,
        machine_type=machine_type,
        accelerator_type=accelerator_type,
        accelerator_count=accelerator_count,
        args=[
            f"--data-path=gs://{bucket_name}/{dataset_gcs_path}",
            f"--bucket-name={bucket_name}",
            "--model-path=models/migraine-classifier",
            "--epochs=100",
            "--batch-size=32",
            "--learning-rate=0.001",
        ],
    )

    print("\n✓ Training job submitted successfully!")
    print(f"Job resource name: {job.resource_name}")
    print(f"\nMonitor at: https://console.cloud.google.com/vertex-ai/training/custom-jobs?project={project_id}")

    return job


def submit_training_job_simple(
    project_id: str,
    location: str,
    bucket_name: str,
    dataset_gcs_path: str,
):
    """
    Simplified version using CustomContainerTrainingJob for easier setup.
    This doesn't require packaging the code as a Python package.
    """

    aiplatform.init(project=project_id, location=location, staging_bucket=f"gs://{bucket_name}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    display_name = f"migraine-classifier-{timestamp}"

    print("="*60)
    print("SUBMITTING VERTEX AI CUSTOM CONTAINER JOB")
    print("="*60)
    print(f"Project: {project_id}")
    print(f"Location: {location}")
    print(f"Job Name: {display_name}")
    print("="*60)

    # Using custom container approach
    job = aiplatform.CustomContainerTrainingJob(
        display_name=display_name,
        container_uri="gcr.io/cloud-aiplatform/training/pytorch-gpu.1-13:latest",
        command=["python", "train.py"],
        model_serving_container_image_uri="gcr.io/cloud-aiplatform/prediction/pytorch-gpu.1-13:latest",
    )

    # Submit the job
    job.run(
        replica_count=1,
        machine_type="n1-standard-4",
        args=[
            f"--data-path=gs://{bucket_name}/{dataset_gcs_path}",
            f"--bucket-name={bucket_name}",
            "--model-path=models/migraine-classifier",
        ],
    )

    print("\n✓ Training job submitted!")
    return job


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Submit training job to Vertex AI")

    parser.add_argument("--project-id", type=str, required=True,
                        help="GCP project ID")
    parser.add_argument("--location", type=str, default="us-central1",
                        help="GCP region")
    parser.add_argument("--bucket-name", type=str, required=True,
                        help="GCS bucket name")
    parser.add_argument("--dataset-path", type=str, default="data/augmented_dataset.csv",
                        help="Path to dataset in GCS bucket")
    parser.add_argument("--machine-type", type=str, default="n1-standard-4",
                        help="Machine type")
    parser.add_argument("--gpu", action="store_true",
                        help="Use GPU for training")

    args = parser.parse_args()

    accelerator_type = "NVIDIA_TESLA_T4" if args.gpu else None
    accelerator_count = 1 if args.gpu else 0

    submit_training_job(
        project_id=args.project_id,
        location=args.location,
        bucket_name=args.bucket_name,
        dataset_gcs_path=args.dataset_path,
        machine_type=args.machine_type,
        accelerator_type=accelerator_type,
        accelerator_count=accelerator_count,
    )
