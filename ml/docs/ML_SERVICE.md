# ML Service

## Запуск локально

Из корня репозитория:
```bash
python -m uvicorn ml.app:app --reload --port 8000
```

> Важно: `ml/app.py` использует относительные импорты (`from .model ...`, `from .schemas ...`), поэтому запуск `python -m uvicorn app:app` из каталога `ml` не будет работать.

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