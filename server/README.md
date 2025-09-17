# kvspp-demo Spring Boot Server

This project is a simple Spring Boot application with a test endpoint at `/ping`.

## Prerequisites
- **Java 21** (required for building and running locally)
- **Gradle** (wrapper included, no need to install globally)
- **Docker** (optional, for containerized runs)

---

## Running Locally (Windows)

1. **Build the project:**
   ```sh
   gradlew.bat build
   ```

2. **Run the server:**
   ```sh
   gradlew.bat bootRun
   ```

3. **Test the endpoint:**
   ```sh
   curl http://localhost:8080/ping
   ```
   You should see:
   ```
   kvspp
   ```

---

## Running with Docker (Windows)

1. **Build the Docker image:**
   ```sh
   docker build -t kvspp-springboot:kvspp-server .
   ```

2. **Run the container:**
   ```sh
   docker run -p 8080:8080 kvspp-springboot:kvspp-server
   ```

3. **Test the endpoint:**
   ```sh
   curl http://localhost:8080/ping
   ```

---

## Notes
- Ensure you are using **Java 21** for local builds. If you have a newer Java version, set the `JAVA_HOME` to point to Java 21.
- If you encounter version errors, check your Java version:
  ```sh
  java -version
  ```
- For Gradle sync issues in IDEs, ensure the correct Java version is configured in your IDE settings.

---

## Project Structure
- `src/main/java/com/kvsppdemo/demo/controller/PingController.java` — `/ping` endpoint
- `src/main/java/com/kvsppdemo/demo/DemoApplication.java` — Main Spring Boot application

---

## License
MIT
