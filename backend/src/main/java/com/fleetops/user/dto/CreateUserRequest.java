package com.fleetops.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.util.List;

/**
 * CreateUserRequest DTO - Request body for POST /api/v1/users
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record CreateUserRequest(
    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, underscores, and hyphens")
    String username,
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,
    
    @NotBlank(message = "Full name is required")
    String fullName,
    
    String phone,
    
    @NotBlank(message = "Password is required")
    String password,
    
    @NotEmpty(message = "At least one role is required")
    List<String> roles,
    
    Boolean isActive
) {
    // Default isActive to true if not provided
    public CreateUserRequest {
        if (isActive == null) {
            isActive = true;
        }
    }
}
