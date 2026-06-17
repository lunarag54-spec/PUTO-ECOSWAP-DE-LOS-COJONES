package com.ecoswap.backend.repository;

import com.ecoswap.backend.entity.Product;
import com.ecoswap.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByUser(User user);

    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isSold = false AND " +
            "(COALESCE(:search, '') = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(COALESCE(:category, '') = '' OR p.category = :category) AND " +
            "(COALESCE(:condition, '') = '' OR p.condition = :condition) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> search(@Param("search") String search,
            @Param("category") String category,
            @Param("condition") Product.Condition condition,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    long countByIsActiveTrueAndIsSoldFalse();

    long countByIsSoldTrue();

    @Query("SELECT p.category, COUNT(p), SUM(p.price) FROM Product p WHERE p.isSold = true GROUP BY p.category")
    List<Object[]> getSalesStatsByCategory();
}