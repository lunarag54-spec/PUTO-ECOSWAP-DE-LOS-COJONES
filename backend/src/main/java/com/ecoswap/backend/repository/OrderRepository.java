package com.ecoswap.backend.repository;

import com.ecoswap.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.seller.id = :sellerId ORDER BY o.orderDate DESC")
    List<Order> findBySellerIdOrderByOrderDateDesc(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o")
    java.math.BigDecimal getTotalRevenue();
}