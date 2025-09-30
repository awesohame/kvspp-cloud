package com.kvspp.cloud.server.service;

public class AccessResult {
    public boolean allowed;
    public String errorType;
    public String errorMessage;
    public AccessResult(boolean allowed, String errorType, String errorMessage) {
        this.allowed = allowed;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
    }
    public static AccessResult allowed() {
        return new AccessResult(true, null, null);
    }
    public static AccessResult denied(String errorType, String errorMessage) {
        return new AccessResult(false, errorType, errorMessage);
    }
}

