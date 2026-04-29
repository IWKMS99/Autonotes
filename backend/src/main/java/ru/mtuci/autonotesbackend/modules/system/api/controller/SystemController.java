package ru.mtuci.autonotesbackend.modules.system.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.OffsetDateTime;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/system")
@Tag(name = "00. Системные эндпоинты", description = "Проверка состояния и идентификация ноды")
public class SystemController {

    @Value("${INSTANCE_ID:Standalone-Node}")
    private String instanceId;

    @Operation(
            summary = "Получить информацию о сервере",
            description = "Возвращает ID экземпляра приложения для проверки балансировки нагрузки")
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        log.debug("Health check request handled by instance: {}", instanceId);

        return ResponseEntity.ok(Map.of("instanceId", instanceId, "status", "UP", "timestamp", OffsetDateTime.now()));
    }
}
