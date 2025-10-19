package com.kvspp.cloud.server.service;

import com.kvspp.cloud.server.model.Store;
import com.kvspp.cloud.server.model.User;
import com.kvspp.cloud.server.repository.StoreRepository;
import com.kvspp.cloud.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreAccessService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;

    @Transactional
    public AccessResult checkAccess(User user, String storeToken) {
        if(storeToken != null && storeToken.equals("public")){
            return AccessResult.allowed();
        }

        if (user == null) {
            return AccessResult.denied("Not authenticated", "User is not authenticated");
        }

        Store store = storeRepository.findByTokenWithOwners(storeToken);
        if (store == null) {
            return AccessResult.denied("Store not found", "Store not found");
        }

        if (!store.getOwners().contains(user)) {
            return AccessResult.denied("Forbidden", "Not an owner of this store");
        }
        return AccessResult.allowed();
    }
}
