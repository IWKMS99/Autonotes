# Autonotes

Autonotes - платформа для создания структурированных конспектов из фото учебных материалов.

## Что внутри
- `frontend` (React SPA, FSD) - интерфейс загрузки, просмотра и управления заметками.
- `backend` (Spring Boot) - API, auth, notes, хранение файлов, outbox, обработка результатов ML.
- `ml` (FastAPI worker) - consume/publish в RabbitMQ, формирование результата распознавания.
- инфраструктура: PostgreSQL, MinIO, RabbitMQ, Nginx LB.
- observability: Prometheus, Grafana, Jaeger, Elasticsearch + Logstash + Kibana.

## Архитектура
C4-диаграммы C1/C2/C3 и dynamic-сценарии находятся в [architecture/README.md](./architecture/README.md).

## Быстрый старт
1. Скопируйте переменные окружения:
   - `.env.example` -> `.env`
2. Поднимите стек:
   - `docker compose up --build -d`
3. Для cluster-режима (3 backend-инстанса):
   - `COMPOSE_PROFILES=cluster NGINX_LB_CONFIG=./nginx/nginx.cluster.conf PROMETHEUS_SCRAPE_CONFIG=./monitoring/prometheus.cluster.yml docker compose up --build -d`

## Основные URL
- Frontend: `http://localhost:3000`
- Backend (через LB): `http://localhost:8090`
- Swagger: `http://localhost:8090/swagger-ui.html`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (`admin/admin`)
- Jaeger: `http://localhost:16686`
- Kibana: `http://localhost:5601`

## API-контракт (ключевое)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/notes` (multipart)
- `GET /api/v1/notes?page&size&sort`
- `GET /api/v1/notes/{id}`
- `DELETE /api/v1/notes/{id}`

Пагинация `GET /notes`: `PagedResponseDto<NoteListItemDto>`, с ограничением `size <= 100` и fallback sort `createdAt,desc`.

## Observability-контракт
- публичные actuator endpoints:
  - `/actuator/health`
  - `/actuator/health/**`
  - `/actuator/prometheus`
- MDC и трассировка в логах:
  - `requestId`, `correlationId`, `traceId`, `spanId`, `user`, `instance_id`
- подробный контракт логирования:
  - [docs/logging-contract.md](./docs/logging-contract.md)

## Smoke-check после запуска
1. Сгенерируйте трафик:
   - `curl.exe http://localhost:8090/api/v1/system/info`
2. Проверьте Prometheus targets (`Status -> Targets`):
   - `autonotes-backend` = `UP`
3. Проверьте Grafana dashboards:
   - `Autonotes HTTP Overview`
   - `Autonotes JVM & Health`
4. Проверьте Jaeger traces и Kibana индекс `autonotes-logs-*`.

## Подробности по модулям
- Backend: [backend/README.md](./backend/README.md)
- Frontend: [frontend/README.md](./frontend/README.md)
- Архитектура C4: [architecture/README.md](./architecture/README.md)
