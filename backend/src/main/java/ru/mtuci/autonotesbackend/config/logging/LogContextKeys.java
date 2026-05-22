package ru.mtuci.autonotesbackend.config.logging;

public final class LogContextKeys {

    private LogContextKeys() {
        throw new UnsupportedOperationException("Utility class");
    }

    // MDC keys
    public static final String MDC_REQUEST_ID = "requestId";
    public static final String MDC_CORRELATION_ID = "correlationId";
    public static final String MDC_USER = "user";
    public static final String MDC_TRACE_ID = "traceId";
    public static final String MDC_SPAN_ID = "spanId";

    // Incoming / outgoing HTTP headers
    public static final String HEADER_REQUEST_ID = "X-Request-Id";
    public static final String HEADER_CORRELATION_ID = "X-Correlation-Id";

    // Log field names
    public static final String FIELD_APP_NAME = "app_name";
    public static final String FIELD_INSTANCE_ID = "instance_id";
    public static final String FIELD_LEVEL = "level";
    public static final String FIELD_LOGGER_NAME = "logger_name";
    public static final String FIELD_MESSAGE = "message";
    public static final String FIELD_STACK_TRACE = "stack_trace";
}
