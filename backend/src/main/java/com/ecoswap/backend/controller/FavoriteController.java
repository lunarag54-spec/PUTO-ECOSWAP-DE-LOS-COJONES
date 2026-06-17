package com.ecoswap.backend.controller;

import com.ecoswap.backend.entity.Product;
import com.ecoswap.backend.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long productId) {
        favoriteService.addFavorite(productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long productId) {
        favoriteService.removeFavorite(productId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Product>> getMyFavorites() {
        return ResponseEntity.ok(favoriteService.getMyFavorites());
    }
}