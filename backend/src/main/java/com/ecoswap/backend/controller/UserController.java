package com.ecoswap.backend.controller;

import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<User> getPublicProfile(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setBio(request.get("bio"));
        user.setPhone(request.get("phone"));
        user.setAddress(request.get("address"));
        user.setCity(request.get("city"));
        user.setPostalCode(request.get("postalCode"));

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña actual es incorrecta"));
        }

        // Validate new password pattern (complexity check)
        if (newPassword == null || !newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "La nueva contraseña debe contener al menos una letra mayúscula, una minúscula, un número, un carácter especial y tener 8 caracteres mínimo."));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("image") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El archivo de imagen está vacío"));
        }

        // Validate size (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "La imagen excede el límite permitido de 2MB"));
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && 
                                    !contentType.equals("image/png") && 
                                    !contentType.equals("image/webp") && 
                                    !contentType.equals("image/gif"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "El archivo debe ser una imagen válida (JPG, PNG, WEBP, GIF)"));
        }

        try {
            String uploadDir = "uploads/avatars/";
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + username + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            user.setAvatarUrl("/uploads/avatars/" + fileName);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("avatarUrl", user.getAvatarUrl()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error al guardar el avatar: " + e.getMessage()));
        }
    }
}
