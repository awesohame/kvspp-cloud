package com.kvsppdemo.demo.controller;

import com.kvsppdemo.demo.model.User;
import com.kvsppdemo.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;

@RestController
@RequestMapping("/account")
public class AccountController {
    @Autowired
    private UserRepository userRepository;

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse> deleteAccount(@AuthenticationPrincipal OAuth2User principal, HttpServletRequest request, HttpServletResponse response) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        String googleId = (String) principal.getAttribute("sub");
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
        }
        // Log out after deleting account
        new SecurityContextLogoutHandler().logout(request, response, null);
        return ResponseEntity.ok(new ApiResponse("success", "Account deleted and logged out"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, null);
        return ResponseEntity.ok(new ApiResponse("success", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        return ResponseEntity.ok(new ApiResponse("success", "User info fetched", principal.getAttributes()));
    }
}
