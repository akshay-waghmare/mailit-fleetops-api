package com.fleetops.auth.dto;

/**
 * RefreshTokenResponse DTO - Response for POST /api/v1/auth/refresh
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record RefreshTokenResponse(
    String accessToken,
    Long expiresIn
) {}
