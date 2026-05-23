package ru.mtuci.autonotesbackend.config.logging;

import java.util.Arrays;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {
    private static final String REDACTED = "<redacted>";

    @Value("${app.logging.slow-threshold-ms:500}")
    private long slowThresholdMs;

    @Pointcut("execution(public * ru.mtuci.autonotesbackend.modules..*Facade.*(..)) || "
            + "execution(public * ru.mtuci.autonotesbackend.modules..*Service.*(..))")
    public void applicationPackagePointcut() {}

    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String args = sanitizeArgs(joinPoint.getArgs());

        if (log.isDebugEnabled()) {
            log.debug("Enter: {}.{}() with argument[s] = {}", className, methodName, args);
        }

        try {
            Object result = joinPoint.proceed();
            long elapsedTime = System.currentTimeMillis() - start;

            if (elapsedTime > slowThresholdMs) {
                log.info("Exit: {}.{}() - Executed in {} ms (SLOW)", className, methodName, elapsedTime);
            } else {
                log.debug("Exit: {}.{}() - Executed in {} ms", className, methodName, elapsedTime);
            }

            return result;
        } catch (IllegalArgumentException e) {
            log.error("Illegal argument: {} in {}.{}()", args, className, methodName);
            throw e;
        }
    }

    private String sanitizeArgs(Object[] args) {
        if (args == null || args.length == 0) {
            return "[]";
        }

        return Arrays.stream(args).map(this::sanitizeArg).collect(Collectors.joining(", ", "[", "]"));
    }

    private String sanitizeArg(Object arg) {
        if (arg == null) {
            return "null";
        }

        String value = String.valueOf(arg);
        String lower = value.toLowerCase();
        if (lower.contains("authorization")
                || lower.contains("bearer ")
                || lower.contains("password")
                || lower.contains("token")) {
            return REDACTED;
        }

        if (value.length() > 256) {
            return value.substring(0, 256) + "...(truncated)";
        }

        return value;
    }
}
