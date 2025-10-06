package com.fleetops.auth.dto;

import com.fleetops.user.dto.UserInfo;

/**
 * LoginResponse DTO - Response for POST /api/v1/auth/login
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record LoginResponse(
    String accessToken,
    String refreshToken,
    Long expiresIn,
    UserInfo user
) {}
