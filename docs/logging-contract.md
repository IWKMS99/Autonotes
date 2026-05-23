# Logging and Correlation Contract

## Purpose

This document defines the backend contract for request correlation, logs, and tracing.

## IDs and semantics

- `requestId`: technical identifier of a single HTTP request.
- `correlationId`: identifier of a cross-request/cross-service business flow.
- `traceId` / `spanId`: distributed tracing identifiers from Micrometer/OpenTelemetry.

## HTTP headers

Inbound headers accepted:

- `X-Request-Id` (accepted but backend still generates a fresh requestId per request)
- `X-Correlation-Id` (reused when valid)

Outbound headers always returned:

- `X-Request-Id`
- `X-Correlation-Id`

## Validation rules

For inbound correlation header values:

- trim whitespace
- max length: `128`
- allowed charset: `[A-Za-z0-9._:-]`
- invalid values are replaced with generated UUIDv4

## MDC keys

Backend writes these keys to MDC:

- `requestId`
- `correlationId`
- `user` (for authenticated requests)
- `traceId`
- `spanId`

## JSON log schema

Expected fields in backend JSON logs:

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
- `stack_trace` (for errors)

## Security and sanitization

Do not log sensitive values:

- `Authorization` header
- JWT tokens
- passwords/secrets
- binary payloads

AOP logging sanitizes suspicious argument values and truncates overly large argument strings.

## Example JSON log line

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

## Actuator exposure policy

Public (no auth):

- `/actuator/health`
- `/actuator/health/**`
- `/actuator/prometheus`

Protected (auth required):

- all other `/actuator/*`
