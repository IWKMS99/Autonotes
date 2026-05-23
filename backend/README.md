# Autonotes Backend

Spring Boot backend for Autonotes (Java 24, Spring Boot 3.5.x).

## Run locally

1. Start infrastructure:
```bash
docker compose up -d db minio rabbitmq
```
2. Start backend:
```bash
cd backend
./gradlew bootRun
```

## API docs

- Swagger UI: `http://localhost:8080/swagger-ui.html`

## Observability contract

Canonical contract: [`docs/logging-contract.md`](../docs/logging-contract.md).

Backend observability guarantees:

- MDC keys: `requestId`, `correlationId`, `user`, `traceId`, `spanId`
- HTTP headers:
  - `X-Request-Id`
  - `X-Correlation-Id`
- Public actuator endpoints:
  - `/actuator/health`
  - `/actuator/health/**`
  - `/actuator/prometheus`
- Other `/actuator/*` endpoints require authentication.

## Smoke check

Run from repo root after `docker compose up --build -d`:

```bash
curl -i http://localhost:8090/api/v1/system/info
curl -i -H "X-Correlation-Id: demo-corr-001" http://localhost:8090/api/v1/system/info
curl -i http://localhost:8090/actuator/health
curl -i http://localhost:8090/actuator/prometheus
curl -i http://localhost:8090/actuator/env
```

Expected:

- responses include `X-Request-Id` and `X-Correlation-Id`
- `/actuator/health` and `/actuator/prometheus` return `200`
- `/actuator/env` returns `401`

## Troubleshooting

1. `requestId` not visible in logs:
- verify `RequestCorrelationFilter` is in security chain before auth filters
- verify `logback-spring.xml` includes `<mdc/>` provider for JSON logs

2. `traceId`/`spanId` missing:
- verify `management.tracing.enabled=true`
- verify OTLP endpoint and Jaeger container are up

3. `401/403` without correlation headers:
- verify correlation filter runs before authentication entry point
- verify response headers are set before `filterChain.doFilter(...)`

4. `/actuator/prometheus` inaccessible:
- verify security allow-list contains `/actuator/prometheus`
- verify `management.endpoints.web.exposure.include` contains `prometheus`
