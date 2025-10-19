package com.kvspp.cloud.server.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class TcpProxyWebSocketHandler extends AbstractTcpProxyWebSocketHandler {

    @Override
    protected String resolveStoreToken(WebSocketSession session) {
        // Extract storeToken from query params
        String query = session.getUri().getQuery();
        if (query != null) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("storeToken=")) {
                    return param.substring("storeToken=".length());
                }
            }
        }
        return null;
    }
}