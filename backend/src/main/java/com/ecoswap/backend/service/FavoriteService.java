package com.ecoswap.backend.service;

import com.ecoswap.backend.entity.Favorite;
import com.ecoswap.backend.entity.Product;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.repository.FavoriteRepository;
import com.ecoswap.backend.repository.ProductRepository;
import com.ecoswap.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public void addFavorite(Long productId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (favoriteRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            throw new RuntimeException("Ya está en favoritos");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();

        favoriteRepository.save(favorite);
    }

    public void removeFavorite(Long productId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        Favorite favorite = favoriteRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new RuntimeException("No está en favoritos"));

        favoriteRepository.delete(favorite);
    }

    public List<Product> getMyFavorites() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(Favorite::getProduct)
                .toList();
    }
}