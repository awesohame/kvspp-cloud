package com.kvspp.cloud.server.websocket;

import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.UserRepository;
import com.kvspp.cloud.server.security.JwtUtil;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AuthHandshakeInterceptor.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthHandshakeInterceptor(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        URI uri = request.getURI();
        logger.info("WebSocket handshake request to: " + uri.getPath());

        // Extract token from query parameter
        Map<String, String> queryParams = UriComponentsBuilder.fromUri(uri).build().getQueryParams().toSingleValueMap();
        String token = queryParams.get("token");

        if (token == null || token.isEmpty()) {
            logger.warn("✗ WebSocket handshake rejected: No token provided");
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        logger.info("Token received (first 20 chars): " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));

        try {
            // Validate the JWT token
            if (!jwtUtil.validateToken(token)) {
                logger.warn("✗ WebSocket handshake rejected: Invalid token");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            // Extract user ID from token
            String userId = jwtUtil.extractUserId(token);
            logger.info("Token validated, userId: " + userId);

            // Load user from database with stores
            Optional<User> userOptional = userRepository.findByIdWithStores(UUID.fromString(userId));

            if (userOptional.isEmpty()) {
                logger.warn("✗ WebSocket handshake rejected: User not found");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            User user = userOptional.get();
            logger.info("✓ User authenticated for WebSocket: " + user.getEmail());

            // Create authentication and add to attributes for the WebSocket session
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            attributes.put("SPRING_SECURITY_CONTEXT", context);

            logger.info("✓ WebSocket handshake successful");
            return true;

        } catch (Exception e) {
            logger.error("✗ WebSocket handshake failed: " + e.getMessage());
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        // do nothing
    }
}
