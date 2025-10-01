package com.kvspp.cloud.server.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class DemoTcpProxyWebSocketHandler extends AbstractTcpProxyWebSocketHandler {
    @Override
    protected String resolveStoreToken(WebSocketSession session) {
        return "public";
    }

    @Override
    protected boolean isAccessAllowed(WebSocketSession session, String storeToken) {
        // always allow access for demo
        return true;
    }

    @Override
    protected void handleAccessDenied(WebSocketSession session, String errorMessage) {
        // fallback
        try {
            sendJsonError(session, errorMessage);
        } catch (Exception ignored) {}
    }
}

