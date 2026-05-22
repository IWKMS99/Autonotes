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
    git clone https://github.com/NothingRedMouth/Autonotes.git autonotes
    cd autonotes
    ```

2.  Создайте `.env` файл (можно скопировать пример):
    ```bash
    cp .env.example .env
    ```

3.  Запустите **весь стек** (фронтенд, бэкенд и инфраструктуру) одной командой:
    ```bash
    docker-compose up --build -d
    ```

После запуска сервисы доступны по адресам:
*   **Frontend (Приложение)**: `http://localhost:3000`
*   **Backend API**: `http://localhost:8080`
*   **Swagger UI**: `http://localhost:8080/swagger-ui.html`
*   **MinIO Console**: `http://localhost:9001`
*   **RabbitMQ Console**: `http://localhost:15672`

## 📂 Структура репозитория

*   [`backend/`](./backend/README.md) — Исходный код сервера (Java 24, Spring Boot 3).
*   [`frontend/`](./frontend/README.md) — Исходный код клиента (React 19).
*   `docker-compose.yml` — Оркестрация сервисов.