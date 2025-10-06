package com.fleetops.auth.controller;

import com.fleetops.user.entity.User;
import com.fleetops.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth/_debug")
@Profile("dev")
public class AuthDebugController {

    private static final Logger log = LoggerFactory.getLogger(AuthDebugController.class);

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthDebugController(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    /**
     * Check password against stored hash for a given username (DEV only)
     */
    @PostMapping("/check")
    public ResponseEntity<?> check(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "admin");
        String password = body.get("password");

        Map<String, Object> out = new HashMap<>();
        out.put("encoderClass", passwordEncoder.getClass().getName());
        out.put("username", username);
        out.put("providedPasswordLength", password != null ? password.length() : null);

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            out.put("error", "USER_NOT_FOUND");
            return ResponseEntity.ok(out);
        }

        User user = userOpt.get();
        String hash = user.getPasswordHash();
        boolean matches = password != null && passwordEncoder.matches(password, hash);

        out.put("storedHashLength", hash != null ? hash.length() : null);
        out.put("storedHashPrefix", hash != null && hash.length() >= 4 ? hash.substring(0, 4) : hash);
        out.put("matches", matches);

        // Also provide a fresh encoded sample for the provided password to visually compare
        if (password != null) {
            out.put("sampleEncode", passwordEncoder.encode(password));
        }

        log.info("[DEBUG] Password check for user={} -> matches={} encoder={}", username, matches, passwordEncoder.getClass().getSimpleName());
        return ResponseEntity.ok(out);
    }
}
