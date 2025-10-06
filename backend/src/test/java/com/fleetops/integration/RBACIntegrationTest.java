package com.fleetops.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Smoke Integration Test - Full E2E Flow
 * Epic E10: Minimal RBAC (User Management)
 * Task T007: Write E2E test for admin creates agent, agent sees scoped DS
 * 
 * EXPECTED STATUS: FAILING (endpoints not implemented yet)
 * 
 * Test Scenario:
 * 1. Admin logs in → GET accessToken
 * 2. Admin creates agent user → POST /api/v1/users
 * 3. Agent logs in → GET accessToken, verify roles contain AGENT
 * 4. Agent tries to access /api/v1/users → GET 403 Forbidden
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class RBACIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgis/postgis:15-3.3")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> true);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Full E2E workflow test:
     * 1. Admin login
     * 2. Admin creates agent
     * 3. Agent login
     * 4. Agent blocked from admin endpoints
     */
    @Test
    void fullFlow_adminCreatesAgent_agentSeesOnlyOwnResources() throws Exception {
        // Step 1: Admin logs in
        String adminLoginRequest = """
            {
                "username": "admin",
                "password": "Admin@123"
            }
            """;

        HttpHeaders adminHeaders = new HttpHeaders();
        adminHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> adminLoginEntity = new HttpEntity<>(adminLoginRequest, adminHeaders);

        ResponseEntity<Map> adminAuthResponse = restTemplate.postForEntity(
            "/api/v1/auth/login",
            adminLoginEntity,
            Map.class
        );

        // Verify admin login successful
        assertThat(adminAuthResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(adminAuthResponse.getBody()).isNotNull();
        assertThat(adminAuthResponse.getBody().get("accessToken")).isNotNull();
        
        String adminToken = (String) adminAuthResponse.getBody().get("accessToken");
        Map<String, Object> adminUser = (Map<String, Object>) adminAuthResponse.getBody().get("user");
        assertThat(adminUser.get("username")).isEqualTo("admin");
        assertThat((List<String>) adminUser.get("roles")).contains("ADMIN");

        // Step 2: Admin creates agent user
        String createAgentRequest = """
            {
                "username": "test.agent",
                "email": "test.agent@mailit.com",
                "fullName": "Test Agent",
                "phone": "+919876543210",
                "password": "Agent@123",
                "roles": ["AGENT"],
                "isActive": true
            }
            """;

        HttpHeaders adminRequestHeaders = new HttpHeaders();
        adminRequestHeaders.setContentType(MediaType.APPLICATION_JSON);
        adminRequestHeaders.setBearerAuth(adminToken);
        HttpEntity<String> createAgentEntity = new HttpEntity<>(createAgentRequest, adminRequestHeaders);

        ResponseEntity<Map> createAgentResponse = restTemplate.exchange(
            "/api/v1/users",
            HttpMethod.POST,
            createAgentEntity,
            Map.class
        );

        // Verify agent created successfully
        assertThat(createAgentResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createAgentResponse.getBody()).isNotNull();
        assertThat(createAgentResponse.getBody().get("username")).isEqualTo("test.agent");
        assertThat((List<String>) createAgentResponse.getBody().get("roles")).contains("AGENT");

        // Step 3: Agent logs in
        String agentLoginRequest = """
            {
                "username": "test.agent",
                "password": "Agent@123"
            }
            """;

        HttpEntity<String> agentLoginEntity = new HttpEntity<>(agentLoginRequest, adminHeaders);

        ResponseEntity<Map> agentAuthResponse = restTemplate.postForEntity(
            "/api/v1/auth/login",
            agentLoginEntity,
            Map.class
        );

        // Verify agent login successful
        assertThat(agentAuthResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(agentAuthResponse.getBody()).isNotNull();
        assertThat(agentAuthResponse.getBody().get("accessToken")).isNotNull();
        
        String agentToken = (String) agentAuthResponse.getBody().get("accessToken");
        Map<String, Object> agentUser = (Map<String, Object>) agentAuthResponse.getBody().get("user");
        assertThat(agentUser.get("username")).isEqualTo("test.agent");
        assertThat((List<String>) agentUser.get("roles")).contains("AGENT");
        assertThat((List<String>) agentUser.get("roles")).doesNotContain("ADMIN", "STAFF");

        // Step 4: Agent tries to access admin-only endpoint (/api/v1/users)
        HttpHeaders agentRequestHeaders = new HttpHeaders();
        agentRequestHeaders.setBearerAuth(agentToken);
        HttpEntity<String> agentGetUsersEntity = new HttpEntity<>(agentRequestHeaders);

        ResponseEntity<String> forbiddenResponse = restTemplate.exchange(
            "/api/v1/users",
            HttpMethod.GET,
            agentGetUsersEntity,
            String.class
        );

        // Verify agent is forbidden from accessing user management
        assertThat(forbiddenResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    /**
     * Test that admin can access all endpoints
     */
    @Test
    void admin_canAccessAllEndpoints() throws Exception {
        // Given: Admin is logged in
        String adminLoginRequest = """
            {
                "username": "admin",
                "password": "Admin@123"
            }
            """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> loginEntity = new HttpEntity<>(adminLoginRequest, headers);

        ResponseEntity<Map> authResponse = restTemplate.postForEntity(
            "/api/v1/auth/login",
            loginEntity,
            Map.class
        );

        assertThat(authResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String adminToken = (String) authResponse.getBody().get("accessToken");

        // When: Admin accesses user management endpoints
        HttpHeaders adminHeaders = new HttpHeaders();
        adminHeaders.setBearerAuth(adminToken);
        HttpEntity<String> adminEntity = new HttpEntity<>(adminHeaders);

        ResponseEntity<String> getUsersResponse = restTemplate.exchange(
            "/api/v1/users",
            HttpMethod.GET,
            adminEntity,
            String.class
        );

        // Then: Admin should have access (200 OK or 204 if no users)
        assertThat(getUsersResponse.getStatusCode()).isIn(HttpStatus.OK, HttpStatus.NO_CONTENT);
    }

    /**
     * Test that invalid credentials fail
     */
    @Test
    void login_withInvalidCredentials_fails() {
        // Given: Invalid credentials
        String invalidLoginRequest = """
            {
                "username": "admin",
                "password": "WrongPassword"
            }
            """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> loginEntity = new HttpEntity<>(invalidLoginRequest, headers);

        // When: Attempting to login with wrong password
        ResponseEntity<Map> authResponse = restTemplate.postForEntity(
            "/api/v1/auth/login",
            loginEntity,
            Map.class
        );

        // Then: Should return 401 Unauthorized
        assertThat(authResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
