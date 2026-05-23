# ML Service

## Конфигурация

Скопируйте `.env.example` в `.env` и измените параметры при необходимости:

```bash
cp .env.example .env
```

## Очереди

Сервис читает `NoteProcessingEvent` из очереди `ML_REQUEST_QUEUE` (`notes.process.queue`), привязанной к exchange `ML_REQUEST_EXCHANGE` с routing key `ML_REQUEST_ROUTING_KEY` (`notes.created`).

Результат публикуется в `ML_RESULT_EXCHANGE` с routing key `ML_RESULT_ROUTING_KEY` (`notes.completed`) в формате `NoteResultDto` (`noteId`, `status`, `recognizedText`, `summaryText`, `errorMessage`). Backend забирает сообщения из `notes.results.queue`.

При ошибках обработки сообщение повторяется до 3 раз, затем уходит в DLQ (`notes.process.dlq`) через `x-dead-letter-exchange` на очереди.

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
