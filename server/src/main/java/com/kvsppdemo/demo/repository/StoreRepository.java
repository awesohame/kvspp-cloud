package com.kvsppdemo.demo.repository;

import com.kvsppdemo.demo.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface StoreRepository extends JpaRepository<Store, UUID> {
    Store findByToken(String token);
}

