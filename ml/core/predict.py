"""
CRATE ML Service — Retention Prediction.

Loads the trained Random Forest model and produces:
  - return_probability (0.0 – 1.0)
  - risk_level (LOW | MEDIUM | HIGH)
  - top_friction_factors (ranked list of problematic features)
  - explanation (human-readable string)
"""

import os
import joblib
import numpy as np
from typing import Dict, Any, List, Tuple, Optional

# ── Model Loading ─────────────────────────────────────────────────────────────

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "..", "models", "retention_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "..", "models", "scaler.pkl")

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

_model  = None
_scaler = None


def _load_model():
    """Lazy-load model and scaler on first call. Raises if not trained yet."""
    global _model, _scaler
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. "
                "Run:  python models/train_retention.py"
            )
        _model  = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
    return _model, _scaler


def is_model_loaded() -> bool:
    try:
        _load_model()
        return True
    except FileNotFoundError:
        return False


# ── Risk Thresholds ───────────────────────────────────────────────────────────

def _risk_level(prob: float) -> str:
    """
    Map return probability to risk level.
    Lower probability of returning = higher risk of churn.
    """
    if prob >= 0.60:
        return "LOW"
    elif prob >= 0.35:
        return "MEDIUM"
    else:
        return "HIGH"


# ── Friction Factor Analysis ─────────────────────────────────────────────────

# Thresholds that define "bad" values per feature (triggers friction flag)
FRICTION_THRESHOLDS = {
    "first_response_hours": 48,    # > 48h first response is concerning
    "review_cycles":         3,    # > 3 rounds is frustrating
    "changes_requested":     2,    # > 2 change requests discourages newcomers
    "merge_time_days":      14,    # > 14 days to merge is very slow
    "ci_failures":           1,    # any CI failure on a first PR is a red flag
    "is_good_first_issue":   0,    # if NOT a good-first-issue, flag it
    "had_welcome_message":   0,    # if NO welcome, flag it
}

FEATURE_LABELS = {
    "first_response_hours": "Slow initial response time",
    "review_cycles":        "Too many review round-trips",
    "changes_requested":    "Excessive change requests",
    "merge_time_days":      "Very long time to merge",
    "pr_comments":          "Low engagement in PR discussion",
    "ci_failures":          "CI failures on first PR",
    "is_good_first_issue":  "Issue not labeled as beginner-friendly",
    "had_welcome_message":  "No welcoming message from maintainer",
}


def _top_friction_factors(features: Dict[str, Any], model, scaler) -> List[str]:
    """
    Identify which features are both:
    1. Above their "bad" threshold (actual friction present), AND
    2. Highly important to the model (feature importances).

    Returns up to 3 friction factors, most impactful first.
    """
    importances = dict(zip(FEATURES, model.feature_importances_))
    friction = []

    for feat, threshold in FRICTION_THRESHOLDS.items():
        val = features.get(feat, 0)
        is_bad = val > threshold if feat not in ("is_good_first_issue", "had_welcome_message") else val == 0
        if is_bad:
            friction.append((feat, importances.get(feat, 0)))

    # Sort by model importance (most impactful friction first)
    friction.sort(key=lambda x: x[1], reverse=True)
    return [FEATURE_LABELS[f] for f, _ in friction[:3]]


def _build_explanation(prob: float, risk: str, friction: List[str]) -> str:
    """Generate a plain-English explanation of the prediction."""
    pct = int(prob * 100)

    if risk == "LOW":
        base = (
            f"This contributor has a {pct}% estimated probability of returning. "
            "Their onboarding experience appears smooth — "
            "fast responses, manageable review cycles, and a welcoming environment."
        )
    elif risk == "MEDIUM":
        base = (
            f"This contributor has a {pct}% estimated probability of returning. "
            "Their experience shows some friction points that may reduce engagement."
        )
    else:
        base = (
            f"This contributor has only a {pct}% estimated probability of returning. "
            "Their first contribution experience shows significant friction signals "
            "that are associated with contributor churn."
        )

    if friction:
        base += f" Key friction areas: {', '.join(friction).lower()}."

    base += " (This is a prediction based on historical patterns, not a certainty.)"
    return base


# ── Public API ────────────────────────────────────────────────────────────────

def predict_retention(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict whether a contributor will return.

    Args:
        features: dict matching ContributorFeatures schema keys

    Returns:
        dict matching RetentionPrediction schema
    """
    model, scaler = _load_model()

    # Build feature vector in the correct order
    x = np.array([[features[f] for f in FEATURES]], dtype=float)
    x_scaled = scaler.transform(x)

    prob = float(model.predict_proba(x_scaled)[0, 1])
    risk = _risk_level(prob)
    friction = _top_friction_factors(features, model, scaler)
    explanation = _build_explanation(prob, risk, friction)

    return {
        "return_probability": round(prob, 4),
        "risk_level":         risk,
        "top_friction_factors": friction,
        "explanation":         explanation,
    }
