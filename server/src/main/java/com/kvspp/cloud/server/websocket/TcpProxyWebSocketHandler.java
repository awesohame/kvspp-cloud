package com.kvspp.cloud.server.websocket;

import com.kvspp.cloud.server.service.TcpProxyService;
import com.kvspp.cloud.server.service.TcpProxyService.TcpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TcpProxyWebSocketHandler extends TextWebSocketHandler {
    @Autowired
    private TcpProxyService tcpProxyService;

    // websocket to TCP session
    private final ConcurrentHashMap<String, TcpSession> sessionMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String storeToken = getStoreToken(session);
        if (storeToken == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }
        try {
            TcpSession tcpSession = tcpProxyService.openSession(storeToken);
            sessionMap.put(session.getId(), tcpSession);
            // send SELECT response to client
            session.sendMessage(new TextMessage(tcpSession.getSelectResponse()));
        } catch (IOException e) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        TcpSession tcpSession = sessionMap.get(session.getId());
        if (tcpSession == null) {
            session.close(CloseStatus.SERVER_ERROR);
            return;
        }
        String command = message.getPayload();
        // Forbid SELECT commands
        if (tcpProxyService.isForbiddenCommand(command, null)) {
            session.sendMessage(new TextMessage("ERR: SELECT command forbidden"));
            return;
        }
        // Forward command to TCP backend
        tcpSession.getOut().write(command + "\r\n");
        tcpSession.getOut().flush();
        String response = tcpSession.getIn().readLine();
        session.sendMessage(new TextMessage(response));
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

