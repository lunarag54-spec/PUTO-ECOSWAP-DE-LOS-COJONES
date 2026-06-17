package com.ecoswap.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"products", "favorites", "orders", "authorities", "password", "hibernateLazyInitializer", "handler"})
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnoreProperties({"products", "favorites", "orders", "authorities", "password", "hibernateLazyInitializer", "handler"})
    private User recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
