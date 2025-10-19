package com.kvspp.cloud.server.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class DemoTcpProxyWebSocketHandler extends AbstractTcpProxyWebSocketHandler {
    @Override
    protected String resolveStoreToken(WebSocketSession session) {
        return "public";
    }
}
