package ru.mtuci.autonotesbackend.modules.system.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;

@ExtendWith(MockitoExtension.class)
class PrometheusFacadeImplTest {

    @Mock
    private ObjectProvider<PrometheusMeterRegistry> prometheusRegistryProvider;

    @Mock
    private PrometheusMeterRegistry prometheusMeterRegistry;

    @Test
    void scrapeShouldReturnFallbackWhenRegistryUnavailable() {
        when(prometheusRegistryProvider.getIfAvailable()).thenReturn(null);

        PrometheusFacadeImpl facade = new PrometheusFacadeImpl(prometheusRegistryProvider);
        String result = facade.scrape();

        assertThat(result).contains("autonotes_prometheus_registry_available 0.0");
    }

    @Test
    void scrapeShouldReturnRegistryOutputWhenAvailable() {
        String scrapeOutput = "# HELP demo metric\n# TYPE demo counter\ndemo 1.0\n";
        when(prometheusRegistryProvider.getIfAvailable()).thenReturn(prometheusMeterRegistry);
        when(prometheusMeterRegistry.scrape()).thenReturn(scrapeOutput);

        PrometheusFacadeImpl facade = new PrometheusFacadeImpl(prometheusRegistryProvider);
        String result = facade.scrape();

        assertThat(result).isEqualTo(scrapeOutput);
    }
}
