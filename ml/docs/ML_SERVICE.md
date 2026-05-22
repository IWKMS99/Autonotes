# ML Service

## Запуск локально
```bash
cd ml
pip install -r requirements.txt
python -m uvicorn ml.app:app --reload --port 8000
```

## Запуск в Docker
```bash
docker-compose up ml
```

## API
- `POST /predict` — предсказание текста
  - Request: `{"text": "string"}`
  - Response: `{"prediction": "string"}`

## Тесты
```bash
pytest ml/tests/
```