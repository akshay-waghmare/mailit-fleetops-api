package com.fleetops;

import com.fleetops.user.entity.Role;
import com.fleetops.user.entity.User;
import com.fleetops.user.repository.RoleRepository;
import com.fleetops.user.repository.UserRepository;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

/**
 * TestDataSeeder - Seeds test database with roles and admin user
 * Epic E10: Minimal RBAC (User Management)
 * 
 * Replicates V12 and V13 migrations for test environment
 */
@TestComponent
public class TestDataSeeder {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TestDataSeeder(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    @Transactional
    public void seedTestData() {
        // Skip if already seeded
        if (roleRepository.existsByName("ADMIN")) {
            return;
        }

        // Create roles (from V12 migration)
        Role adminRole = Role.builder()
            .name("ADMIN")
            .description("Administrator with full system access")
            .build();
        roleRepository.save(adminRole);

        Role staffRole = Role.builder()
            .name("STAFF")
            .description("Staff user with standard permissions")
            .build();
        roleRepository.save(staffRole);

        Role agentRole = Role.builder()
            .name("AGENT")
            .description("Delivery agent with limited permissions")
            .build();
        roleRepository.save(agentRole);

        // Create default admin user (from V13 migration)
        // Password: Admin@123
        User adminUser = User.builder()
            .username("admin")
            .email("admin@mailit.com")
            .passwordHash(passwordEncoder.encode("Admin@123"))
            .fullName("System Administrator")
            .isActive(true)
            .build();
        adminUser.addRole(adminRole);
        userRepository.save(adminUser);
    }
}
