package com.ecoswap.backend.config;

import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 🛠️ Verificamos si ya existe un administrador para no duplicarlo
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@ecoswap.com");

            // Encriptamos su contraseña por defecto
            admin.setPassword(passwordEncoder.encode("AdminEco2026!"));

            // ⚠️ Le asignamos el rol estricto que espera tu SecurityConfig
            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("=== USUARIO ADMINISTRADOR CREADO POR DEFECTO ===");
        }
    }
}