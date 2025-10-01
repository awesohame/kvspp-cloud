# KVS++ Cloud Server

This folder contains the backend server for KVS++ Cloud.

## Tech Stack
- Java
- Spring Boot
- Gradle

## Structure
- `src/main/java/`: Application source code
- `src/main/resources/`: Config and templates
- `build.gradle`: Build configuration
- `Dockerfile`: Containerization

## Setup
1. Install Java (21+)
2. Build and run:
   ```sh
   ./gradlew build
   ./gradlew bootRun
   ```

## Notes
- See the [root README](../README.md) for project-wide info.

## API Reference

### REST Endpoints

**General**
- `GET /ping`  -  Health check

**Account**
- `GET /account/me`  -  Get current user info
- `POST /account/logout`  -  Log out
- `DELETE /account/delete`  -  Delete account

_Remember to keep the KVS++ Docker container ([awesohame/kvspp-tcp](https://hub.docker.com/r/awesohame/kvspp-tcp)) or executable ([awesohame/kvsplusplus](https://github.com/awesohame/kvsplusplus)) running for the below commands. The default port is **5555**; set this port in `application.properties` as needed._

**Store Management**  
- `POST /store`  -  Create a new store (`name`, `description` in JSON body)
- `GET /store`  -  List all stores
- `GET /store/{storeToken}`  -  Get store details
- `PUT /store/{storeToken}`  -  Update store (`name`, `description` in JSON body)
- `DELETE /store/{storeToken}`  -  Delete store
- `POST /store/{storeToken}/owners`  -  Add owner to store (`email` in JSON body)

**Key-Value Operations**
- `GET /store/{storeToken}/{key}`  -  Get value for key
- `PUT /store/{storeToken}/{key}`  -  Set value for key (`value` in JSON body)
- `DELETE /store/{storeToken}/{key}`  -  Delete key

**Store Actions**
- `POST /store/{storeToken}/save`  -  Save store to disk
- `POST /store/{storeToken}/load`  -  Load store from disk
- `POST /store/{storeToken}/autosave`  -  Set autosave (`autosave` in JSON body: true/false/on/off)
- `GET /store/help`  -  Store API help

### WebSocket

**TCP Proxy WebSocket**
- `ws://localhost:8080/ws/tcp-proxy?storeToken={storeToken}`
   - Authenticate using the `JSESSIONID` cookie header
   - Enables direct TCP-like communication with the selected store

## WebSocket
Single WebSocket endpoint for TCP proxying to KVS++:

- `ws://localhost:8080/ws/tcp-proxy?storeToken={storeToken}`
- Authenticate using the `JSESSIONID` cookie header
- Allows direct TCP-like communication with the selected store
