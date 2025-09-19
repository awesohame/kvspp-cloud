package com.kvsppdemo.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PingController {
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse> ping() {
        return ResponseEntity.ok(new ApiResponse("success", "pong", "kvspp"));
    }
}
