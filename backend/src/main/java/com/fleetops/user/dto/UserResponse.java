package com.fleetops.user.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * UserResponse DTO - Response for user-related endpoints
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record UserResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String phone,
    List<String> roles,
    Boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime lastLogin
) {}
