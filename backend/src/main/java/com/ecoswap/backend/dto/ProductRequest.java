package com.ecoswap.backend.dto;

import com.ecoswap.backend.entity.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "El título es obligatorio")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    private BigDecimal price;

    @NotBlank(message = "La categoría es obligatoria")
    private String category;

    @NotNull(message = "La condición es obligatoria")
    private Product.Condition condition;

    private MultipartFile image;   
}