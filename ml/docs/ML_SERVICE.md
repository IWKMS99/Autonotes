# ML Service

## Конфигурация

Скопируйте `.env.example` в `.env` и измените параметры при необходимости:

```bash
cp .env.example .env
```

## Очереди

Сервис читает сообщения из очереди `ML_REQUEST_QUEUE` и отправляет результат в `BACKEND_URL`.

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