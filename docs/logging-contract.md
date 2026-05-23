## Контракт логирования и корреляции

## Назначение

Этот документ фиксирует backend-контракт для корреляции запросов, логирования и трейсинга.

## Идентификаторы и семантика

- `requestId`: технический идентификатор одного HTTP-запроса.
- `correlationId`: идентификатор сквозного бизнес-потока между запросами/сервисами.
- `traceId` / `spanId`: идентификаторы распределенного трейсинга из Micrometer/OpenTelemetry.

## HTTP-заголовки

Входящие заголовки, которые принимаются:

- `X-Request-Id` (принимается, но backend всегда генерирует новый `requestId` для каждого запроса)
- `X-Correlation-Id` (переиспользуется при валидном значении)

Исходящие заголовки, которые backend возвращает всегда:

- `X-Request-Id`
- `X-Correlation-Id`

## Правила валидации

Для входного значения корреляционного заголовка:

- обрезаются внешние пробелы (`trim`)
- максимальная длина: `128`
- допустимый набор символов: `[A-Za-z0-9._:-]`
- невалидные значения заменяются сгенерированным UUIDv4

## Ключи MDC

Backend пишет в MDC следующие ключи:

- `requestId`
- `correlationId`
- `user` (для аутентифицированных запросов)
- `traceId`
- `spanId`

## JSON-схема логов

Ожидаемые поля в JSON-логах backend:

- `@timestamp`
- `level`
- `thread`
- `logger_name`
- `message`
- `requestId`
- `correlationId`
- `user`
- `traceId`
- `spanId`
- `app_name`
- `instance_id`
- `stack_trace` (для ошибок)

## Безопасность и санитизация

Запрещено логировать чувствительные данные:

- заголовок `Authorization`
- JWT-токены
- пароли/секреты
- бинарные payload-данные

AOP-логирование санитизирует подозрительные значения аргументов и обрезает слишком длинные строковые аргументы.

## Пример JSON-лога

```json
{
  "@timestamp": "2026-05-23T18:11:03.181Z",
  "level": "INFO",
  "logger_name": "ru.mtuci.autonotesbackend.modules.system.api.controller.SystemController",
  "message": "Health check request handled by instance: Server 1",
  "requestId": "98f595ab-8f5d-4b92-85ef-021d9d30bde4",
  "correlationId": "demo-corr-001",
  "traceId": "410f5d34c75bf2f6f8c47e363fa6e3dd",
  "spanId": "4f11f6b6768cd6ba",
  "app_name": "AutonotesBackend",
  "instance_id": "Server 1"
}
```

## Политика доступа к Actuator

Публичные endpoints (без аутентификации):

- `/actuator/health`
- `/actuator/health/**`
- `/actuator/prometheus`

Защищенные endpoints (требуется аутентификация):

- все остальные `/actuator/*`
