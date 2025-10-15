package com.fleetops.user.controller;

import com.fleetops.user.dto.CreateUserRequest;
import com.fleetops.user.dto.UpdateUserRequest;
import com.fleetops.user.dto.UserResponse;
import com.fleetops.user.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * UserController - REST endpoints for user management
 * Epic E10: Minimal RBAC (User Management)
 * Task T019: Create UserController
 * 
 * All endpoints require ADMIN role
 * 
 * Endpoints:
 * - POST /api/v1/users - Create user
 * - GET /api/v1/users - List users
 * - GET /api/v1/users/{id} - Get user by ID
 * - PUT /api/v1/users/{id} - Update user
 * - PATCH /api/v1/users/{id}/password - Reset password
 * - DELETE /api/v1/users/{id} - Delete user (soft delete)
 * - GET /api/v1/users/agents - List active agents
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/v1/users
     * Create new user (ADMIN only)
     * 
     * @param request User creation request
     * @return UserResponse with created user
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            UserResponse response = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException ex) {
            logger.error("User creation failed: {}", ex.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "VALIDATION_ERROR");
            error.put("message", ex.getMessage());
            
            Map<String, String> fields = new HashMap<>();
            if (ex.getMessage().contains("Username already exists")) {
                fields.put("username", ex.getMessage());
            } else if (ex.getMessage().contains("Email already exists")) {
                fields.put("email", ex.getMessage());
            } else if (ex.getMessage().contains("Invalid role")) {
                fields.put("roles", ex.getMessage());
            }
            error.put("fields", fields);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /api/v1/users
     * List all users with pagination (ADMIN only)
     * 
     * @param pageable Pagination parameters
     * @return Page of UserResponse
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/v1/users/{id}
     * Get user by ID (ADMIN only)
     * 
     * @param id User ID
     * @return UserResponse
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserResponse response = userService.getUserById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            logger.error("Get user failed: {}", ex.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "USER_NOT_FOUND");
            error.put("message", ex.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * PUT /api/v1/users/{id}
     * Update user details (ADMIN only)
     * 
     * @param id User ID
     * @param request Update request
     * @return Updated UserResponse
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, 
                                       @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserResponse response = userService.updateUser(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            logger.error("User update failed: {}", ex.getMessage());
            
            HttpStatus status = ex.getMessage().contains("not found") 
                ? HttpStatus.NOT_FOUND 
                : HttpStatus.BAD_REQUEST;
            
            Map<String, String> error = new HashMap<>();
            error.put("error", status == HttpStatus.NOT_FOUND ? "USER_NOT_FOUND" : "VALIDATION_ERROR");
            error.put("message", ex.getMessage());
            
            return ResponseEntity.status(status).body(error);
        }
    }

    /**
     * PATCH /api/v1/users/{id}/password
     * Reset user password (ADMIN only)
     * 
     * @param id User ID
     * @param requestBody Password reset request
     * @return No content on success
     */
    @PatchMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, 
                                          @RequestBody Map<String, String> requestBody) {
        try {
            String newPassword = requestBody.get("newPassword");
            if (newPassword == null || newPassword.isBlank()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "VALIDATION_ERROR");
                error.put("message", "New password is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            userService.resetPassword(id, newPassword);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            logger.error("Password reset failed: {}", ex.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "USER_NOT_FOUND");
            error.put("message", ex.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * DELETE /api/v1/users/{id}
     * Delete user - soft delete by deactivating (ADMIN only)
     * 
     * @param id User ID
     * @return No content on success
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            logger.error("User deletion failed: {}", ex.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "USER_NOT_FOUND");
            error.put("message", ex.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * GET /api/v1/users/agents
     * Get all active agents (ADMIN or STAFF)
     * Used for Delivery Sheet integration
     * 
     * @return List of active agent users
     */
    @GetMapping("/agents")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserResponse>> getActiveAgents() {
        List<UserResponse> agents = userService.getActiveAgents();
        return ResponseEntity.ok(agents);
    }

    /**
     * Exception handler for validation errors
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "VALIDATION_ERROR");
        error.put("message", "Request validation failed");
        
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError -> 
            fields.put(fieldError.getField(), fieldError.getDefaultMessage())
        );
        error.put("fields", fields);
        
        return ResponseEntity.badRequest().body(error);
    }
}
