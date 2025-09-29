package com.kvspp.cloud.server.repository;

import com.kvspp.cloud.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByEmail(String email);
}
