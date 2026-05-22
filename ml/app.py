from fastapi import FastAPI
from .model import load_model, predict
from .schemas import PredictionRequest, PredictionResponse

app = FastAPI(title="Autonotes ML Service")

model = load_model()


@app.post("/predict", response_model=PredictionResponse)
def predict_text(request: PredictionRequest):
    prediction = predict(model, request.text)
    return PredictionResponse(prediction=prediction)