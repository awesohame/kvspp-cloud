# Use Eclipse Temurin for Java 21
FROM eclipse-temurin:21-jre AS base

# Set working directory
WORKDIR /app

# Copy the built Spring Boot jar (adjust the name if needed)
COPY build/libs/*.jar app.jar

# Install Docker CLI (for managing containers from inside this container)
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# Install build tools for C++ (g++, make)
RUN apt-get update && \
    apt-get install -y g++ make && \
    rm -rf /var/lib/apt/lists/*

# (Optional) Copy your C++ CLI tool if it needs to be present in the same container
# COPY path/to/your/cpp/tool ./cpp-tool

# Expose the port your Spring Boot app runs on (default 8080)
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
