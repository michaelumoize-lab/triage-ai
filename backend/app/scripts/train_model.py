"""
Train the Random Forest model for symptom-based disease prediction.

Usage:
    python scripts/train_model.py
    python scripts/train_model.py --with-feedback  # include feedback data

The script loads the original dataset, optionally merges feedback, trains a model,
evaluates it, and saves the model, label encoder, and feature columns.
"""

import pandas as pd
import numpy as np
import joblib
import json
import logging
from pathlib import Path
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
import argparse
import sys

# ============================================================
# Setup logging
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ============================================================
# Configuration
# ============================================================
BASE_DIR = Path(__file__).parent.parent
DATA_PATH = BASE_DIR / "data" / "symbipredict_2022.csv"
FEEDBACK_PATH = BASE_DIR / "data" / "feedback_data.csv"  # optional
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_SEED = 42
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.1  # fraction of training set used for validation
N_ESTIMATORS = 100
MAX_DEPTH = 15

# ============================================================
# Helper functions
# ============================================================

def load_dataset(path: Path) -> pd.DataFrame:
    """Load the main dataset."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    df = pd.read_csv(path)
    logger.info(f"Loaded {len(df)} rows from {path.name}")
    return df

def load_feedback_data(path: Path) -> pd.DataFrame | None:
    """Load feedback data if available."""
    if path.exists():
        df = pd.read_csv(path)
        logger.info(f"Loaded {len(df)} feedback rows from {path.name}")
        return df
    return None

def preprocess_data(df: pd.DataFrame, feedback_df: pd.DataFrame | None = None) -> tuple[pd.DataFrame, pd.Series]:
    """
    Combine original data with feedback and return features (X) and labels (y).
    Normalises labels by stripping whitespace to avoid trailing spaces.
    """
    # Original features and target – strip whitespace from prognosis labels
    X_orig = df.drop("prognosis", axis=1)
    y_orig = df["prognosis"].astype(str).str.strip()  # <-- Normalise labels

    if feedback_df is not None and not feedback_df.empty:
        # Feedback data: ensure it has the same symptom columns + 'actualDisease'
        # Strip whitespace from actualDisease as well
        X_fb = feedback_df.drop("actualDisease", axis=1)
        y_fb = feedback_df["actualDisease"].astype(str).str.strip()  # <-- Normalise feedback labels

        X = pd.concat([X_orig, X_fb], axis=0, ignore_index=True)
        y = pd.concat([y_orig, y_fb], axis=0, ignore_index=True)
        logger.info(f"Combined dataset: {len(X)} rows ({len(X_orig)} original + {len(X_fb)} feedback)")
    else:
        X, y = X_orig, y_orig

    # Ensure all columns are numeric (symptom values are 0/1)
    X = X.astype(np.uint8)
    return X, y

def train_model(X_train, y_train_enc, X_val, y_val_enc):
    """
    Train a Random Forest model with optional early stopping via validation set.
    """
    logger.info("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=N_ESTIMATORS,
        max_depth=MAX_DEPTH,
        random_state=RANDOM_SEED,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train_enc)

    # Evaluate on validation set
    val_pred = model.predict(X_val)
    val_acc = accuracy_score(y_val_enc, val_pred)
    logger.info(f"Validation accuracy: {val_acc:.4f}")

    return model, val_acc

def evaluate_model(model, X_test, y_test_enc, label_encoder):
    """
    Evaluate model on the test set and return metrics.
    """
    y_pred = model.predict(X_test)
    y_pred_labels = label_encoder.inverse_transform(y_pred)
    y_test_labels = label_encoder.inverse_transform(y_test_enc)

    metrics = {
        "accuracy": accuracy_score(y_test_enc, y_pred),
        "precision_macro": precision_score(y_test_enc, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_test_enc, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_test_enc, y_pred, average="macro", zero_division=0),
    }
    logger.info(f"Test accuracy: {metrics['accuracy']:.4f}")
    logger.info(f"Macro Precision: {metrics['precision_macro']:.4f}")
    logger.info(f"Macro Recall: {metrics['recall_macro']:.4f}")
    logger.info(f"Macro F1: {metrics['f1_macro']:.4f}")

    # Full classification report
    report = classification_report(y_test_labels, y_pred_labels, output_dict=True)
    return metrics, report

def save_artifacts(model, label_encoder, feature_columns, metrics, report, val_acc):
    """
    Save model, encoders, and metadata.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version = "v1"

    # Save model files
    joblib.dump(model, MODEL_DIR / "triage_model.pkl")
    joblib.dump(label_encoder, MODEL_DIR / "label_encoder.pkl")
    joblib.dump(feature_columns, MODEL_DIR / "symptom_columns.pkl")

    # Save metadata
    metadata = {
        "version": version,
        "timestamp": timestamp,
        "test_accuracy": metrics["accuracy"],
        "validation_accuracy": val_acc,
        "precision_macro": metrics["precision_macro"],
        "recall_macro": metrics["recall_macro"],
        "f1_macro": metrics["f1_macro"],
        "n_features": len(feature_columns),
        "n_classes": len(label_encoder.classes_),
        "classes": label_encoder.classes_.tolist(),
        "random_seed": RANDOM_SEED,
        "test_size": TEST_SIZE,
        "validation_size": VALIDATION_SIZE,
        "n_estimators": N_ESTIMATORS,
        "max_depth": MAX_DEPTH,
        "classification_report": report,
    }
    with open(MODEL_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"✅ All artifacts saved to {MODEL_DIR}")
    logger.info(f"Metadata saved to model_metadata.json")

    # Print top 5 feature importances
    importances = model.feature_importances_
    top_indices = np.argsort(importances)[-5:][::-1]
    logger.info("Top 5 most important symptoms:")
    for idx in top_indices:
        logger.info(f"  - {feature_columns[idx]}: {importances[idx]:.4f}")

