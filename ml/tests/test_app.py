from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_predict_endpoint():
    response = client.post("/predict", json={"text": "hello"})
    assert response.status_code == 200
    assert response.json() == {"prediction": "predicted for: hello"}