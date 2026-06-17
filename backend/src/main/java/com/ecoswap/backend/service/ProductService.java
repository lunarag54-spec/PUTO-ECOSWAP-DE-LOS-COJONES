package com.ecoswap.backend.service;

import com.ecoswap.backend.dto.ProductRequest;
import com.ecoswap.backend.dto.ProductResponse;
import com.ecoswap.backend.entity.Product;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.exception.ResourceNotFoundException;
import com.ecoswap.backend.repository.ProductRepository;
import com.ecoswap.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public ProductResponse createProduct(ProductRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setCondition(request.getCondition());
        product.setUser(user);
        product.setActive(true);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = saveImage(request.getImage());
            product.setImageUrl(imageUrl);
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    public ProductResponse updateProduct(Long productId, ProductRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (!product.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para editar este producto");
        }

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setCondition(request.getCondition());

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = saveImage(request.getImage());
            product.setImageUrl(imageUrl);
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    private String saveImage(MultipartFile file) {
        // Validación de tamaño (Máximo 5 MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("La imagen excede el límite permitido de 5MB.");
        }

        // Validación de tipo MIME
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && 
                                    !contentType.equals("image/png") && 
                                    !contentType.equals("image/webp") && 
                                    !contentType.equals("image/gif"))) {
            throw new RuntimeException("El archivo debe ser una imagen (formatos válidos: JPG, PNG, WEBP, GIF).");
        }

        try {
            String uploadDir = "uploads/products/";
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen", e);
        }
    }

    public ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setTitle(product.getTitle());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory());
        response.setCondition(product.getCondition());
        response.setImageUrl(product.getImageUrl());
        response.setUsername(product.getUser().getUsername());
        response.setCreatedAt(product.getCreatedAt());
        response.setSold(product.isSold());
        return response;
    }

    public List<ProductResponse> getMyProducts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return productRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteProduct(Long productId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!product.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new RuntimeException("No tienes permiso para eliminar este producto");
        }

        productRepository.delete(product);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        return mapToResponse(product);
    }

    public Page<ProductResponse> searchProducts(String search, String category, Product.Condition condition,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {

        Page<Product> products = productRepository.search(search, category, condition, minPrice, maxPrice, pageable);

        return products.map(this::mapToResponse);
    }
}