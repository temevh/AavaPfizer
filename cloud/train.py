"""
Vertex AI training script for initial model training.
This script trains the model on the augmented dataset and saves it to GCS.
"""

import os
import argparse
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
from google.cloud import storage

from .model import MigraineClassifier, CLASS_NAMES, FEATURE_NAMES


class MigraineDataset(Dataset):
    """PyTorch Dataset for migraine data."""

    def __init__(self, features, labels):
        self.features = torch.FloatTensor(features)
        self.labels = torch.LongTensor(labels)

    def __len__(self):
        return len(self.features)

    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]


def load_and_preprocess_data(data_path, target_features=50):
    """Load and preprocess the augmented dataset."""
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)

    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{df['Type'].value_counts()}")

    # Separate features and target
    X = df[FEATURE_NAMES].values
    y = df['Type'].values

    # Pad with zeros to reach target feature count (50)
    current_features = X.shape[1]  # Should be 23
    if current_features < target_features:
        padding_size = target_features - current_features
        zero_padding = np.zeros((X.shape[0], padding_size))
        X = np.hstack([X, zero_padding])
        print(f"\nExpanded features from {current_features} to {target_features}")
        print(f"  - Original features: {current_features}")
        print(f"  - Zero-padded features: {padding_size}")

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    print(f"\nLabel encoding:")
    for i, class_name in enumerate(label_encoder.classes_):
        print(f"  {i}: {class_name}")

    # Scale features (including the zero-padded ones)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y_encoded, label_encoder, scaler


def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for features, labels in dataloader:
        features, labels = features.to(device), labels.to(device)

        # Forward pass
        optimizer.zero_grad()
        outputs = model(features)
        loss = criterion(outputs, labels)

        # Backward pass
        loss.backward()
        optimizer.step()

        # Metrics
        total_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total

    return avg_loss, accuracy


def evaluate(model, dataloader, criterion, device):
    """Evaluate the model."""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for features, labels in dataloader:
            features, labels = features.to(device), labels.to(device)

            outputs = model(features)
            loss = criterion(outputs, labels)

            total_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total

    return avg_loss, accuracy, all_preds, all_labels


def save_model_to_gcs(model, scaler, label_encoder, bucket_name, model_path):
    """Save model artifacts to Google Cloud Storage."""
    print(f"\nSaving model to GCS: gs://{bucket_name}/{model_path}")

    # Save locally first
    os.makedirs("artifacts", exist_ok=True)

    # Save model state dict
    torch.save(model.state_dict(), "artifacts/model.pt")

    # Save scaler and encoder
    joblib.dump(scaler, "artifacts/scaler.pkl")
    joblib.dump(label_encoder, "artifacts/label_encoder.pkl")

    # Upload to GCS
    client = storage.Client()
    bucket = client.bucket(bucket_name)

    for filename in ["model.pt", "scaler.pkl", "label_encoder.pkl"]:
        blob = bucket.blob(f"{model_path}/{filename}")
        blob.upload_from_filename(f"artifacts/{filename}")
        print(f"  Uploaded {filename}")

    print("✓ Model saved successfully")


def main(args):
    """Main training function."""
    print("="*60)
    print("VERTEX AI TRAINING - MIGRAINE CLASSIFIER")
    print("="*60)

    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nUsing device: {device}")

    # Load and preprocess data
    X, y, label_encoder, scaler = load_and_preprocess_data(args.data_path)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTrain set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")

    # Create datasets and dataloaders
    train_dataset = MigraineDataset(X_train, y_train)
    test_dataset = MigraineDataset(X_test, y_test)

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=args.batch_size,
        shuffle=False
    )

    # Initialize model
    model = MigraineClassifier(
        input_dim=X.shape[1],
        hidden_dims=args.hidden_dims,
        num_classes=len(label_encoder.classes_),
        dropout_rate=args.dropout
    ).to(device)

    print(f"\nModel architecture:")
    print(model)
    print(f"\nTotal parameters: {sum(p.numel() for p in model.parameters())}")

    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.learning_rate)

    # Training loop
    print("\n" + "="*60)
    print("TRAINING")
    print("="*60)

    best_val_accuracy = 0
    best_model_state = None

    for epoch in range(args.epochs):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, _, _ = evaluate(model, test_loader, criterion, device)

        print(f"Epoch [{epoch+1}/{args.epochs}] - "
              f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% | "
              f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")

        # Save best model
        if val_acc > best_val_accuracy:
            best_val_accuracy = val_acc
            best_model_state = model.state_dict().copy()

    # Load best model
    model.load_state_dict(best_model_state)

    # Final evaluation
    print("\n" + "="*60)
    print("FINAL EVALUATION")
    print("="*60)

    _, test_acc, y_pred, y_true = evaluate(model, test_loader, criterion, device)

    print(f"\nTest Accuracy: {test_acc:.2f}%")
    print("\nClassification Report:")
    print(classification_report(
        y_true, y_pred,
        target_names=label_encoder.classes_,
        zero_division=0
    ))

    # Save model to GCS
    if args.bucket_name:
        save_model_to_gcs(
            model, scaler, label_encoder,
            args.bucket_name, args.model_path
        )
    else:
        print("\nNo GCS bucket specified, saving locally only")
        torch.save(model.state_dict(), "model.pt")
        joblib.dump(scaler, "scaler.pkl")
        joblib.dump(label_encoder, "label_encoder.pkl")

    print("\n" + "="*60)
    print("✓ TRAINING COMPLETED SUCCESSFULLY")
    print("="*60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train migraine classifier on Vertex AI")

    # Data arguments
    parser.add_argument("--data-path", type=str, required=True,
                        help="Path to augmented dataset CSV")
    parser.add_argument("--bucket-name", type=str, default=None,
                        help="GCS bucket name for model storage")
    parser.add_argument("--model-path", type=str, default="models/migraine-classifier",
                        help="Path within bucket to save model")

    # Model arguments
    parser.add_argument("--hidden-dims", type=int, nargs="+", default=[64, 32],
                        help="Hidden layer dimensions")
    parser.add_argument("--dropout", type=float, default=0.3,
                        help="Dropout rate")

    # Training arguments
    parser.add_argument("--epochs", type=int, default=100,
                        help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32,
                        help="Batch size for training")
    parser.add_argument("--learning-rate", type=float, default=0.001,
                        help="Learning rate")

    args = parser.parse_args()
    main(args)
