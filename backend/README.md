# Autonotes Backend

[![Java CI with Gradle](https://github.com/IWKMS99/Autonotes/actions/workflows/gradle.yml/badge.svg)](https://github.com/IWKMS99/Autonotes/actions/workflows/gradle.yml)

Бэкенд-сервис платформы "Autonotes". Обеспечивает безопасное хранение данных, управление файлами и надежную интеграцию с ML-сервисом.

## 🚀 Функциональность

*   **Аутентификация и Безопасность:**
    *   JWT Access Token (Stateless).
    *   Кэширование UserDetails для снижения нагрузки на БД.
    *   **Rate Limiting** (Resilience4j) на эндпоинте входа.
    *   Валидация файлов через **Apache Tika** (проверка magic bytes).

*   **Надежность данных (Architecture Patterns):**
    *   **Transactional Outbox**: Сохранение заметки в БД и события в `outbox_events` происходит в одной транзакции. События отправляются в RabbitMQ отдельным фоновым процессом, что гарантирует консистентность даже при падении брокера.
    *   **At-Least-Once Delivery**: Гарантия доставки сообщений для ML-обработки.

*   **Управление хранилищем (S3/MinIO):**
    *   Загрузка и скачивание изображений.
    *   **Compensating Transactions**: Удаление файла при ошибке записи в БД.
    *   **Garbage Collector**: Фоновая очистка "файлов-сирот" (файлов в S3, на которые нет ссылок в БД), возникающих при сбоях.

*   **Observability:**
    *   Сквозное логирование с `RequestId` (MDC).
    *   Мониторинг медленных запросов через AOP.

## 🛠️ Технологический стек

*   **Java:** 24 (с включенными Virtual Threads)
*   **Framework:** Spring Boot 3.5.7
*   **Database:** PostgreSQL 16 + Flyway Migration
*   **Storage:** MinIO (AWS S3 SDK v2)
*   **Messaging:** RabbitMQ
*   **Testing:** Testcontainers (Postgres, MinIO, RabbitMQ), ArchUnit

## ⚙️ Запуск локально

1.  **Инфраструктура:**
    В корне проекта выполните:
    ```bash
    docker compose up -d db minio rabbitmq
    ```
2.  **Приложение:**
    ```bash
    ./gradlew bootRun
    ```

### Docker Compose режимы backend

- По умолчанию в проекте запускается один backend-инстанс (`backend-1`) для легкой демо-сборки.
- Кластерный режим (3 backend-инстанса за `nginx-lb`) включается профилем:
  ```bash
  COMPOSE_PROFILES=cluster NGINX_LB_CONFIG=./nginx/nginx.cluster.conf PROMETHEUS_SCRAPE_CONFIG=./monitoring/prometheus.cluster.yml docker compose up --build -d
  ```

## 🔑 Конфигурация (Переменные окружения)

Основные параметры `application.properties`:

### Основные
| Переменная          | Описание                                           | По умолчанию |
|:--------------------|:---------------------------------------------------|:-------------|
| `SERVER_PORT`       | Порт приложения.                                   | `8080`       |
| `JWT_SECRET`        | **(Обязательно)** Base64 ключ для подписи токенов. | *Нет*        |
| `JWT_EXPIRATION_MS` | Время жизни токена (мс).                           | `86400000`   |

### База данных
| Переменная                      | Описание                                                                     | По умолчанию                                 |
|:--------------------------------|:-----------------------------------------------------------------------------|:---------------------------------------------|
| `SPRING_DATASOURCE_URL`         | JDBC URL.                                                                    | `jdbc:postgresql://localhost:5432/autonotes` |
| `SPRING_DATASOURCE_USERNAME`    | Пользователь БД.                                                             | `myuser`                                     |
| `SPRING_DATASOURCE_PASSWORD`    | Пароль БД.                                                                   | `mypassword`                                 |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Управление схемой Hibernate (рекомендуется `none` при использовании Flyway). | `none`                                       |

### Файловое хранилище (S3)
| Переменная         | Описание       | По умолчанию    |
|:-------------------|:---------------|:----------------|
| `MINIO_ENDPOINT`   | URL API MinIO. | *Нет*           |
| `MINIO_ACCESS_KEY` | Access Key.    | *Нет*           |
| `MINIO_SECRET_KEY` | Secret Key.    | *Нет*           |
| `aws.s3.bucket`    | Имя бакета.    | `lecture-notes` |

### Планировщик и Фоновые задачи
| Переменная                                | Описание                                                              | По умолчанию         |
|:------------------------------------------|:----------------------------------------------------------------------|:---------------------|
| `app.scheduling.outbox-interval-ms`       | Интервал отправки событий из Outbox таблицы в RabbitMQ (мс).          | `2000`               |
| `app.scheduling.s3-cleanup-cron`          | CRON для запуска сборщика мусора S3.                                  | `0 0 3 * * *` (3:00) |
| `app.scheduling.cleanup-retention-hours`  | Время в часах, после которого файл без ссылки в БД считается мусором. | `24`                 |
| `app.notes.processing-timeout-minutes`    | Таймаут, после которого статус `PROCESSING` меняется на `FAILED`.     | `10`                 |
| `app.notes.soft-delete-retention-days`    | Срок хранения удаленных заметок (дней) перед физическим удалением.    | `30`                 |
| `app.scheduling.soft-delete-cleanup-cron` | CRON для запуска очистки корзины.                                     | `0 0 4 * * *`        |


### Брокер сообщений (RabbitMQ)
| Переменная             | Описание       | По умолчанию |
|:-----------------------|:---------------|:-------------|
| `SPRING_RABBITMQ_HOST` | Хост RabbitMQ. | `localhost`  |
| `SPRING_RABBITMQ_PORT` | Порт AMQP.     | `5672`       |

## 📚 API Документация

Swagger UI доступен по адресу: **http://localhost:8080/swagger-ui.html**

## 📊 Observability

*   **Observability:**
    *   Сквозное логирование через MDC-контракт:
        *   `requestId`
        *   `correlationId`
        *   `user`
        *   `traceId`
        *   `spanId`
    *   HTTP-контракт для логов:
        *   `X-Request-Id`
        *   `X-Correlation-Id`
    *   Мониторинг медленных запросов через AOP.

В docker-профиле backend публикует:
- метрики в `/actuator/prometheus`;
- trace-контекст в логах (`traceId`, `spanId`, `instance_id`);
- tracing через OTLP endpoint (`OTEL_EXPORTER_OTLP_ENDPOINT`, по умолчанию `http://jaeger:4317`).

Проверка локально через общий compose-стек из корня репозитория.

## 📊 Observability

В backend используются три уровня идентификации запросов:

- `requestId` — ID конкретного HTTP-запроса;
- `correlationId` — ID сквозного бизнес-потока;
- `traceId/spanId` — tracing-контекст Micrometer / OpenTelemetry.

### Правила логирования

- Все идентификаторы должны попадать в MDC.
- Все идентификаторы должны попадать в JSON-логи.
- Все идентификаторы должны быть видны в Logstash/Kibana.
- `traceId/spanId` остаются частью tracing.
- `requestId/correlationId` используются как отдельные бизнес-идентификаторы.

### HTTP headers

Backend принимает:

- `X-Request-Id`
- `X-Correlation-Id`

### Документ-контракт

Единые правила описаны в:
-`docs/logging-contract.md`
