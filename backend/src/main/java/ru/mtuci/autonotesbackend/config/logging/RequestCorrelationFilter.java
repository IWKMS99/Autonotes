package ru.mtuci.autonotesbackend.config.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestCorrelationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = extractOrGenerate(request.getHeader(LogContextKeys.HEADER_REQUEST_ID));

        String correlationId = extractOrGenerate(request.getHeader(LogContextKeys.HEADER_CORRELATION_ID));

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

    private String extractOrGenerate(String value) {

        if (value == null || value.isBlank()) {
            return RequestIdGenerator.generate();
        }

        return value;
    }
}
