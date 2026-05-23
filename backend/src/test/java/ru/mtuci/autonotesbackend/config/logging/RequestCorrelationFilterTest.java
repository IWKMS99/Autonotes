package ru.mtuci.autonotesbackend.config.logging;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestCorrelationFilterTest {

    private final RequestCorrelationFilter filter = new RequestCorrelationFilter();

    @Test
    void shouldGenerateIdsWhenHeadersMissing() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        String requestId = response.getHeader(LogContextKeys.HEADER_REQUEST_ID);
        String correlationId = response.getHeader(LogContextKeys.HEADER_CORRELATION_ID);
        assertThat(requestId).isNotBlank();
        assertThat(correlationId).isNotBlank();
    }

    @Test
    void shouldReuseValidCorrelationIdFromHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(LogContextKeys.HEADER_CORRELATION_ID, "corr-123:abc");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(LogContextKeys.HEADER_CORRELATION_ID)).isEqualTo("corr-123:abc");
    }

    @Test
    void shouldTrimAndReuseCorrelationIdWhenHeaderHasOuterSpaces() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(LogContextKeys.HEADER_CORRELATION_ID, "  corr-123:abc  ");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(LogContextKeys.HEADER_CORRELATION_ID)).isEqualTo("corr-123:abc");
    }

    @Test
    void shouldIgnoreInboundRequestIdAndGenerateOwnRequestId() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(LogContextKeys.HEADER_REQUEST_ID, "external-request-id");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(LogContextKeys.HEADER_REQUEST_ID))
                .isNotBlank()
                .isNotEqualTo("external-request-id");
    }

    @Test
    void shouldReplaceInvalidOrTooLongCorrelationId() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(LogContextKeys.HEADER_CORRELATION_ID, "  bad value with spaces  ");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getHeader(LogContextKeys.HEADER_CORRELATION_ID)).isNotEqualTo("bad value with spaces");

        MockHttpServletRequest longRequest = new MockHttpServletRequest();
        longRequest.addHeader(LogContextKeys.HEADER_CORRELATION_ID, "a".repeat(129));
        MockHttpServletResponse longResponse = new MockHttpServletResponse();
        filter.doFilter(longRequest, longResponse, new MockFilterChain());
        assertThat(longResponse.getHeader(LogContextKeys.HEADER_CORRELATION_ID)).isNotEqualTo("a".repeat(129));
    }

    @Test
    void shouldClearMdcAfterFilterExecution() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(MDC.get(LogContextKeys.MDC_REQUEST_ID)).isNull();
        assertThat(MDC.get(LogContextKeys.MDC_CORRELATION_ID)).isNull();
    }
}
