package com.kvspp.cloud.server.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Autowired
    private TcpProxyWebSocketHandler tcpProxyWebSocketHandler;

    @Autowired
    private DemoTcpProxyWebSocketHandler demoTcpProxyWebSocketHandler;

    @Value("${client.url}")
    private String clientUrl;

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        logger.info("Registering WebSocket handler at /ws/tcp-proxy");
        registry.addHandler(tcpProxyWebSocketHandler, "/ws/tcp-proxy")
            .addInterceptors(new HttpSessionHandshakeInterceptor(), new AuthHandshakeInterceptor())
            .setAllowedOrigins(clientUrl);
        logger.info("Registering Demo WebSocket handler at /ws/tcp-proxy-demo");
        registry.addHandler(demoTcpProxyWebSocketHandler, "/ws/tcp-proxy-demo")
            .setAllowedOrigins(clientUrl);
    }
}
