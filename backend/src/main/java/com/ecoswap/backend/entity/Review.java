package com.ecoswap.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @JsonIgnoreProperties({"products", "favorites", "orders", "authorities", "password", "hibernateLazyInitializer", "handler"})
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"products", "favorites", "orders", "authorities", "password", "hibernateLazyInitializer", "handler"})
    private User seller;

    @Column(nullable = false)
    private int rating; // 1-5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private Long orderId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
