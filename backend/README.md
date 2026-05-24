# Autonotes Backend

Backend-сервис платформы Autonotes на Spring Boot.

## Основные функции
- JWT-аутентификация и авторизация.
- Управление заметками и файлами изображений.
- Интеграция с MinIO (S3 API).
- Асинхронная обработка через RabbitMQ.
- Transactional Outbox (at-least-once доставка в ML-пайплайн).
- Обработка результатов ML через `notes.completed`.
- Фоновые задачи: cleanup soft-delete, cleanup orphaned S3-файлов, timeout processing.

## API (основной контракт)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/notes`
- `GET /api/v1/notes?page&size&sort`
- `GET /api/v1/notes/{id}`
- `DELETE /api/v1/notes/{id}`

`GET /api/v1/notes` возвращает `PagedResponseDto<NoteListItemDto>`.
Ограничения:
- `size` ограничен верхней границей `100`
- неподдерживаемый `sort` заменяется на `createdAt,desc`

## Observability и безопасность
- Публично доступны только:
  - `/actuator/health`
  - `/actuator/health/**`
  - `/actuator/prometheus`
- Остальные actuator endpoints закрыты security-правилами.
- В логах используется MDC-контракт:
  - `requestId`, `correlationId`, `traceId`, `spanId`, `user`, `instance_id`
- Детали контракта:
  - [../docs/logging-contract.md](../docs/logging-contract.md)

## Локальный запуск
1. Из корня репозитория поднимите инфраструктуру:
   - `docker compose up -d db minio rabbitmq`
2. В папке `backend`:
   - `./gradlew bootRun`

Для полного стека используйте запуск из корня проекта:
- `docker compose up --build -d`

## Проверка метрик
- `http://localhost:8081/actuator/prometheus` (если запускаете backend отдельно)
- В compose-режиме через LB чаще используйте `http://localhost:8090/actuator/prometheus`.

Smoke PromQL:
- `up{job="autonotes-backend"}`
- `http_server_requests_seconds_count`
- `http_server_requests_seconds_bucket`
- `jvm_memory_used_bytes`
- `hikaricp_connections_active`

## Тесты
- Все backend-тесты:
  - `./gradlew test`
- Полная проверка (включая quality gates):
  - `./gradlew check`

## Документация
- Swagger UI: `http://localhost:8080/swagger-ui.html` (локальный запуск backend)
- C4-архитектура: [../architecture/README.md](../architecture/README.md)
