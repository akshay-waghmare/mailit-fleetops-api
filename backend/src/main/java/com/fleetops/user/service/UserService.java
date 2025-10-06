package com.fleetops.user.service;

import com.fleetops.user.dto.CreateUserRequest;
import com.fleetops.user.dto.UpdateUserRequest;
import com.fleetops.user.dto.UserResponse;
import com.fleetops.user.entity.Role;
import com.fleetops.user.entity.User;
import com.fleetops.user.repository.RoleRepository;
import com.fleetops.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * UserService - Business logic for user management
 * Epic E10: Minimal RBAC (User Management)
 * Task T018: Create UserService
 * 
 * Handles:
 * - User CRUD operations
 * - Password hashing with BCrypt
 * - Role assignment
 * - Agent listing for DS integration
 */
@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, 
                      RoleRepository roleRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new user
     * 
     * @param request User creation request
     * @return UserResponse with created user details
     * @throws RuntimeException if validation fails
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        logger.info("Creating user: {}", request.username());

        // Validate username uniqueness
        if (userRepository.existsByUsername(request.username())) {
            logger.warn("User creation failed: Username already exists - {}", request.username());
            throw new RuntimeException("Username already exists: " + request.username());
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.email())) {
            logger.warn("User creation failed: Email already exists - {}", request.email());
            throw new RuntimeException("Email already exists: " + request.email());
        }

        // Build user entity
        User user = User.builder()
            .username(request.username())
            .email(request.email())
            .fullName(request.fullName())
            .phone(request.phone())
            .passwordHash(passwordEncoder.encode(request.password()))
            .isActive(request.isActive())
            .build();

        // Assign roles
        for (String roleName : request.roles()) {
            Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> {
                    logger.error("User creation failed: Invalid role - {}", roleName);
                    return new RuntimeException("Invalid role: " + roleName);
                });
            user.addRole(role);
        }

        // Save user
        user = userRepository.save(user);

        logger.info("User created successfully: {} with roles: {}", user.getUsername(), request.roles());

        return mapToUserResponse(user);
    }

    /**
     * Get all users with pagination and filters
     * 
     * @param pageable Pagination parameters
     * @return Page of UserResponse
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        logger.debug("Fetching all users with pagination");
        return userRepository.findAll(pageable)
            .map(this::mapToUserResponse);
    }

    /**
     * Get user by ID
     * 
     * @param id User ID
     * @return UserResponse
     * @throws RuntimeException if user not found
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        logger.debug("Fetching user by ID: {}", id);
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                logger.warn("User not found with ID: {}", id);
                return new RuntimeException("User not found with ID: " + id);
            });
        return mapToUserResponse(user);
    }

    /**
     * Update user details
     * 
     * @param id User ID
     * @param request Update request
     * @return Updated UserResponse
     * @throws RuntimeException if user not found or validation fails
     */
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        logger.info("Updating user: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                logger.warn("Update failed: User not found with ID: {}", id);
                return new RuntimeException("User not found with ID: " + id);
            });

        // Update email if provided and different
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                logger.warn("Update failed: Email already exists - {}", request.email());
                throw new RuntimeException("Email already exists: " + request.email());
            }
            user.setEmail(request.email());
        }

        // Update other fields
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }

        // Update roles if provided
        if (request.roles() != null && !request.roles().isEmpty()) {
            user.getRoles().clear();
            for (String roleName : request.roles()) {
                Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Invalid role: " + roleName));
                user.addRole(role);
            }
        }

        user = userRepository.save(user);

        logger.info("User updated successfully: {}", user.getUsername());

        return mapToUserResponse(user);
    }

    /**
     * Reset user password (admin-only)
     * 
     * @param id User ID
     * @param newPassword New password (will be hashed)
     */
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        logger.info("Resetting password for user ID: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        logger.info("Password reset successfully for user: {}", user.getUsername());
    }

    /**
     * Get all active agents
     * Used for Delivery Sheet integration
     * 
     * @return List of active agent users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveAgents() {
        logger.debug("Fetching active agents");
        return userRepository.findByIsActiveAndRoles_Name(true, "AGENT")
            .stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
    }

    /**
     * Delete user (soft delete by setting isActive = false)
     * 
     * @param id User ID
     */
    @Transactional
    public void deleteUser(Long id) {
        logger.info("Deactivating user ID: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setIsActive(false);
        userRepository.save(user);

        logger.info("User deactivated: {}", user.getUsername());
    }

    /**
     * Map User entity to UserResponse DTO
     * 
     * @param user User entity
     * @return UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList());

        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            roles,
            user.getIsActive(),
            user.getCreatedAt(),
            user.getLastLogin()
        );
    }
}
