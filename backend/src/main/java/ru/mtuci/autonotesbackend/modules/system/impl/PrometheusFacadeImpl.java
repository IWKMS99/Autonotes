package ru.mtuci.autonotesbackend.modules.system.impl;

import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import ru.mtuci.autonotesbackend.modules.system.api.PrometheusFacade;

@Component
@RequiredArgsConstructor
public class PrometheusFacadeImpl implements PrometheusFacade {

    private final ObjectProvider<PrometheusMeterRegistry> prometheusMeterRegistryProvider;

    @Override
    public String scrape() {
        PrometheusMeterRegistry registry = prometheusMeterRegistryProvider.getIfAvailable();
        if (registry == null) {
            return "# HELP autonotes_prometheus_registry_available 1 if prometheus registry bean is available\n"
                    + "# TYPE autonotes_prometheus_registry_available gauge\n"
                    + "autonotes_prometheus_registry_available 0.0\n";
        }
        return registry.scrape();
    }
}
