package com.kvsppdemo.demo.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "containers")
public class Container {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String containerName;
    private String image;
    private String status;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // getters and setters
}

