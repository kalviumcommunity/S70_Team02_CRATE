"""
CRATE ML Service — Retention Model Training Script.

Trains a Random Forest classifier on synthetic (or real) contributor data.
Saves the trained model and feature scaler as .pkl files for use by the API.

Run from the ml/ directory:
    python models/train_retention.py

Outputs:
    models/retention_model.pkl   — trained RandomForestClassifier
    models/scaler.pkl            — fitted StandardScaler
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix,
    accuracy_score,
)

# ── Constants ────────────────────────────────────────────────────────────────

FEATURES = [
    "first_response_hours",
    "review_cycles",
    "changes_requested",
    "merge_time_days",
    "pr_comments",
    "ci_failures",
    "is_good_first_issue",
    "had_welcome_message",
]

TARGET = "returned"

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "..", "data", "contributors_synthetic.csv")
MODEL_PATH = os.path.join(BASE_DIR, "retention_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")


# ── Helpers ──────────────────────────────────────────────────────────────────

def load_data(path: str) -> pd.DataFrame:
    """Load CSV data. If synthetic data doesn't exist, generate it first."""
    if not os.path.exists(path):
        print("[WARN] No training data found. Generating synthetic data first...")
        # Import and run the generator
        sys.path.insert(0, os.path.join(BASE_DIR, ".."))
        from data.generate_sample_data import generate
        generate()

    df = pd.read_csv(path)
    print(f"[LOAD] Loaded {len(df)} records from {os.path.basename(path)}")
    return df


def train_and_evaluate(df: pd.DataFrame):
    """Train Random Forest + Logistic Regression, compare, save best model."""

    X = df[FEATURES].values
    y = df[TARGET].values

    # ── Split ────────────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # ── Scale ────────────────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    # ── Random Forest ────────────────────────────────────────────────────────
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=10,
        class_weight="balanced",   # handles class imbalance
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X_train_s, y_train)
    rf_proba = rf.predict_proba(X_test_s)[:, 1]
    rf_pred  = rf.predict(X_test_s)
    rf_auc   = roc_auc_score(y_test, rf_proba)

    # ── Logistic Regression (baseline comparison) ─────────────────────────────
    lr = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    lr.fit(X_train_s, y_train)
    lr_proba = lr.predict_proba(X_test_s)[:, 1]
    lr_auc   = roc_auc_score(y_test, lr_proba)

    # ── Report ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  CRATE RETENTION MODEL — TRAINING RESULTS")
    print("=" * 60)
    print(f"\n  Class distribution:")
    print(f"    Returned    : {y.sum()} ({y.mean():.1%})")
    print(f"    Not returned: {(1-y).sum()} ({(1-y).mean():.1%})")
    print(f"\n  Random Forest   AUC-ROC: {rf_auc:.4f}  Acc: {accuracy_score(y_test, rf_pred):.4f}")
    print(f"  Logistic Reg.   AUC-ROC: {lr_auc:.4f}")

    print("\n  Random Forest — Classification Report:")
    print(classification_report(y_test, rf_pred, target_names=["Churned", "Returned"]))

    # ── Feature Importances ──────────────────────────────────────────────────
    importances = rf.feature_importances_
    feat_imp = sorted(zip(FEATURES, importances), key=lambda x: x[1], reverse=True)
    print("\n  Feature Importances (Random Forest):")
    for feat, imp in feat_imp:
        bar = "█" * int(imp * 60)
        print(f"    {feat:<30} {imp:.4f}  {bar}")

    # ── Cross-validation ─────────────────────────────────────────────────────
    cv_scores = cross_val_score(rf, X_train_s, y_train, cv=5, scoring="roc_auc")
    print(f"\n  5-Fold CV AUC: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ── Save ─────────────────────────────────────────────────────────────────
    joblib.dump(rf, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"\n  [OK] Model saved  -> {MODEL_PATH}")
    print(f"  [OK] Scaler saved -> {SCALER_PATH}")
    print("=" * 60 + "\n")

    return rf, scaler, feat_imp


if __name__ == "__main__":
    df = load_data(DATA_PATH)
    train_and_evaluate(df)
