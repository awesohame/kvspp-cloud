package com.kvspp.cloud.server.service;

import com.kvspp.cloud.server.model.Store;
import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.StoreRepository;
import com.kvspp.cloud.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class StoreAccessService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;

    @Transactional
    public AccessResult checkAccess(Authentication authentication, String storeToken) {
        if(storeToken != null && storeToken.equals("public")){
            return AccessResult.allowed();
        }
        if (authentication == null || !authentication.isAuthenticated()) {
            return AccessResult.denied("Not authenticated", "User is not authenticated");
        }
        Object principal = authentication.getPrincipal();
        String googleId = null;
        if (principal instanceof OAuth2User) {
            googleId = (String) ((OAuth2User) principal).getAttribute("sub");
        } else if (principal instanceof org.springframework.security.core.userdetails.User) {
            // handle other user types if needed
        }
        if (googleId == null) {
            return AccessResult.denied("User not found", "Google ID not found");
        }
        Optional<User> userOpt = userRepository.findByGoogleId(googleId);
        if (userOpt.isEmpty()) {
            return AccessResult.denied("User not found", "User not found");
        }
        Store store = storeRepository.findByTokenWithOwners(storeToken);
        if (store == null) {
            return AccessResult.denied("Store not found", "Store not found");
        }
        //for (User owner : store.getOwners()) {
        //    System.out.println("Owner id: " + owner.getId() + ", googleId: " + owner.getGoogleId());
        //}
        if (!store.getOwners().contains(userOpt.get())) {
            return AccessResult.denied("Forbidden", "Not an owner of this store");
        }
        return AccessResult.allowed();
    }
}
