package com.ecoswap.backend.controller;

import com.ecoswap.backend.dto.ProductRequest;
import com.ecoswap.backend.dto.ProductResponse;
import com.ecoswap.backend.entity.Product;
import com.ecoswap.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ProductResponse> create(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam String category,
            @RequestParam String condition,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        ProductRequest request = new ProductRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setPrice(price);
        request.setCategory(category);

        
        try {
            request.setCondition(Product.Condition.valueOf(condition.toUpperCase().trim()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: '" + condition + "'. Los valores permitidos son: NEW, LIKE_NEW, USED, DAMAGED, REFURBISHED");
        }

        request.setImage(image);

        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.ok(response);
    }

    
    
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam String category,
            @RequestParam String condition,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        ProductRequest request = new ProductRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setPrice(price);
        request.setCategory(category);

        try {
            request.setCondition(Product.Condition.valueOf(condition.toUpperCase().trim()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: '" + condition + "'. Los valores permitidos son: NEW, LIKE_NEW, USED, DAMAGED, REFURBISHED");
        }

        request.setImage(image);

        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/my-products")
    public ResponseEntity<List<ProductResponse>> getMyProducts() {
        return ResponseEntity.ok(productService.getMyProducts());
    }

    
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> search(
            @RequestParam(required = false) String search,           
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Product.Condition condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<ProductResponse> result = productService.searchProducts(search, category, condition, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(result);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}