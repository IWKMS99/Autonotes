package ru.mtuci.autonotesbackend.config.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestCorrelationFilter extends OncePerRequestFilter {
    private static final int MAX_HEADER_LENGTH = 128;
    private static final Pattern SAFE_HEADER_PATTERN = Pattern.compile("^[A-Za-z0-9._:-]+$");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = RequestIdGenerator.generate();

        String correlationId = extractOrGenerateCorrelationId(request.getHeader(LogContextKeys.HEADER_CORRELATION_ID));

        try {
            MDC.put(LogContextKeys.MDC_REQUEST_ID, requestId);
            MDC.put(LogContextKeys.MDC_CORRELATION_ID, correlationId);

            response.setHeader(LogContextKeys.HEADER_REQUEST_ID, requestId);

            response.setHeader(LogContextKeys.HEADER_CORRELATION_ID, correlationId);

            filterChain.doFilter(request, response);

        } finally {
            MDC.remove(LogContextKeys.MDC_REQUEST_ID);
            MDC.remove(LogContextKeys.MDC_CORRELATION_ID);
        }
    }

    private String extractOrGenerateCorrelationId(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return RequestIdGenerator.generate();
        }
        return normalized;
    }

    private String normalize(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.length() > MAX_HEADER_LENGTH) {
            return null;
        }

        if (!SAFE_HEADER_PATTERN.matcher(normalized).matches()) {
            return null;
        }

        return normalized;
    }
}
