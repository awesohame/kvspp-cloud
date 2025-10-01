package com.kvspp.cloud.server.websocket;

import com.kvspp.cloud.server.service.AccessResult;
import com.kvspp.cloud.server.service.StoreAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class TcpProxyWebSocketHandler extends AbstractTcpProxyWebSocketHandler {
    @Autowired
    private StoreAccessService storeAccessService;

    @Override
    protected String resolveStoreToken(WebSocketSession session) {
        // Extract storeToken from query params
        String query = session.getUri().getQuery();
        if (query != null && query.startsWith("storeToken=")) {
            return query.substring("storeToken=".length());
        }
        return null;
    }

    @Override
    protected boolean isAccessAllowed(WebSocketSession session, String storeToken) {
        SecurityContext context = (SecurityContext) session.getAttributes().get("SPRING_SECURITY_CONTEXT");
        Authentication authentication = (context != null) ? context.getAuthentication() : null;
        if (storeToken == null) return false;
        AccessResult access = storeAccessService.checkAccess(authentication, storeToken);
        return access.allowed;
    }

    @Override
    protected void handleAccessDenied(WebSocketSession session, String errorMessage) {
        try {
            sendJsonError(session, errorMessage);
        } catch (Exception ignored) {}
    }
}