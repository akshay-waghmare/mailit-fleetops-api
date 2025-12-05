package com.fleetops.auth.controller;

import com.fleetops.auth.dto.LoginRequest;
import com.fleetops.auth.dto.LoginResponse;
import com.fleetops.auth.dto.RefreshTokenRequest;
import com.fleetops.auth.dto.RefreshTokenResponse;
import com.fleetops.auth.service.AuthService;
import com.fleetops.user.dto.CreateUserRequest;
import com.fleetops.user.dto.UserResponse;
import com.fleetops.user.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AuthController - REST endpoints for authentication
 * Epic E10: Minimal RBAC (User Management)
 * Task T017: Create AuthController
 * 
 * Endpoints:
 * - POST /api/v1/auth/register - Public user registration
 * - POST /api/v1/auth/login - User login
 * - POST /api/v1/auth/refresh - Refresh access token
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /**
     * POST /api/v1/auth/register
     * Public endpoint for user self-registration
     * - Allows role specification in request (ADMIN, STAFF, AGENT)
     * - Defaults to STAFF if no role specified
     * 
     * @param request User registration details (including optional roles)
     * @return UserResponse with created user info
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateUserRequest request) {
        try {
            // Determine which roles to assign
            List<String> rolesToAssign;
            
            if (request.roles() != null && !request.roles().isEmpty()) {
                // Use requested roles (ADMIN, STAFF, AGENT, etc.)
                rolesToAssign = request.roles();
            } else {
                // No roles specified, default to STAFF
                rolesToAssign = List.of("STAFF");
            }
            
            // Create user with specified or default roles
            CreateUserRequest validatedRequest = new CreateUserRequest(
                request.username(),
                request.email(),
                request.fullName(),
                request.phone(),
                request.password(),
                rolesToAssign,
                true
            );
            
            UserResponse response = userService.createUser(validatedRequest);
            logger.info("New user registered: {} with roles: {}", response.username(), rolesToAssign);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException ex) {
            logger.error("Registration failed: {}", ex.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "REGISTRATION_FAILED");
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
     * POST /api/v1/auth/login
     * Authenticate user and return JWT tokens
     * 
     * @param request Login credentials (username + password)
     * @return LoginResponse with tokens and user info
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            logger.error("Login failed: {}", ex.getMessage());
            
            // Determine appropriate status code
            HttpStatus status = ex.getMessage().contains("inactive") 
                ? HttpStatus.FORBIDDEN 
                : HttpStatus.UNAUTHORIZED;
            
            Map<String, String> error = new HashMap<>();
            error.put("error", status == HttpStatus.FORBIDDEN ? "ACCOUNT_INACTIVE" : "AUTHENTICATION_FAILED");
            error.put("message", ex.getMessage());
            
            return ResponseEntity.status(status).body(error);
        }
    }

    /**
     * POST /api/v1/auth/refresh
     * Refresh expired access token using valid refresh token
     * 
     * @param request Refresh token
     * @return RefreshTokenResponse with new access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            RefreshTokenResponse response = authService.refreshAccessToken(request.refreshToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            logger.error("Token refresh failed: {}", ex.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "INVALID_TOKEN");
            error.put("message", ex.getMessage());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
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
