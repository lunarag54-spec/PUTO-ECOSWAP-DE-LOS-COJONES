package com.ecoswap.backend.controller;

import com.ecoswap.backend.dto.AuthResponse;
import com.ecoswap.backend.dto.LoginRequest;
import com.ecoswap.backend.dto.RegisterRequest;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.repository.UserRepository;
import com.ecoswap.backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Intento de login para usuario: {}", request.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            String token = jwtUtil.generateToken(authentication);
            User user = (User) authentication.getPrincipal();

            log.info("Login exitoso para usuario: {}", user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole()));

        } catch (Exception e) {
            log.error("Error durante el login del usuario {}: {}", request.getUsername(), e.getMessage(), e);
            // 🛠️ Parche de visibilidad: Devolvemos el error real al frontend para no ir a ciegas
            return ResponseEntity.status(401)
                    .body("Error de autenticación: " + e.getMessage());
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Intentando registrar un nuevo usuario: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("{\"message\": \"El nombre de usuario ya está en uso\"}");
        }


        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("{\"message\": \"El correo electrónico ya está registrado\"}");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole("USER");

        userRepository.save(user);
        log.info("Usuario {} registrado con éxito en la base de datos", user.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            String token = jwtUtil.generateToken(authentication);
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.ok("{\"message\": \"Usuario registrado con éxito\"}");
        }
    }
}
