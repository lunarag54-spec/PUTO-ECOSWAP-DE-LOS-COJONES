package com.ecoswap.backend.dto;

import com.ecoswap.backend.entity.Product.Condition;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private Condition condition;
    private String imageUrl;
    private String username;
    private LocalDateTime createdAt;
}