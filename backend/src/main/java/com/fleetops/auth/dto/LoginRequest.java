package com.fleetops.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * LoginRequest DTO - Request body for POST /api/v1/auth/login
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record LoginRequest(
    @NotBlank(message = "Username is required")
    String username,
    
    @NotBlank(message = "Password is required")
    String password
) {}
