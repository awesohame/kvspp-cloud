package com.kvspp.cloud.server.controller;

import com.kvspp.cloud.server.model.Store;
import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.StoreRepository;
import com.kvspp.cloud.server.repository.UserRepository;
import com.kvspp.cloud.server.service.KvsppTcpClientService;
import com.kvspp.cloud.server.service.StoreAccessService;
import com.kvspp.cloud.server.service.AccessResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @Autowired
    private KvsppTcpClientService kvsppTcpClientService;
    @Autowired
    private StoreAccessService storeAccessService;

    @PostMapping
    public ResponseEntity<ApiResponse> createStore(@AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, String> body) {
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
                return ResponseEntity.status(500)
                        .body(new ApiResponse("error", "Failed to generate unique store token. Please try again."));
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
                "description", store.getDescription())));
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
                "name", store.getName(),
                "description", store.getDescription(),
                "createdAt", store.getCreatedAt()
        // "updatedAt", store.getUpdatedAt()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("success", "Stores fetched", storeList));
    }

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse> getStore(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token) {
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
        try {
            // First, load the store
            // String loadResult = kvsppTcpClientService.sendCommand(token, "LOAD " +
            // token);
            // if (!"OK".equals(loadResult)) {
            // return ResponseEntity.status(500).body(new ApiResponse("error", "Failed to
            // load store: " + loadResult));
            // }
            // Select the store and get JSON
            String json = kvsppTcpClientService.sendCommand(token, "JSON");
            // System.out.println("Raw TCP JSON response: [" + json + "]");
            if (json != null && json.trim().startsWith("{")) {
                // Parse JSON string to Map using TypeReference for type safety
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> storeData = mapper.readValue(json,
                        new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                        });
                // Transform the 'store' key if present
                if (storeData.containsKey("store") && storeData.get("store") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> origStore = (Map<String, Object>) storeData.get("store");
                    Map<String, Object> newStore = new HashMap<>();
                    for (Map.Entry<String, Object> entry : origStore.entrySet()) {
                        String k = entry.getKey();
                        Object v = entry.getValue();
                        if ("autosave".equals(k)) {
                            newStore.put(k, v);
                        } else if (v instanceof Map && ((Map<?, ?>) v).containsKey("value")) {
                            newStore.put(k, ((Map<?, ?>) v).get("value"));
                        } else {
                            newStore.put(k, v);
                        }
                    }
                    storeData.put("store", newStore);
                }
                Map<String, Object> response = new HashMap<>();
                response.put("token", store.getToken());
                response.put("name", store.getName());
                response.put("description", store.getDescription());
                response.put("createdAt", store.getCreatedAt());
                // response.put("updatedAt", store.getUpdatedAt());
                response.putAll(storeData); // This will add the 'store' key as in the TCP response
                return ResponseEntity.ok(new ApiResponse("success", "Store fetched", response));
            } else if (json != null && json.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", json));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + json));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<ApiResponse> deleteStore(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token) {
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

    @PutMapping("/{token}")
    public ResponseEntity<ApiResponse> updateStore(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token, @RequestBody Map<String, String> body) {
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
        boolean changed = false;
        if (body.containsKey("name")) {
            String name = body.get("name");
            if (name != null && !name.isBlank()) {
                store.setName(name);
                changed = true;
            }
        }
        if (body.containsKey("description")) {
            store.setDescription(body.get("description"));
            changed = true;
        }
        if (changed) {
            storeRepository.save(store);
            return ResponseEntity.ok(new ApiResponse("success", "Store updated"));
        } else {
            return ResponseEntity.ok(new ApiResponse("success", "Store updated", Map.of(
                    "token", store.getToken(),
                    "name", store.getName(),
                    "description", store.getDescription(),
                    "createdAt", store.getCreatedAt()
            // "updatedAt", store.getUpdatedAt()
            )));
        }
    }

    @PostMapping("/{token}/owners")
    public ResponseEntity<ApiResponse> addOwnerToStore(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token, @RequestBody Map<String, String> body) {
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
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", "Email is required"));
        }
        Optional<User> newOwnerOpt = userRepository.findByEmail(email);
        if (newOwnerOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse("error", "User to add as owner not found"));
        }
        User newOwner = newOwnerOpt.get();
        if (store.getOwners().contains(newOwner)) {
            return ResponseEntity.badRequest().body(new ApiResponse("error", "User is already an owner"));
        }
        store.getOwners().add(newOwner);
        newOwner.getStores().add(store);
        storeRepository.save(store);
        userRepository.save(newOwner);
        return ResponseEntity.ok(new ApiResponse("success", "Owner added to store"));
    }

    // --- KVS++ TCP Endpoints ---

    @GetMapping("/{token}/{key}")
    public ResponseEntity<ApiResponse> getValue(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token, @PathVariable("key") String key) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccessResult access = storeAccessService.checkAccess(authentication, token);
        if (!access.allowed)
            return ResponseEntity.status(403).body(new ApiResponse("error", access.errorMessage));
        try {
            String output = kvsppTcpClientService.sendCommand(token, "GET " + key);
            if (output != null && output.startsWith("VALUE ")) {
                String value = output.substring(6);
                return ResponseEntity.ok(new ApiResponse("success", "Value fetched", Map.of("value", value)));
            } else if ("NOT_FOUND".equals(output)) {
                return ResponseEntity.ok(new ApiResponse("success", "Key not found", Map.of("value", null)));
            } else if (output != null && output.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", output));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + output));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    @PutMapping("/{token}/{key}")
    public ResponseEntity<ApiResponse> putValue(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token, @PathVariable("key") String key,
            @RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccessResult access = storeAccessService.checkAccess(authentication, token);
        if (!access.allowed)
            return ResponseEntity.status(403).body(new ApiResponse("error", access.errorMessage));
        String value = body.get("value");
        if (value == null)
            return ResponseEntity.badRequest().body(new ApiResponse("error", "Missing value"));
        try {
            String output = kvsppTcpClientService.sendCommand(token, "SET " + key + " " + value);
            if ("OK".equals(output)) {
                return ResponseEntity.ok(new ApiResponse("success", "Value stored"));
            } else if (output != null && output.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", output));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + output));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{token}/{key}")
    public ResponseEntity<ApiResponse> deleteValue(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token, @PathVariable("key") String key) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccessResult access = storeAccessService.checkAccess(authentication, token);
        if (!access.allowed)
            return ResponseEntity.status(403).body(new ApiResponse("error", access.errorMessage));
        try {
            String output = kvsppTcpClientService.sendCommand(token, "DELETE " + key);
            if ("OK".equals(output)) {
                return ResponseEntity.ok(new ApiResponse("success", "Key deleted"));
            } else if (output != null && output.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", output));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + output));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    @PostMapping("/{token}/save")
    public ResponseEntity<ApiResponse> saveStore(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccessResult access = storeAccessService.checkAccess(authentication, token);
        if (!access.allowed)
            return ResponseEntity.status(403).body(new ApiResponse("error", access.errorMessage));
        String filename = token;
        try {
            String cmd = (filename != null && !filename.isBlank()) ? "SAVE " + filename : "SAVE";
            String output = kvsppTcpClientService.sendCommand(token, cmd);
            if ("OK".equals(output)) {
                return ResponseEntity.ok(new ApiResponse("success", "Store saved"));
            } else if (output != null && output.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", output));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + output));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    @PostMapping("/{token}/load")
    public ResponseEntity<ApiResponse> loadStore(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccessResult access = storeAccessService.checkAccess(authentication, token);
        if (!access.allowed)
            return ResponseEntity.status(403).body(new ApiResponse("error", access.errorMessage));
        String filename = token;
        try {
            String cmd = (filename != null && !filename.isBlank()) ? "LOAD " + filename : "LOAD";
            String output = kvsppTcpClientService.sendCommand(token, cmd);
            if ("OK".equals(output)) {
                return ResponseEntity.ok(new ApiResponse("success", "Store loaded"));
            } else if (output != null && output.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", output));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + output));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    @PostMapping("/{token}/autosave")
    public ResponseEntity<ApiResponse> setAutosave(@AuthenticationPrincipal OAuth2User principal,
            @PathVariable("token") String token, @RequestBody Map<String, Object> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AccessResult access = storeAccessService.checkAccess(authentication, token);
        if (!access.allowed)
            return ResponseEntity.status(403).body(new ApiResponse("error", access.errorMessage));
        Object autosaveObj = body.get("autosave");
        if (autosaveObj == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse("error", "Missing 'autosave' field (true/false or 'on'/'off')"));
        }
        String value;
        if (autosaveObj instanceof Boolean) {
            value = ((Boolean) autosaveObj) ? "ON" : "OFF";
        } else {
            String str = autosaveObj.toString().trim().toUpperCase();
            if (str.equals("ON") || str.equals("TRUE"))
                value = "ON";
            else if (str.equals("OFF") || str.equals("FALSE"))
                value = "OFF";
            else
                return ResponseEntity.badRequest()
                        .body(new ApiResponse("error", "Invalid value for 'autosave'. Use true/false or 'on'/'off'"));
        }
        try {
            String output = kvsppTcpClientService.sendCommand(token, "AUTOSAVE " + value);
            if ("OK".equals(output)) {
                return ResponseEntity.ok(new ApiResponse("success", "Autosave set to " + value));
            } else if (output != null && output.startsWith("ERROR")) {
                return ResponseEntity.status(400).body(new ApiResponse("error", output));
            } else {
                return ResponseEntity.status(500).body(new ApiResponse("error", "Unexpected response: " + output));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse("error", e.getMessage()));
        }
    }

    // No direct help command in TCP protocol, so this can be omitted or return
    // static info
    @GetMapping("/help")
    public ResponseEntity<ApiResponse> help() {
        return ResponseEntity.ok(new ApiResponse("success", "Help output",
                Map.of("output", "See documentation for available commands.")));
    }
}
