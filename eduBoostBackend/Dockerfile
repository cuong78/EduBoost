# Multi-stage build for Spring Boot application
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Create temp directory for large file uploads (multipart)
RUN mkdir -p /tmp/spring-upload

# Run application with optimized JVM settings for 4GB VPS
# -Xms512m: initial heap 512MB
# -Xmx2g: max heap 2GB (handles large ZIP uploads)
# -XX:+UseG1GC: G1 garbage collector for better large-heap performance
# -XX:MaxMetaspaceSize=256m: limit metaspace
# -Djava.io.tmpdir: temp dir for multipart file uploads
ENTRYPOINT ["java", \
  "-Xms512m", \
  "-Xmx2g", \
  "-XX:+UseG1GC", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxMetaspaceSize=256m", \
  "-Djava.io.tmpdir=/tmp/spring-upload", \
  "-jar", "app.jar"]
