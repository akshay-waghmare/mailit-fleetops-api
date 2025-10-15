package com.fleetops.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * RefreshTokenRequest DTO - Request body for POST /api/v1/auth/refresh
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record RefreshTokenRequest(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {}
