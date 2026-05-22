FROM eclipse-temurin:24-jdk-noble AS builder

WORKDIR /app

COPY build.gradle* settings.gradle* ./
COPY gradlew ./
COPY gradle ./gradle

RUN chmod +x ./gradlew
ENV GRADLE_OPTS="-Dorg.gradle.internal.http.connectionTimeout=60000 -Dorg.gradle.internal.http.socketTimeout=60000"

RUN for i in 1 2 3; do ./gradlew dependencies --no-daemon && break || sleep 5; done || true

COPY src ./src

RUN for i in 1 2 3; do ./gradlew copyOtelAgent bootJar --no-daemon && break || sleep 5; done

FROM eclipse-temurin:24-jre-noble

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar
COPY --from=builder /app/build/otel-agent/opentelemetry-javaagent.jar otel-agent.jar

EXPOSE 8080

ENTRYPOINT ["java", "-javaagent:/app/otel-agent.jar", "-jar", "app.jar"]
