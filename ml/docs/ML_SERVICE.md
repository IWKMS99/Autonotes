# ML Service

## Конфигурация

Скопируйте `.env.example` в `.env` и при необходимости измените значения:

```bash
cp .env.example .env
```

## Запуск локально

Из корня репозитория:
```bash
python -m uvicorn ml.app:app --reload --port 8000
```

## Запуск в Docker
```bash
docker-compose up ml
```

## API
- `POST /predict`
  - Request: `{"text": "string"}`
  - Response: `{"prediction": "string"}`

## Тесты
```bash
pytest ml/tests/
```