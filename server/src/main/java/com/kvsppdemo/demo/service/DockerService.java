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
import org.springframework.context.SmartLifecycle;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.io.File;

@Service
public class DockerService implements SmartLifecycle {
    private static final String CONTAINER_NAME = "kvspp";
    private static final String IMAGE_NAME = "awesohame/kvspp-cli";
    private static final Logger logger = LoggerFactory.getLogger(DockerService.class);
    private DockerClient dockerClient;

    private volatile boolean running = false;

    @Value("${docker.kvspp.store-path:/store}")
    private String storePath;

    public DockerService() {
        logger.info("DockerService constructor entered");
        try {
            String dockerHostEnv = System.getenv("DOCKER_HOST");
            logger.info("DOCKER_HOST environment variable: {}", dockerHostEnv);

            DockerClient testClient = null;
            DefaultDockerClientConfig config;

            // Try Docker Desktop endpoints first (most common on Windows)
            String[] dockerHosts = {
                "npipe:////./pipe/dockerDesktopLinuxEngine",  // Docker Desktop Linux engine
                "npipe:////./pipe/docker_engine",             // Standard Docker engine
                null,                                         // Default configuration
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

    @Override
    public void start() {
        logger.info("SmartLifecycle start() called: Ensuring kvspp container is running...");
        ensureKvsppContainerRunning();
        running = isKvsppContainerActuallyRunning();
    }

    @Override
    public void stop() {
        logger.info("SmartLifecycle stop() called: Stopping kvspp container...");
        stopKvsppContainer();
        running = false;
        cleanup();
    }

    @Override
    public boolean isRunning() {
        running = isKvsppContainerActuallyRunning();
        return running;
    }

    @Override
    public boolean isAutoStartup() {
        return true;
    }

    @Override
    public int getPhase() {
        return 0; // Default phase
    }

    @Override
    public void stop(Runnable callback) {
        stop();
        callback.run();
    }

    public void ensureKvsppContainerRunning() {
        if (dockerClient == null) {
            logger.warn("Docker client is not available. Cannot ensure container is running.");
            return;
        }
        try {
            // Ensure the host store directory exists
            File storeDir = new File(storePath);
            if (!storeDir.exists()) {
                boolean created = storeDir.mkdirs();
                if (created) {
                    logger.info("Created host store directory: {}", storePath);
                } else {
                    logger.warn("Failed to create host store directory: {}", storePath);
                }
            }

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
            logger.info("Creating container: {} with volume {}:/app/store", CONTAINER_NAME, storePath);
            CreateContainerResponse container = dockerClient.createContainerCmd(IMAGE_NAME)
                    .withName(CONTAINER_NAME)
                    .withTty(true)
                    .withStdinOpen(true)
                    .withBinds(new com.github.dockerjava.api.model.Bind(storePath, new com.github.dockerjava.api.model.Volume("/app/store")))
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

    // Helper to check if the container is running
    private boolean isKvsppContainerActuallyRunning() {
        if (dockerClient == null) return false;
        try {
            List<Container> containers = dockerClient.listContainersCmd()
                    .withShowAll(true)
                    .withNameFilter(List.of(CONTAINER_NAME))
                    .exec();
            return containers.stream()
                    .anyMatch(c -> c.getNames()[0].contains(CONTAINER_NAME) &&
                            c.getState().equalsIgnoreCase("running"));
        } catch (Exception e) {
            logger.error("Error checking container state: {}", e.getMessage(), e);
            return false;
        }
    }
}