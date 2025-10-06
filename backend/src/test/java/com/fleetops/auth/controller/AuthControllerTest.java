package com.fleetops.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract Test for POST /api/v1/auth/login
 * Epic E10: Minimal RBAC (User Management)
 * Task T005: Write contract test for login endpoint
 * 
 * EXPECTED STATUS: FAILING (endpoint not implemented yet)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test Case 1: Login with valid credentials should return tokens
     * Expected: 200 OK with accessToken, refreshToken, user object
     */
    @Test
    void login_withValidCredentials_returnsTokens() throws Exception {
        // Given: Valid admin credentials from V13 migration
        String loginRequest = """
            {
                "username": "admin",
                "password": "Admin@123"
            }
            """;

        // When: POST to /api/v1/auth/login
        // Then: Should return 200 OK with tokens and user info
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(jsonPath("$.refreshToken").exists())
            .andExpect(jsonPath("$.expiresIn").isNumber())
            .andExpect(jsonPath("$.user.username").value("admin"))
            .andExpect(jsonPath("$.user.email").value("admin@mailit.com"))
            .andExpect(jsonPath("$.user.fullName").value("System Administrator"))
            .andExpect(jsonPath("$.user.roles").isArray())
            .andExpect(jsonPath("$.user.roles[0]").value("ADMIN"));
    }

    /**
     * Test Case 2: Login with invalid credentials should return 401
     * Expected: 401 Unauthorized
     */
    @Test
    void login_withInvalidCredentials_returns401() throws Exception {
        // Given: Invalid password
        String loginRequest = """
            {
                "username": "admin",
                "password": "WrongPassword123"
            }
            """;

        // When: POST to /api/v1/auth/login with wrong password
        // Then: Should return 401 Unauthorized
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
            .andExpect(status().isUnauthorized());
    }

    /**
     * Test Case 3: Login with missing fields should return 400
     * Expected: 400 Bad Request
     */
    @Test
    void login_withMissingFields_returns400() throws Exception {
        // Given: Request missing password field
        String loginRequest = """
            {
                "username": "admin"
            }
            """;

        // When: POST to /api/v1/auth/login with incomplete data
        // Then: Should return 400 Bad Request
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
            .andExpect(status().isBadRequest());
    }
}
