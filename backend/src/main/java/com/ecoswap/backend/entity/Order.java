package com.ecoswap.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Builder.Default
    private String status = "PENDING"; // PENDING, SHIPPED, DELIVERED

    private String fullName;
    private String address;
    private String city;
    private String postalCode;
    private String phone;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}

