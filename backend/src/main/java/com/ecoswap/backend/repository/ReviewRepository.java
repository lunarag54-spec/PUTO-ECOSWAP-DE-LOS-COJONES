package com.ecoswap.backend.repository;

import com.ecoswap.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findBySellerUsernameOrderByCreatedAtDesc(String username);

    List<Review> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.seller.id = :sellerId")
    Double findAverageRatingBySellerId(@Param("sellerId") Long sellerId);

    boolean existsByOrderIdAndReviewerIdAndSellerId(Long orderId, Long reviewerId, Long sellerId);
}
