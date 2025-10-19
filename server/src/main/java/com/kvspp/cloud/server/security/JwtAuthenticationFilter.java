package com.kvspp.cloud.server.security;

import com.kvspp.cloud.server.repository.UserRepository;
import com.kvspp.cloud.server.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;
        String authHeader = request.getHeader("Authorization");

        // Log the request details
        logger.info("=== JWT Filter - Request to: " + request.getRequestURI());
        logger.info("Authorization Header: " + (authHeader != null ? "Present (length: " + authHeader.length() + ")" : "MISSING"));

        // Check for token in Authorization header first
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            logger.info("Token extracted from header (first 20 chars): " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
        }
        // For WebSocket connections, check query parameter
        else if (request.getRequestURI().startsWith("/ws/")) {
            String queryToken = request.getParameter("token");
            if (queryToken != null && !queryToken.isEmpty()) {
                token = queryToken;
                logger.info("Token extracted from query parameter (first 20 chars): " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
            }
        }

        if (token != null) {
            logger.info("Token length: " + token.length());

            try {
                if (jwtUtil.validateToken(token)) {
                    logger.info("✓ Token validation SUCCESS");
                    String userId = jwtUtil.extractUserId(token);
                    logger.info("Extracted userId: " + userId);

                    // Load user from database WITH stores eagerly fetched
                    Optional<User> userOptional = userRepository.findByIdWithStores(UUID.fromString(userId));

                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        logger.info("✓ User found in database: " + user.getEmail());

                        // Create authentication token
                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.info("✓ Authentication set in SecurityContext");
                    } else {
                        logger.error("✗ User NOT found in database for userId: " + userId);
                    }
                } else {
                    logger.error("✗ Token validation FAILED");
                }
            } catch (Exception e) {
                // Invalid token - continue without authentication
                logger.error("✗ JWT validation exception: " + e.getClass().getName() + " - " + e.getMessage());
                e.printStackTrace();
            }
        } else if (authHeader != null) {
            logger.warn("Authorization header present but doesn't start with 'Bearer ': " + authHeader.substring(0, Math.min(20, authHeader.length())));
        } else {
            logger.info("No Authorization header - skipping JWT authentication");
        }

        filterChain.doFilter(request, response);
    }
}
