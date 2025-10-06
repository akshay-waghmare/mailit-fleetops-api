package com.fleetops.dev;

import com.fleetops.user.entity.User;
import com.fleetops.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Dev-only helper to ensure the default admin password is consistent with documentation.
 * If the seeded admin hash does not match "Admin@123", this updater will reset it on startup.
 */
@Component
@Profile("dev")
public class AdminPasswordDevFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminPasswordDevFixer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminPasswordDevFixer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            Optional<User> adminOpt = userRepository.findByUsername("admin");
            if (adminOpt.isEmpty()) {
                log.warn("[DevPasswordFix] Admin user not found; skipping password check.");
                return;
            }

            User admin = adminOpt.get();
            String desired = "Admin@123";
            String stored = admin.getPasswordHash();

            if (stored == null || !passwordEncoder.matches(desired, stored)) {
                admin.setPasswordHash(passwordEncoder.encode(desired));
                userRepository.save(admin);
                log.info("[DevPasswordFix] Admin password reset to the documented dev value (Admin@123).");
            } else {
                log.debug("[DevPasswordFix] Admin password already matches the documented dev value.");
            }
        } catch (Exception ex) {
            log.warn("[DevPasswordFix] Skipping admin password check due to error: {}", ex.getMessage());
        }
    }
}