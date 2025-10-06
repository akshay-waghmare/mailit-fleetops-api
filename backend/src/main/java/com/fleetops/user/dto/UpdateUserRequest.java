package com.fleetops.user.dto;

import jakarta.validation.constraints.Email;

import java.util.List;

/**
 * UpdateUserRequest DTO - Request body for PUT /api/v1/users/{id}
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record UpdateUserRequest(
    @Email(message = "Email must be valid")
    String email,
    
    String fullName,
    String phone,
    List<String> roles,
    Boolean isActive
) {}
