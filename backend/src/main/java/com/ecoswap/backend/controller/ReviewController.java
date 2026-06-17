package com.ecoswap.backend.controller;

import com.ecoswap.backend.entity.Review;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.entity.Order;
import com.ecoswap.backend.repository.ReviewRepository;
import com.ecoswap.backend.repository.UserRepository;
import com.ecoswap.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequest request) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User reviewer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

            User seller = userRepository.findById(request.getSellerId())
                    .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

            if (reviewer.getId().equals(seller.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "No puedes valorarte a ti mismo"));
            }

            if (request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "La valoración debe estar entre 1 y 5 estrellas"));
            }

            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

            // Check if reviewer is the owner of the order
            if (!order.getUser().getId().equals(reviewer.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Solo el comprador del pedido puede dejar una valoración"));
            }

            // Check if already reviewed
            if (reviewRepository.existsByOrderIdAndReviewerIdAndSellerId(request.getOrderId(), reviewer.getId(), seller.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ya has valorado a este vendedor para este pedido"));
            }

            Review review = Review.builder()
                    .reviewer(reviewer)
                    .seller(seller)
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .orderId(request.getOrderId())
                    .build();

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/seller/{username}")
    public ResponseEntity<List<Review>> getReviewsBySeller(@PathVariable String username) {
        List<Review> reviews = reviewRepository.findBySellerUsernameOrderByCreatedAtDesc(username);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/average/{username}")
    public ResponseEntity<?> getAverageRating(@PathVariable String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Double avg = reviewRepository.findAverageRatingBySellerId(seller.getId());
        if (avg == null) {
            avg = 0.0;
        }
        return ResponseEntity.ok(Map.of("average", avg));
    }
}

class ReviewRequest {
    private Long sellerId;
    private Long orderId;
    private int rating;
    private String comment;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
