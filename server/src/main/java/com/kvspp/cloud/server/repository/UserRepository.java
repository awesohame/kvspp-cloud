package com.kvspp.cloud.server.repository;

import com.kvspp.cloud.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.stores s " +
           "LEFT JOIN FETCH s.owners " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithStores(@Param("id") UUID id);
}
