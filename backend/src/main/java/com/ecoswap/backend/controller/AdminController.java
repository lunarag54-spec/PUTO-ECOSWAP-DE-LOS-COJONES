package com.ecoswap.backend.controller;

import com.ecoswap.backend.dto.ProductResponse;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.repository.ProductRepository;
import com.ecoswap.backend.repository.UserRepository;
import com.ecoswap.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecoswap.backend.repository.OrderRepository;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")   
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final OrderRepository orderRepository;

    public AdminController(UserRepository userRepository,
            ProductRepository productRepository,
            ProductService productService,
            OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.orderRepository = orderRepository;
    }

    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productRepository.findAll().stream()
                .map(productService::mapToResponse)
                .toList();
        return ResponseEntity.ok(products);
    }

    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteAnyProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long totalActiveProducts = productRepository.countByIsActiveTrueAndIsSoldFalse();
        long totalSoldProducts = productRepository.countByIsSoldTrue();
        long totalOrders = orderRepository.count();
        java.math.BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        List<Object[]> categorySales = productRepository.getSalesStatsByCategory();
        List<Map<String, Object>> categoryStats = new java.util.ArrayList<>();
        for (Object[] row : categorySales) {
            Map<String, Object> stat = new java.util.HashMap<>();
            stat.put("category", row[0]);
            stat.put("count", row[1]);
            stat.put("revenue", row[2]);
            categoryStats.add(stat);
        }

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalActiveProducts", totalActiveProducts);
        stats.put("totalSoldProducts", totalSoldProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("categoryStats", categoryStats);

        return ResponseEntity.ok(stats);
    }
}