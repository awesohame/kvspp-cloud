package com.kvspp.cloud.server.websocket;

import com.kvspp.cloud.server.service.AccessResult;
import com.kvspp.cloud.server.service.StoreAccessService;
import com.kvspp.cloud.server.service.TcpProxyService;
import com.kvspp.cloud.server.service.TcpProxyService.TcpSession;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TcpProxyWebSocketHandler extends TextWebSocketHandler {
    @Autowired
    private TcpProxyService tcpProxyService;
    @Autowired
    private StoreAccessService storeAccessService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // websocket to TCP session
    private final ConcurrentHashMap<String, TcpSession> sessionMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String storeToken = getStoreToken(session);
        // Try to get authentication from WebSocket session attributes (set by HttpSessionHandshakeInterceptor)
        SecurityContext context = (SecurityContext) session.getAttributes().get("SPRING_SECURITY_CONTEXT");
        Authentication authentication = (context != null) ? context.getAuthentication() : null;
//        if (authentication == null) {
//            // fallback: try SecurityContextHolder (for REST, not WebSocket)
//            authentication = SecurityContextHolder.getContext().getAuthentication();
//        }
        if (storeToken == null) {
            sendJsonError(session, "Missing storeToken");
            session.close(CloseStatus.BAD_DATA);
            return;
        }
        AccessResult access = storeAccessService.checkAccess(authentication, storeToken);
        if (!access.allowed) {
            sendJsonError(session, access.errorMessage);
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        try {
            TcpSession tcpSession = tcpProxyService.openSession(storeToken);
            sessionMap.put(session.getId(), tcpSession);
            // send SELECT response to client as JSON
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "select_response");
            response.put("payload", tcpSession.getSelectResponse());
            session.sendMessage(new TextMessage(response.toString()));
        } catch (IOException e) {
            sendJsonError(session, "TCP backend error");
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        TcpSession tcpSession = sessionMap.get(session.getId());
        if (tcpSession == null) {
            sendJsonError(session, "TCP session not found");
            session.close(CloseStatus.SERVER_ERROR);
            return;
        }
        ObjectNode request;
        try {
            request = (ObjectNode) objectMapper.readTree(message.getPayload());
        } catch (Exception e) {
            sendJsonError(session, "Invalid JSON");
            return;
        }
        String type = request.has("type") ? request.get("type").asText() : null;
        ObjectNode payload = request.has("payload") && request.get("payload").isObject() ? (ObjectNode) request.get("payload") : null;
        if (!"command".equals(type) || payload == null || !payload.has("command")) {
            sendJsonError(session, "Invalid command format");
            return;
        }
        String command = payload.get("command").asText();
        // Forbid SELECT commands
        if (tcpProxyService.isForbiddenCommand(command, null)) {
            sendJsonError(session, "SELECT command forbidden");
            return;
        }
        // Forward command to TCP backend
        tcpSession.getOut().write(command + "\r\n");
        tcpSession.getOut().flush();
        String response = tcpSession.getIn().readLine();
        ObjectNode jsonResponse = objectMapper.createObjectNode();
        jsonResponse.put("type", "command_response");
        jsonResponse.put("payload", response);
        session.sendMessage(new TextMessage(jsonResponse.toString()));
    }

    private void sendJsonError(WebSocketSession session, String message) throws IOException {
        ObjectNode error = objectMapper.createObjectNode();
        error.put("type", "error");
        error.put("message", message);
        session.sendMessage(new TextMessage(error.toString()));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        TcpSession tcpSession = sessionMap.remove(session.getId());
        if (tcpSession != null) {
            tcpSession.close();
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        TcpSession tcpSession = sessionMap.remove(session.getId());
        if (tcpSession != null) {
            tcpSession.close();
        }
        session.close(CloseStatus.SERVER_ERROR);
    }

    private String getStoreToken(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && kv[0].equals("storeToken")) {
                    return kv[1];
                }
            }
        }
        return null;
    }
}