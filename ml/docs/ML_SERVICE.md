# ML Service

Асинхронный worker: RabbitMQ → MinIO → Ollama (Qwen2.5-VL) → RabbitMQ.

## Предварительные требования

1. **Ollama** на хосте с GPU:
   ```bash
   ollama pull qwen2.5vl:7b
   ollama serve
   ```

2. Инфраструктура Autonotes (PostgreSQL, RabbitMQ, MinIO, backend) — через `docker-compose`.

## Конфигурация

Скопируйте `.env.example` в `.env` в корне репозитория. Ключевые переменные ML:

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `OLLAMA_BASE_URL` | URL Ollama API | `http://localhost:11434` |
| `OLLAMA_MODEL` | Модель | `qwen2.5vl:7b` |
| `OLLAMA_TIMEOUT_SEC` | Таймаут запроса (сек) | `300` |
| `OLLAMA_MULTI_IMAGE_MODE` | `batch` или `sequential` | `batch` |
| `RABBITMQ_HOST` | Хост RabbitMQ | `rabbitmq` (в Docker) |
| `MINIO_ENDPOINT` | URL MinIO | `http://minio:9000` |
| `MINIO_BUCKET` | Bucket с изображениями | `lecture-notes` |
| `ML_PORT` | Порт `/health` | `8000` |

Из Docker worker обращается к Ollama на хосте через `http://host.docker.internal:11434`.

## Запуск

### Docker (рекомендуется)

```bash
docker-compose up -d ml
```

### Локально (разработка)

Из корня репозитория:

```bash
pip install -r ml/requirements.txt
set PYTHONPATH=.   # Windows
# export PYTHONPATH=.  # Linux/macOS
python -m ml.worker
```

## Pipeline

1. Consumer читает `NoteProcessingEvent` из `notes.process.queue`.
2. S3 client скачивает изображения из MinIO по `filePaths`.
3. **OCR**: vision-запрос к Ollama → `recognizedText`.
4. **Summary**: text-запрос к Ollama → `summaryText`.
5. Publisher отправляет `NoteResultDto` в `notes.exchange` / `notes.completed`.

## API

- `GET /health` — проверка живости (порт `ML_PORT`).

## Тесты

```bash
pip install -r ml/requirements.txt
pytest ml/tests/
```
