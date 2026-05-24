from __future__ import annotations

from fastapi import FastAPI

try:
    from model import get_model, predict
    from schemas import PredictionRequest, PredictionResponse
    from worker import run_consumer
except ModuleNotFoundError:
    from model import get_model, predict
    from schemas import PredictionRequest, PredictionResponse
    from worker import run_consumer

app = FastAPI(title="Autonotes ML Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
