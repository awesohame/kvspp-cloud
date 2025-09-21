package com.kvsppdemo.demo.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.core.DockerClientBuilder;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.exception.NotFoundException;
import com.github.dockerjava.api.model.Container;
import com.github.dockerjava.core.DefaultDockerClientConfig;
//import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.github.dockerjava.zerodep.ZerodepDockerHttpClient;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.List;

@Service
public class DockerService {
    private static final String CONTAINER_NAME = "kvspp";
    private static final String IMAGE_NAME = "awesohame/kvspp-cli";
    private static final Logger logger = LoggerFactory.getLogger(DockerService.class);
    private DockerClient dockerClient;

    public DockerService() {
        logger.info("DockerService constructor entered");
        try {
            String dockerHostEnv = System.getenv("DOCKER_HOST");
            logger.info("DOCKER_HOST environment variable: {}", dockerHostEnv);

            DockerClient testClient = null;
            DefaultDockerClientConfig config;

            // Try Docker Desktop endpoints first (most common on Windows)
            String[] dockerHosts = {
                "npipe:////./pipe/dockerDesktopLinuxEngine",  // Docker Desktop Linux engine (correct endpoint)
                "npipe:////./pipe/docker_engine",             // Standard Docker engine
                null,                                         // Default configuration
                // Only try TCP if you have enabled it in Docker Desktop settings
                // "tcp://localhost:2375",
                // "tcp://127.0.0.1:2375"
            };

            for (String dockerHost : dockerHosts) {
                try {
                    if (dockerHost == null) {
                        logger.info("Attempting to connect using default Docker configuration");
                        config = DefaultDockerClientConfig
                                .createDefaultConfigBuilder()
                                .build();
                    } else {
                        logger.info("Attempting to connect to Docker host: {}", dockerHost);
                        config = DefaultDockerClientConfig
                                .createDefaultConfigBuilder()
                                .withDockerHost(dockerHost)
                                .build();
                    }

                    DockerHttpClient httpClient = new ZerodepDockerHttpClient.Builder()
                            .dockerHost(config.getDockerHost())
                            .sslConfig(config.getSSLConfig())
                            .build();

                    testClient = DockerClientBuilder
                            .getInstance(config)
                            .withDockerHttpClient(httpClient)
                            .build();

                    // Test the connection
                    logger.info("Testing connection to Docker host: {}", config.getDockerHost());
                    testClient.pingCmd().exec();

                    logger.info("Successfully connected to Docker host: {}", config.getDockerHost());
                    this.dockerClient = testClient;
                    break;

                } catch (Exception ex) {
                    String hostInfo = dockerHost != null ? dockerHost : "default";
                    logger.warn("Failed to connect to Docker host {}: {}", hostInfo, ex.getMessage(), ex);
                    if (testClient != null) {
                        try {
                            testClient.close();
                        } catch (Exception closeEx) {
                            // Ignore close exceptions
                        }
                    }
                    testClient = null;
                }
            }

            if (this.dockerClient == null) {
                logger.error("Failed to connect to any Docker endpoint. Checked endpoints:");
                for (String host : dockerHosts) {
                    logger.error("  - {}", host != null ? host : "default configuration");
                }
                logger.warn("DockerService will be disabled. Container operations will not be available.");
                logger.warn("Please ensure Docker Desktop is running and accessible.");
                this.dockerClient = null;
                return;
            }

            logger.info("Docker client initialized successfully with ZeroDep");
        } catch (Exception e) {
            logger.error("Failed to initialize Docker client: {}", e.getMessage(), e);
            logger.warn("DockerService will be disabled. Container operations will not be available.");
            this.dockerClient = null;
        }
    }

    public void ensureKvsppContainerRunning() {
        if (dockerClient == null) {
            logger.warn("Docker client is not available. Cannot ensure container is running.");
            return;
        }
        try {
            // Check if container exists and is running
            List<Container> containers = dockerClient.listContainersCmd()
                    .withShowAll(true)
                    .withNameFilter(List.of(CONTAINER_NAME))
                    .exec();

            boolean isRunning = containers.stream()
                    .anyMatch(c -> c.getNames()[0].contains(CONTAINER_NAME) &&
                            c.getState().equalsIgnoreCase("running"));

            if (isRunning) {
                logger.info("Container {} is already running", CONTAINER_NAME);
                return;
            }

            // Remove stopped container with same name if exists
            containers.stream()
                    .filter(c -> c.getNames()[0].contains(CONTAINER_NAME))
                    .forEach(c -> {
                        logger.info("Removing existing container: {}", c.getId());
                        dockerClient.removeContainerCmd(c.getId()).withForce(true).exec();
                    });

            // Pull image if not present
            try {
                dockerClient.inspectImageCmd(IMAGE_NAME).exec();
                logger.info("Image {} already exists locally", IMAGE_NAME);
            } catch (NotFoundException e) {
                logger.info("Pulling image: {}", IMAGE_NAME);
                try {
                    dockerClient.pullImageCmd(IMAGE_NAME)
                            .start()
                            .awaitCompletion();
                    logger.info("Successfully pulled image: {}", IMAGE_NAME);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while pulling Docker image", ex);
                }
            }

            // Create and start container
            logger.info("Creating container: {}", CONTAINER_NAME);
            CreateContainerResponse container = dockerClient.createContainerCmd(IMAGE_NAME)
                    .withName(CONTAINER_NAME)
                    .withTty(true)
                    .withStdinOpen(true)
                    .exec();

            dockerClient.startContainerCmd(container.getId()).exec();

            logger.info("Successfully started container: {} with ID: {}", CONTAINER_NAME, container.getId());

        } catch (Exception e) {
            logger.error("Failed to ensure container is running: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to manage Docker container", e);
        }
    }

    public void stopKvsppContainer() {
        try {
            List<Container> containers = dockerClient.listContainersCmd()
                    .withShowAll(true)
                    .withNameFilter(List.of(CONTAINER_NAME))
                    .exec();

            containers.stream()
                    .filter(c -> c.getNames()[0].contains(CONTAINER_NAME))
                    .forEach(c -> {
                        logger.info("Stopping container: {}", c.getId());
                        dockerClient.stopContainerCmd(c.getId()).exec();
                    });
        } catch (Exception e) {
            logger.error("Failed to stop container: {}", e.getMessage(), e);
        }
    }

    // Cleanup method to close the Docker client
    public void cleanup() {
        try {
            if (dockerClient != null) {
                dockerClient.close();
                logger.info("Docker client closed successfully");
            }
        } catch (Exception e) {
            logger.error("Error closing Docker client: {}", e.getMessage(), e);
        }
    }
}