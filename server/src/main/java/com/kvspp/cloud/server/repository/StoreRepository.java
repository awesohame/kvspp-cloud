package com.kvspp.cloud.server.repository;

import com.kvspp.cloud.server.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface StoreRepository extends JpaRepository<Store, UUID> {
    Store findByToken(String token);

    @Query("SELECT s FROM Store s LEFT JOIN FETCH s.owners WHERE s.token = :token")
    Store findByTokenWithOwners(@Param("token") String token);
}
