package com.kvsppdemo.demo.controller;

import com.kvsppdemo.demo.model.Store;
import com.kvsppdemo.demo.model.User;
import com.kvsppdemo.demo.repository.StoreRepository;
import com.kvsppdemo.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/store")
public class StoreController {
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse> createStore(@AuthenticationPrincipal OAuth2User principal, @RequestBody Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        String googleId = (String) principal.getAttribute("sub");
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "User not found"));
        }
        String name = body.get("name");
        String description = body.getOrDefault("description", "");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", "Store name is required"));
        }
        Store store = new Store();
        // Generate a unique token for the store
        String token;
        int attempts = 0;
        do {
            token = UUID.randomUUID().toString();
            attempts++;
            if (attempts > 5) {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Failed to generate unique store token. Please try again."));
            }
        } while (storeRepository.findByToken(token) != null);
        store.setToken(token);
        store.setName(name);
        store.setDescription(description);
        store.getOwners().add(userOpt.get());
        storeRepository.save(store);
        userOpt.get().getStores().add(store);
        userRepository.save(userOpt.get());
        return ResponseEntity.ok(new ApiResponse("success", "Store created", Map.of(
            "token", store.getToken(),
            "name", store.getName(),
            "description", store.getDescription()
        )));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> listStores(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        String googleId = (String) principal.getAttribute("sub");
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "User not found"));
        }
        Set<Store> stores = userOpt.get().getStores();
        List<Map<String, Object>> storeList = stores.stream().map(store -> Map.of(
            "token", (Object) store.getToken(),
            "name", (Object) store.getName(),
            "description", (Object) store.getDescription()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("success", "Stores fetched", storeList));
    }

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse> getStore(@AuthenticationPrincipal OAuth2User principal, @PathVariable("token") String token) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        String googleId = (String) principal.getAttribute("sub");
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "User not found"));
        }
        Store store = storeRepository.findByToken(token);
        if (store == null) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "Store not found"));
        }
        if (!store.getOwners().contains(userOpt.get())) {
            return ResponseEntity.status(403).body(new ApiResponse("error", "Forbidden: not an owner of this store"));
        }
        return ResponseEntity.ok(new ApiResponse("success", "Store fetched", Map.of(
            "token", store.getToken(),
            "name", store.getName(),
            "description", store.getDescription()
        )));
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<ApiResponse> deleteStore(@AuthenticationPrincipal OAuth2User principal, @PathVariable("token") String token) {
        if (principal == null) {
            return ResponseEntity.status(401).body(new ApiResponse("error", "Not authenticated"));
        }
        String googleId = (String) principal.getAttribute("sub");
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "User not found"));
        }
        Store store = storeRepository.findByToken(token);
        if (store == null) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "Store not found"));
        }
        if (!store.getOwners().contains(userOpt.get())) {
            return ResponseEntity.status(403).body(new ApiResponse("error", "Forbidden: not an owner of this store"));
        }
        // Remove the store from all owners' store sets to clear the join table
        Set<User> owners = new HashSet<>(store.getOwners());
        for (User owner : owners) {
            owner.getStores().remove(store);
            userRepository.save(owner);
        }
        store.getOwners().clear();
        storeRepository.save(store);
        storeRepository.delete(store);
        return ResponseEntity.ok(new ApiResponse("success", "Store deleted"));
    }
}
