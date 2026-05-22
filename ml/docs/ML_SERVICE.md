# ML Service

## Запуск локально

Из папки `ml`:
```bash
cd ml
python -m uvicorn app:app --reload --port 8000
```

Или из корня репозитория:
```bash
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