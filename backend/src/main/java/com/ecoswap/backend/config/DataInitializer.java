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
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User newAdmin = new User();
            newAdmin.setUsername("admin");
            newAdmin.setEmail("admin@ecoswap.com");
            newAdmin.setRole("ADMIN");
            return newAdmin;
        });

        // Encriptamos la contraseña "Hola123?" y la guardamos
        admin.setPassword(passwordEncoder.encode("Hola123?"));

        userRepository.save(admin);
        System.out.println("=== USUARIO ADMINISTRADOR CONFIGURADO CON CONTRASEÑA: Hola123? ===");
    }
}