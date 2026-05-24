from __future__ import annotations

from fastapi import FastAPI

from ml.model import get_model, predict
from ml.schemas import PredictionRequest, PredictionResponse
from ml.worker import run_consumer

app = FastAPI(title="Autonotes ML Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
