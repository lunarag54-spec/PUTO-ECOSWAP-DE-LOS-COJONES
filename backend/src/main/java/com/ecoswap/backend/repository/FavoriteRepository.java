package com.ecoswap.backend.repository;

import com.ecoswap.backend.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    List<Favorite> findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Favorite f WHERE f.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}