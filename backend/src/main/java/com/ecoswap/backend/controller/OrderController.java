package com.ecoswap.backend.controller;

import com.ecoswap.backend.entity.Order;
import com.ecoswap.backend.entity.OrderItem;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.entity.PaymentMethod;
import com.ecoswap.backend.repository.OrderRepository;
import com.ecoswap.backend.repository.UserRepository;
import com.ecoswap.backend.repository.ProductRepository;
import com.ecoswap.backend.repository.FavoriteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FavoriteRepository favoriteRepository;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository, FavoriteRepository favoriteRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.favoriteRepository = favoriteRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Order order = new Order();
            order.setUser(user);
            order.setTotal(request.getTotal());
            order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
            order.setFullName(request.getFullName());
            order.setAddress(request.getAddress());
            order.setCity(request.getCity());
            order.setPostalCode(request.getPostalCode());
            order.setPhone(request.getPhone());

            for (OrderItemRequest itemReq : request.getItems()) {
                if (itemReq.getProductId() != null) {
                    com.ecoswap.backend.entity.Product product = productRepository.findById(itemReq.getProductId())
                            .orElseThrow(() -> new RuntimeException("El producto '" + itemReq.getTitle() + "' ya no está disponible."));

                    // Comprobamos si el comprador es el propietario
                    if (product.getUser().getId().equals(user.getId())) {
                        throw new RuntimeException("No puedes comprar tu propio producto: " + product.getTitle());
                    }

                    // En lugar de borrar físicamente, cambiamos el estado
                    product.setActive(false);
                    product.setSold(true);
                    productRepository.save(product);

                    // Borrar el producto de favoritos de todos los usuarios
                    favoriteRepository.deleteByProductId(itemReq.getProductId());
                }
            }

            List<OrderItem> items = request.getItems().stream().map(item -> {
                OrderItem oi = new OrderItem();
                oi.setTitle(item.getTitle());
                oi.setPrice(item.getPrice());
                oi.setImageUrl(item.getImageUrl());
                oi.setProductId(item.getProductId());
                if (item.getProductId() != null) {
                    com.ecoswap.backend.entity.Product product = productRepository.findById(item.getProductId()).orElse(null);
                    if (product != null) {
                        oi.setSeller(product.getUser());
                    }
                }
                return oi;
            }).collect(Collectors.toList());

            order.setItems(items);

            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-sales")
    public ResponseEntity<List<Order>> getMySales() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Order> orders = orderRepository.findBySellerIdOrderByOrderDateDesc(user.getId());
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

            String newStatus = requestBody.get("status").toUpperCase();
            if (!newStatus.equals("SHIPPED") && !newStatus.equals("DELIVERED") && !newStatus.equals("PENDING")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Estado inválido"));
            }

            if (newStatus.equals("DELIVERED")) {
                if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
                    return ResponseEntity.status(403).body(Map.of("message", "Solo el comprador puede marcar el pedido como entregado"));
                }
            } else if (newStatus.equals("SHIPPED")) {
                if (order.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
                    return ResponseEntity.status(403).body(Map.of("message", "El comprador no puede marcar el pedido como enviado"));
                }
            }

            order.setStatus(newStatus);
            orderRepository.save(order);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

class OrderRequest {
    private BigDecimal total;
    private String paymentMethod;
    private List<OrderItemRequest> items;
    private String fullName;
    private String address;
    private String city;
    private String postalCode;
    private String phone;

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}

class OrderItemRequest {
    private Long productId;
    private String title;
    private BigDecimal price;
    private String imageUrl;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}