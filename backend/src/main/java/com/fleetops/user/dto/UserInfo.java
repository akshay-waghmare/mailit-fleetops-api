package com.fleetops.user.dto;

import java.util.List;

/**
 * UserInfo DTO - Nested user info in LoginResponse
 * Epic E10: Minimal RBAC (User Management)
 * Task T015: Create DTOs
 */
public record UserInfo(
    Long id,
    String username,
    String email,
    String fullName,
    List<String> roles
) {}
