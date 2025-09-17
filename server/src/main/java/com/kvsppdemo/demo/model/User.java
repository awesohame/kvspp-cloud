package com.kvsppdemo.demo.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String googleId;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;
    private String profilePicture;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // getters and setters
}

