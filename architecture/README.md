# Autonotes Architecture (LikeC4)

Архитектура проекта описана в формате C4 (C1/C2/C3 + Dynamic) через LikeC4.

## Цели архитектуры
- Явно зафиксировать границы frontend/backend/ml.
- Показать синхронные и асинхронные контракты.
- Поддерживать актуальность схем относительно production-кода.

## Набор диаграмм
- `c1_system_context` - контекст системы и пользователь.
- `c2_containers` - контейнеры платформы.
- `c2_async_processing` - цепочка outbox -> rabbitmq -> ml -> result.
- `c3_backend` - внутренние компоненты backend.
- `c3_frontend` - FSD-компоненты frontend.
- `c3_ml` - компоненты ML-сервиса (consumer/pipeline/publisher).
- `dynamic_auth` - сценарий register/login.
- `dynamic_create_note` - сценарий upload -> processing -> completed.

## Запуск локального viewer
1. `cd architecture`
2. `npm install`
3. `npm start`

## Экспорт PNG
- `npm run export:png`

Файлы экспорта появятся в `architecture/dist/src`.

## Контракты, отраженные в C4
### REST
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/notes`
- `GET /api/v1/notes?page&size&sort`
- `GET /api/v1/notes/{id}`
- `DELETE /api/v1/notes/{id}`

### Async
- Backend publish: `NoteProcessingEvent` в `notes.process.queue` (routing `notes.created`).
- ML publish: `NoteResultDto` в `notes.results.queue` (routing `notes.completed`).

### Observability
- Метрики: `/actuator/prometheus`
- Трассировка/логи: `requestId`, `correlationId`, `traceId`, `spanId`

## Файлы модели
- `src/_spec.c4`
- `src/model.c4`
- `src/model-components-backend.c4`
- `src/model-components-frontend.c4`
- `src/model-components-ml.c4`
- `src/model.views.c4`
- `src/model.views-c3.c4`
- `src/model.views-dynamic.c4`
