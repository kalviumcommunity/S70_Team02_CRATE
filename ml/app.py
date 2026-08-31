"""
CRATE ML Service — FastAPI Application.

Exposes three analytics endpoints consumed by the Node.js backend:

  POST /predict/contributor   → Retention prediction for one contributor
  POST /score/onboarding      → Onboarding health score for a repository
  POST /recommendations       → Prioritized recommendations for a repository
  GET  /health                → Health check (model loaded status)

Start the server:
    uvicorn app:app --reload --port 8000

Swagger UI:
    http://localhost:8000/docs
"""

import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure the ml/ directory is in the path (for both local and Docker runs)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from schemas.models import (
    ContributorFeatures,
    RetentionPrediction,
    OnboardingScoreRequest,
    OnboardingScoreResponse,
    RepoStats,
    RecommendationsResponse,
    HealthResponse,
)
from core.predict import predict_retention, is_model_loaded
from core.onboarding_score import calculate_onboarding_score
from core.recommendations import generate_recommendations


# ── Startup: auto-train model if not found ────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-generate and train the model on first start if .pkl files are missing."""
    model_path = os.path.join(os.path.dirname(__file__), "models", "retention_model.pkl")
    if not os.path.exists(model_path):
        print("[START] No trained model found - running training pipeline...")
        try:
            from data.generate_sample_data import generate
            generate()

            from models.train_retention import load_data, train_and_evaluate, DATA_PATH
            df = load_data(DATA_PATH)
            train_and_evaluate(df)
            print("[OK] Model trained and ready.")
        except Exception as e:
            print(f"[WARN] Auto-training failed: {e}")
            print("       Run manually: python models/train_retention.py")
    else:
        print("[OK] Trained model found. CRATE ML Service ready.")
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CRATE ML Service",
    description=(
        "Contributor Retention Analytics & Tracking Engine — AI/ML backend. "
        "Provides retention predictions, onboarding scores, and recommendations "
        "for open-source maintainers."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow requests from the Node.js backend (localhost:3000) and frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """
    Check that the ML service is running and the model is loaded.
    The Node.js backend calls this on startup to confirm the ML service is available.
    """
    return {
        "status":       "ok",
        "model_loaded": is_model_loaded(),
        "version":      "1.0.0",
    }


@app.post(
    "/predict/contributor",
    response_model=RetentionPrediction,
    tags=["Predictions"],
    summary="Predict whether a contributor will return",
)
def predict_contributor(features: ContributorFeatures):
    """
    Given a first-time contributor's PR experience features, predict their
    probability of making a future contribution.

    **Input features** are extracted from raw GitHub API data by the backend's
    `featureService.js` before calling this endpoint.

    **Returns:**
    - `return_probability`: float 0.0–1.0
    - `risk_level`: LOW / MEDIUM / HIGH
    - `top_friction_factors`: ranked list of friction signals
    - `explanation`: human-readable explanation
    """
    try:
        result = predict_retention(features.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Model not loaded. {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post(
    "/score/onboarding",
    response_model=OnboardingScoreResponse,
    tags=["Analytics"],
    summary="Calculate repository onboarding health score",
)
def onboarding_score(request: OnboardingScoreRequest):
    """
    Aggregate a list of first-time contributor records into a composite
    onboarding health score (0–100) with 5 dimension breakdowns.

    **Dimensions and weights:**
    - Response Time (30%)
    - PR Experience (25%)
    - Issue Accessibility (20%)
    - Community (15%)
    - Documentation (10%)

    Send all first-time contributors for a repository to get the repo-level score.
    """
    try:
        # Convert Pydantic models to plain dicts
        contributors = [c.model_dump() for c in request.contributors]
        result = calculate_onboarding_score(contributors)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")


@app.post(
    "/recommendations",
    response_model=RecommendationsResponse,
    tags=["Analytics"],
    summary="Generate prioritized maintainer recommendations",
)
def recommendations(stats: RepoStats):
    """
    Given aggregate repository statistics, generate prioritized recommendations
    with specific, actionable steps the maintainer can take.

    Recommendations are ordered HIGH → MEDIUM → LOW priority.
    Each recommendation includes the metric that triggered it.
    """
    try:
        result = generate_recommendations(stats.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


# ── Dev Runner ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
