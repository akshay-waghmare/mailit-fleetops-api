package com.fleetops.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Contract Test for POST /api/v1/users
 * Epic E10: Minimal RBAC (User Management)
 * Task T006: Write contract test for create user endpoint
 * 
 * EXPECTED STATUS: FAILING (endpoint not implemented yet)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test Case 1: Admin can create user successfully
     * Expected: 201 Created with user response
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_asAdmin_returns201() throws Exception {
        // Given: Valid user creation request
        String createUserRequest = """
            {
                "username": "test.staff",
                "email": "test.staff@mailit.com",
                "fullName": "Test Staff User",
                "phone": "+919876543210",
                "password": "TestStaff@123",
                "roles": ["STAFF"],
                "isActive": true
            }
            """;

        // When: Admin creates a new user
        // Then: Should return 201 Created with user response
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.username").value("test.staff"))
            .andExpect(jsonPath("$.email").value("test.staff@mailit.com"))
            .andExpect(jsonPath("$.fullName").value("Test Staff User"))
            .andExpect(jsonPath("$.phone").value("+919876543210"))
            .andExpect(jsonPath("$.roles").isArray())
            .andExpect(jsonPath("$.roles[0]").value("STAFF"))
            .andExpect(jsonPath("$.isActive").value(true))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.passwordHash").doesNotExist()); // Password should never be returned
    }

    /**
     * Test Case 2: Staff cannot create users (403 Forbidden)
     * Expected: 403 Forbidden
     */
    @Test
    @WithMockUser(roles = "STAFF")
    void createUser_asStaff_returns403() throws Exception {
        // Given: Valid user creation request but user is STAFF role
        String createUserRequest = """
            {
                "username": "test.agent",
                "email": "test.agent@mailit.com",
                "fullName": "Test Agent User",
                "password": "TestAgent@123",
                "roles": ["AGENT"],
                "isActive": true
            }
            """;

        // When: Staff tries to create a user
        // Then: Should return 403 Forbidden (user management is admin-only)
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserRequest))
            .andExpect(status().isForbidden());
    }

    /**
     * Test Case 3: Agent cannot create users (403 Forbidden)
     * Expected: 403 Forbidden
     */
    @Test
    @WithMockUser(roles = "AGENT")
    void createUser_asAgent_returns403() throws Exception {
        // Given: Valid user creation request but user is AGENT role
        String createUserRequest = """
            {
                "username": "test.agent2",
                "email": "test.agent2@mailit.com",
                "fullName": "Test Agent 2",
                "password": "TestAgent@123",
                "roles": ["AGENT"],
                "isActive": true
            }
            """;

        // When: Agent tries to create a user
        // Then: Should return 403 Forbidden
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserRequest))
            .andExpect(status().isForbidden());
    }

    /**
     * Test Case 4: Unauthenticated request should return 401
     * Expected: 401 Unauthorized
     */
    @Test
    void createUser_unauthenticated_returns401() throws Exception {
        // Given: Valid user creation request but no authentication
        String createUserRequest = """
            {
                "username": "test.user",
                "email": "test.user@mailit.com",
                "fullName": "Test User",
                "password": "TestUser@123",
                "roles": ["STAFF"]
            }
            """;

        // When: Unauthenticated user tries to create a user
        // Then: Should return 401 Unauthorized
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserRequest))
            .andExpect(status().isUnauthorized());
    }

    /**
     * Test Case 5: Invalid request (missing required fields) should return 400
     * Expected: 400 Bad Request
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_withMissingFields_returns400() throws Exception {
        // Given: Invalid request missing username
        String createUserRequest = """
            {
                "email": "test.user@mailit.com",
                "fullName": "Test User",
                "password": "TestUser@123",
                "roles": ["STAFF"]
            }
            """;

        // When: Admin tries to create user with invalid data
        // Then: Should return 400 Bad Request
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserRequest))
            .andExpect(status().isBadRequest());
    }
}
