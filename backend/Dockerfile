# Multi-stage build for Spring Boot application
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Install required packages for build stage
RUN apk add --no-cache dos2unix unzip curl

# Copy all gradle files at once to preserve file integrity
COPY gradle gradle
COPY gradlew build.gradle settings.gradle gradle.properties ./

# Make gradle executable and fix line endings
RUN chmod +x gradlew && dos2unix gradlew

# Test gradle wrapper and fall back to manual installation if needed
RUN ./gradlew --version --no-daemon || { \
    echo "Gradle wrapper failed, installing fresh wrapper..."; \
    rm -rf gradle/wrapper/*; \
    curl -L https://services.gradle.org/distributions/gradle-8.10.2-bin.zip -o gradle.zip; \
    unzip -q gradle.zip; \
    ./gradle-*/bin/gradle wrapper --gradle-version 8.10.2; \
    rm -rf gradle.zip gradle-*/; \
    chmod +x gradlew; \
    dos2unix gradlew; \
    ./gradlew --version --no-daemon; \
    }

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build application
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Add non-root user
RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001

# Copy application jar
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership
RUN chown spring:spring app.jar

USER spring:spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
