from fastapi import FastAPI
from .model import load_model, predict
from .schemas import PredictionRequest, PredictionResponse
from .worker import run_consumer

app = FastAPI(title="Autonotes ML Service")

model = load_model()


@app.post("/predict", response_model=PredictionResponse)
def predict_text(request: PredictionRequest):
    prediction = predict(model, request.text)
    return PredictionResponse(prediction=prediction)


@app.on_event("startup")
async def startup_event() -> None:
    app.state.consumer_task = app.loop.create_task(run_consumer())


@app.on_event("shutdown")
async def shutdown_event() -> None:
    task = getattr(app.state, "consumer_task", None)
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass