# Multi-stage build for Spring Boot application
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Install required packages for build stage
RUN apk add --no-cache dos2unix

# Copy gradle files
COPY gradle gradle
COPY gradlew build.gradle settings.gradle gradle.properties ./

# Make gradle executable and fix line endings
RUN chmod +x gradlew && dos2unix gradlew

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
