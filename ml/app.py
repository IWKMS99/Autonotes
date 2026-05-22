from fastapi import FastAPI
from ml.model import load_model, predict
from ml.schemas import PredictionRequest, PredictionResponse

app = FastAPI(title="Autonotes ML Service")

model = load_model()


@app.post("/predict", response_model=PredictionResponse)
def predict_text(request: PredictionRequest):
    prediction = predict(model, request.text)
    return PredictionResponse(prediction=prediction)