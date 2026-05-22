# 🎓 Autonotes

**Autonotes** — это интеллектуальная платформа для автоматического создания структурированных конспектов из фотографий лекционных досок.

Проект построен на микросервисной архитектуре с использованием паттернов надежности данных (Transactional Outbox) и асинхронного взаимодействия.

---

## 🏗️ Архитектура

Диаграммы **C1–C3** и сценарии (dynamic) в [LikeC4](https://likec4.dev/): [`architecture/`](./architecture/README.md) — `cd architecture && npm install && npm start`.

Проект состоит из следующих компонентов:

1.  **Frontend (`/frontend`)**: React 19 (SPA). Пользовательский интерфейс для загрузки фото, просмотра статусов и готовых конспектов. Реализован polling для обновления статусов в реальном времени.
2.  **Backend (`/backend`)**: Spring Boot 3 (Java 24).
    *   **API Gateway**: REST API для клиента.
    *   **Reliability**: Реализован паттерн **Transactional Outbox** для гарантии доставки событий (At-Least-Once).
    *   **Storage Management**: Встроенный **Garbage Collector** для очистки S3 от "файлов-сирот".
3.  **ML Service**: (Планируется, код пока не в репозитории) Консьюмер RabbitMQ: OCR и суммаризация, результат обратно в очередь.
4.  **Инфраструктура**:
    *   **PostgreSQL**: Хранение пользователей, метаданных заметок и таблицы Outbox.
    *   **MinIO**: S3-совместимое хранилище оригиналов изображений.
    *   **RabbitMQ**: Очередь сообщений (`notes.exchange` -> `notes.process.queue`).

## 🚀 Быстрый старт (Docker Compose)

### Предварительные требования
*   Docker и Docker Compose

### Запуск

1.  Клонируйте репозиторий:
    ```bash
    git clone https://github.com/IWKMS99/Autonotes.git autonotes
    cd autonotes
    ```

2.  Создайте `.env` файл (можно скопировать пример):
    ```bash
    cp .env.example .env
    ```

3.  Запустите **весь стек** (фронтенд, бэкенд и инфраструктуру) одной командой:
    ```bash
    docker compose up --build -d
    ```

По умолчанию запускается **демо-режим** с одним backend-инстансом (`backend-1`).
Кластерный режим с балансировкой на 3 backend-инстанса включается профилем:
```bash
COMPOSE_PROFILES=cluster NGINX_LB_CONFIG=./nginx/nginx.cluster.conf PROMETHEUS_SCRAPE_CONFIG=./monitoring/prometheus.cluster.yml docker compose up --build -d
```

После запуска сервисы доступны по адресам:
*   **Frontend (Приложение)**: `http://localhost:3000`
*   **Backend API (через LB)**: `http://localhost:8090`
*   **Swagger UI (через LB)**: `http://localhost:8090/swagger-ui.html`
*   **MinIO Console**: `http://localhost:9001`
*   **RabbitMQ Console**: `http://localhost:15672`

## 📂 Структура репозитория

*   [`backend/`](./backend/README.md) — Исходный код сервера (Java 24, Spring Boot 3).
*   [`frontend/`](./frontend/README.md) — Исходный код клиента (React 19).
*   `docker-compose.yml` — Оркестрация сервисов.
## 📈 Observability (E2E)

После `docker compose up --build -d` доступны:
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (`admin/admin`)
- **Jaeger UI**: `http://localhost:16686`
- **Kibana**: `http://localhost:5601`

Provisioning выполняется автоматически:
- Grafana datasource + dashboards из `monitoring/grafana/provisioning`.
- Kibana data view `autonotes-logs-*` и базовый dashboard через `kibana-init`.

### Smoke-check
1. Скопируйте env: `cp .env.example .env`.
2. Поднимите стек: `docker compose up --build -d`.
3. Сгенерируйте трафик: `curl http://localhost:8090/api/v1/system/info` (несколько раз).
4. Проверьте:
   - Prometheus targets `autonotes-backend` и `nginx-lb` в состоянии `UP`.
   - Grafana dashboards `Autonotes JVM & Health` и `Autonotes HTTP Overview`.
   - Jaeger traces для backend.
   - Kibana index/data view `autonotes-logs-*` с полями `traceId/spanId`.
