package ru.mtuci.autonotesbackend.config.logging;

import java.util.UUID;

public final class RequestIdGenerator {

    private RequestIdGenerator() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String generate() {
        return UUID.randomUUID().toString();
    }
}
