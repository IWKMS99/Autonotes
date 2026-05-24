package ru.mtuci.autonotesbackend.observability;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability;
import ru.mtuci.autonotesbackend.BaseIntegrationTest;
import ru.mtuci.autonotesbackend.config.logging.LogContextKeys;

@AutoConfigureObservability
class ActuatorSecurityIntegrationTest extends BaseIntegrationTest {

    @Test
    void healthShouldBePublic() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void readinessShouldBePublic() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(
                        result -> assertThat(result.getResponse().getStatus()).isNotIn(401, 403));
    }

    @Test
    void prometheusShouldBePublic() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/plain"))
                .andExpect(content().string(Matchers.containsString("# HELP")))
                .andExpect(content().string(Matchers.containsString("# TYPE")));
    }

    @Test
    void otherActuatorEndpointsShouldRequireAuth() throws Exception {
        mockMvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnCorrelationHeadersEvenOnUnauthorizedResponse() throws Exception {
        mockMvc.perform(get("/api/v1/some-protected-endpoint"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().exists(LogContextKeys.HEADER_REQUEST_ID))
                .andExpect(header().exists(LogContextKeys.HEADER_CORRELATION_ID));
    }

    @Test
    void prometheusShouldContainHttpMetricsAfterRequest() throws Exception {
        mockMvc.perform(get("/api/v1/system/info")).andExpect(status().isOk());

        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("http_server_requests_seconds")));
    }
}
