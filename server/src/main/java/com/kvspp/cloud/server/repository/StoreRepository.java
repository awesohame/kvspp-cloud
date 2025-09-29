package com.kvspp.cloud.server.repository;

import com.kvspp.cloud.server.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface StoreRepository extends JpaRepository<Store, UUID> {
    Store findByToken(String token);
}

