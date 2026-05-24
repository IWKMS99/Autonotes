package ru.mtuci.autonotesbackend.observability;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import org.junit.jupiter.api.Test;

class MonitoringAssetsValidationTest {

    private static final Path DASHBOARD_HTTP =
            Path.of("..", "monitoring", "grafana", "dashboards", "autonotes-http-overview.json");
    private static final Path DASHBOARD_JVM =
            Path.of("..", "monitoring", "grafana", "dashboards", "autonotes-jvm-health.json");
    private static final Path DATASOURCE =
            Path.of("..", "monitoring", "grafana", "provisioning", "datasources", "prometheus.yml");

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void dashboardsShouldBeValidJsonWithRequiredFields() throws IOException {
        validateDashboard(DASHBOARD_HTTP);
        validateDashboard(DASHBOARD_JVM);
    }

    @Test
    void datasourceShouldUsePrometheusUid() throws IOException {
        String datasourceContent = Files.readString(DATASOURCE);
        assertThat(datasourceContent).contains("uid: prometheus");
        assertThat(datasourceContent).contains("type: prometheus");
    }

    private void validateDashboard(Path dashboardPath) throws IOException {
        assertThat(Files.exists(dashboardPath)).isTrue();

        String content = Files.readString(dashboardPath);
        if (!content.isEmpty() && content.charAt(0) == '\uFEFF') {
            content = content.substring(1);
        }
        JsonNode root = objectMapper.readTree(content);
        assertThat(root.path("title").asText()).isNotBlank();
        assertThat(root.path("uid").asText()).isNotBlank();
        assertThat(root.path("panels").isArray()).isTrue();
        assertThat(root.path("panels")).isNotEmpty();

        for (JsonNode panel : root.path("panels")) {
            JsonNode targets = panel.path("targets");
            if (!targets.isArray() || targets.isEmpty()) {
                continue;
            }
            Iterator<JsonNode> iterator = targets.elements();
            while (iterator.hasNext()) {
                JsonNode target = iterator.next();
                String expr = target.path("expr").asText();
                assertThat(expr).isNotBlank();
                if (expr.contains("http_server_requests_seconds")) {
                    assertThat(expr).contains("application=\"AutonotesBackend\"");
                }
            }
        }
    }
}
