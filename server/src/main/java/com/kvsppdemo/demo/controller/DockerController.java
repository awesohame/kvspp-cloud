package com.kvsppdemo.demo.controller;

import com.kvsppdemo.demo.service.DockerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/docker")
public class DockerController {
    private final DockerService dockerService;

    @Autowired
    public DockerController(DockerService dockerService) {
        this.dockerService = dockerService;
    }

    @GetMapping("/start-kvspp")
    public Map<String, Object> startKvsppContainer() {
        Map<String, Object> response = new HashMap<>();
        try {
            dockerService.ensureKvsppContainerRunning();
            response.put("success", true);
            response.put("message", "kvspp container is running or has been started.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to start kvspp container: " + e.getMessage());
        }
        return response;
    }
}
