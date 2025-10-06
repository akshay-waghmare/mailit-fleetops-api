package com.fleetops.dev;

import com.fleetops.user.entity.User;
import com.fleetops.user.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dev")
@Profile("dev")
public class DevAuthDebugController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevAuthDebugController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/auth/hash-match")
    public ResponseEntity<?> hashMatch(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");

        User user = userRepository.findByUsername(username).orElse(null);
        Map<String, Object> resp = new HashMap<>();
        resp.put("username", username);
        if (user == null) {
            resp.put("error", "USER_NOT_FOUND");
            return ResponseEntity.status(404).body(resp);
        }
        String hash = user.getPasswordHash();
        boolean matches = passwordEncoder.matches(password, hash);
        resp.put("hash", hash);
        resp.put("hashLen", hash != null ? hash.length() : 0);
        resp.put("matches", matches);
        resp.put("provided", password);
        // Also return a fresh hash for comparison (do not store)
        resp.put("freshHashSample", passwordEncoder.encode(password));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/auth/set-password")
    public ResponseEntity<?> setPassword(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");

        User user = userRepository.findByUsername(username).orElse(null);
        Map<String, Object> resp = new HashMap<>();
        resp.put("username", username);
        if (user == null) {
            resp.put("error", "USER_NOT_FOUND");
            return ResponseEntity.status(404).body(resp);
        }
        String newHash = passwordEncoder.encode(password);
        user.setPasswordHash(newHash);
        userRepository.save(user);
        resp.put("updated", true);
        resp.put("newHashLen", newHash.length());
        return ResponseEntity.ok(resp);
    }
}
