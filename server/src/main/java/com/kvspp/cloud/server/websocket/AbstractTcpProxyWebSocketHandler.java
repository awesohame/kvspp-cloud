package com.kvspp.cloud.server.websocket;

import com.kvspp.cloud.server.service.TcpProxyService;
import com.kvspp.cloud.server.service.TcpProxyService.TcpSession;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

public abstract class AbstractTcpProxyWebSocketHandler extends TextWebSocketHandler {
    @Autowired
    protected TcpProxyService tcpProxyService;
    protected final ObjectMapper objectMapper = new ObjectMapper();
    protected final ConcurrentHashMap<String, TcpSession> sessionMap = new ConcurrentHashMap<>();

    protected abstract String resolveStoreToken(WebSocketSession session);
    protected abstract boolean isAccessAllowed(WebSocketSession session, String storeToken);
    protected abstract void handleAccessDenied(WebSocketSession session, String errorMessage) throws IOException;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String storeToken = resolveStoreToken(session);
        if (storeToken == null) {
            sendJsonError(session, "Missing storeToken");
            session.close();
            return;
        }
        if (!isAccessAllowed(session, storeToken)) {
            handleAccessDenied(session, "Access denied");
            session.close();
            return;
        }
        try {
            TcpSession tcpSession = tcpProxyService.openSession(storeToken);
            sessionMap.put(session.getId(), tcpSession);
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "select_response");
            response.put("payload", tcpSession.getSelectResponse());
            session.sendMessage(new TextMessage(response.toString()));
        } catch (IOException e) {
            sendJsonError(session, "TCP backend error");
            session.close();
        }
    }

    protected String enforceStoreTokenOnSaveCommand(String command, String storeToken) {
        if (command != null && command.trim().toLowerCase().startsWith("save ")) {
            String[] parts = command.trim().split("\\s+");
            if (parts.length >= 2) {
                StringBuilder newCommand = new StringBuilder("save ").append(storeToken);
                for (int i = 2; i < parts.length; i++) {
                    newCommand.append(" ").append(parts[i]);
                }
                return newCommand.toString();
            }
        }
        return command;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        TcpSession tcpSession = sessionMap.get(session.getId());
        if (tcpSession == null) {
            sendJsonError(session, "TCP session not found");
            session.close();
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
        ObjectNode payload = request.has("payload") && request.get("payload").isObject()
                ? (ObjectNode) request.get("payload")
                : null;
        if (!"command".equals(type) || payload == null || !payload.has("command")) {
            sendJsonError(session, "Invalid command format");
            return;
        }
        String command = payload.get("command").asText();
        String storeToken = resolveStoreToken(session);
        command = enforceStoreTokenOnSaveCommand(command, storeToken);
        if (tcpProxyService.isForbiddenCommand(command, null)) {
            sendJsonError(session, "SELECT command forbidden");
            return;
        }
        tcpSession.getOut().write(command + "\r\n");
        tcpSession.getOut().flush();
        String response = tcpSession.getIn().readLine();
        ObjectNode jsonResponse = objectMapper.createObjectNode();
        jsonResponse.put("type", "command_response");
        jsonResponse.put("payload", response);
        session.sendMessage(new TextMessage(jsonResponse.toString()));
    }

    protected void sendJsonError(WebSocketSession session, String message) throws IOException {
        ObjectNode error = objectMapper.createObjectNode();
        error.put("type", "error");
        error.put("message", message);
        session.sendMessage(new TextMessage(error.toString()));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        TcpSession tcpSession = sessionMap.remove(session.getId());
        if (tcpSession != null) {
            tcpSession.close();
        }
    }
}
