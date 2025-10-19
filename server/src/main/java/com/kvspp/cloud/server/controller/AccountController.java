package com.kvspp.cloud.server.controller;

import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/account")
public class AccountController {

    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);

    @Autowired
    private UserRepository userRepository;

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse> deleteAccount(@AuthenticationPrincipal User user, HttpServletRequest request, HttpServletResponse response) {
        logger.info("DELETE /account/delete called");
        if (user == null) {
            logger.warn("Delete account failed: Not authenticated");
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        logger.info("Deleting account for user: " + user.getEmail());
        userRepository.delete(user);
        // Log out after deleting account
        new SecurityContextLogoutHandler().logout(request, response, null);
        return ResponseEntity.ok(new ApiResponse("success", "Account deleted and logged out"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        logger.info("POST /account/logout called");
        new SecurityContextLogoutHandler().logout(request, response, null);
        return ResponseEntity.ok(new ApiResponse("success", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user, HttpServletRequest request) {
        logger.info("GET /account/me called");
        logger.info("Authorization header: " + (request.getHeader("Authorization") != null ? "Present" : "MISSING"));

        if (user == null) {
            logger.warn("✗ /account/me failed: User is NULL (not authenticated)");
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }

        logger.info("✓ User authenticated: " + user.getEmail() + " (ID: " + user.getId() + ")");

        // Return user info
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("name", user.getName());
        userInfo.put("profilePicture", user.getProfilePicture());

        return ResponseEntity.ok(new ApiResponse("success", "User info fetched", userInfo));
    }
}
