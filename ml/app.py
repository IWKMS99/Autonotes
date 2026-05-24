import asyncio

from fastapi import FastAPI

from ml.model import get_model, predict
from ml.schemas import PredictionRequest, PredictionResponse
from ml.worker import run_consumer

app = FastAPI(title="Autonotes ML Service")


@app.post("/predict", response_model=PredictionResponse)
def predict_endpoint(request: PredictionRequest) -> PredictionResponse:
    return PredictionResponse(prediction=predict(get_model(), request.text))


@app.on_event("startup")
async def startup_event() -> None:
    app.state.consumer_task = asyncio.create_task(run_consumer())


@app.on_event("shutdown")
async def shutdown_event() -> None:
    task = getattr(app.state, "consumer_task", None)
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
