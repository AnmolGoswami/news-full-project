# -------- Stage 1: Build the JAR --------
FROM --platform=linux/amd64 maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy project files
COPY pom.xml .
COPY src ./src

# Download dependencies and build (offline JAR build)
RUN mvn clean package -DskipTests

# -------- Stage 2: Run the JAR in a slim JDK container --------
FROM --platform=linux/amd64 openjdk:21-slim

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/projectDemo-0.0.1-SNAPSHOT.jar app.jar

# Optional environment variable
ENV PROJECT_NAME="Project Demo"

# Expose port
EXPOSE 8080

# Start the app
ENTRYPOINT ["java", "-jar", "app.jar"]