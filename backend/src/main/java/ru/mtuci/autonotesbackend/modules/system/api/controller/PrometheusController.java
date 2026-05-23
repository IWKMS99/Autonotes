package ru.mtuci.autonotesbackend.modules.system.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.mtuci.autonotesbackend.modules.system.api.PrometheusFacade;

@RestController
@RequiredArgsConstructor
public class PrometheusController {

    private final PrometheusFacade prometheusFacade;

    @GetMapping(value = "/actuator/prometheus", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> scrape() {
        return ResponseEntity.ok(prometheusFacade.scrape());
    }
}