# ============================================================
# Main training pipeline
# ============================================================

def train_pipeline(with_feedback: bool = False):
    """Execute the full training pipeline."""
    logger.info("=" * 60)
    logger.info("Starting model training pipeline")
    logger.info("=" * 60)

    # 1. Load data
    df = load_dataset(DATA_PATH)
    feedback_df = load_feedback_data(FEEDBACK_PATH) if with_feedback else None

    # 2. Preprocess (labels are normalised inside)
    X, y = preprocess_data(df, feedback_df)
    feature_columns = X.columns.tolist()
    logger.info(f"Feature columns: {len(feature_columns)}")

    # 3. Encode labels
    label_encoder = LabelEncoder()
    y_enc = label_encoder.fit_transform(y)
    logger.info(f"Unique diseases: {len(label_encoder.classes_)}")
    # Log the first few labels to verify they are clean
    logger.info(f"Sample disease labels (first 5): {label_encoder.classes_[:5].tolist()}")

    # 4. Split data (stratified)
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y_enc, test_size=TEST_SIZE, random_state=RANDOM_SEED, stratify=y_enc
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=VALIDATION_SIZE, random_state=RANDOM_SEED, stratify=y_temp
    )
    logger.info(f"Training: {len(X_train)}, Validation: {len(X_val)}, Test: {len(X_test)}")

    # 5. Train model
    model, val_acc = train_model(X_train, y_train, X_val, y_val)

    # 6. Evaluate on test set
    metrics, report = evaluate_model(model, X_test, y_test, label_encoder)

    # 7. Save artifacts
    save_artifacts(model, label_encoder, feature_columns, metrics, report, val_acc)

    # 8. Cross-validation
    cv_scores = cross_val_score(model, X, y_enc, cv=5, scoring='accuracy')
    logger.info(f"Cross-validation accuracy (mean ± std): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    logger.info("=" * 60)
    logger.info("✅ Training pipeline completed successfully")
    logger.info("=" * 60)

    return model, label_encoder

# ============================================================
# CLI entry point
# ============================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the disease prediction model.")
    parser.add_argument(
        "--with-feedback",
        action="store_true",
        help="Include feedback data for retraining"
    )
    args = parser.parse_args()

    try:
        train_pipeline(with_feedback=args.with_feedback)
    except Exception as e:
        logger.error(f"Training failed: {e}")
        sys.exit(1)