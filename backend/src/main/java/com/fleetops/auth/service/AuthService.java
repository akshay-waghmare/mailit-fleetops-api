package com.fleetops.auth.service;

import com.fleetops.auth.dto.LoginRequest;
import com.fleetops.auth.dto.LoginResponse;
import com.fleetops.auth.dto.RefreshTokenResponse;
import com.fleetops.security.jwt.JwtTokenProvider;
import com.fleetops.user.dto.UserInfo;
import com.fleetops.user.entity.User;
import com.fleetops.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AuthService - Business logic for authentication
 * Epic E10: Minimal RBAC (User Management)
 * Task T016: Create AuthService
 * 
 * Handles:
 * - User login (authentication)
 * - Token refresh
 * - Password verification with BCrypt
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Authenticate user and generate JWT tokens
     * 
     * @param request Login credentials (username/email + password)
     * @return LoginResponse with access token, refresh token, and user info
     * @throws RuntimeException if authentication fails
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        logger.info("Login attempt for user: {}", request.username());

        // Find user by username or email
        User user = userRepository.findByUsername(request.username())
            .or(() -> userRepository.findByEmail(request.username()))
            .orElseThrow(() -> {
                logger.warn("Login failed: User not found - {}", request.username());
                return new RuntimeException("Invalid username or password");
            });

        // Check if user is active
        if (!user.getIsActive()) {
            logger.warn("Login failed: User account is inactive - {}", user.getUsername());
            throw new RuntimeException("Account is inactive. Contact administrator.");
        }

        // Verify password using BCrypt with extra diagnostics (dev)
        try {
            String raw = request.password();
            String stored = user.getPasswordHash();

            logger.info("[Auth] Using PasswordEncoder={} for user={}", passwordEncoder.getClass().getName(), user.getUsername());
            logger.debug("[Auth] Stored hash prefix={}, length={}", stored != null && stored.length() >= 4 ? stored.substring(0, 4) : stored, stored != null ? stored.length() : null);

            boolean match = passwordEncoder.matches(raw, stored);
            // Sanity self-check: encode the raw and validate matches(raw, encode(raw)) should be true
            String sampleEncode = passwordEncoder.encode(raw);
            boolean selfCheck = passwordEncoder.matches(raw, sampleEncode);
            logger.info("[Auth] matches(stored)={}, selfCheck(matches(raw, encode(raw)))={}", match, selfCheck);

            if (!match) {
                logger.warn("Login failed: Invalid password for user - {}", user.getUsername());
                throw new RuntimeException("Invalid username or password");
            }
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("[Auth] Password verification error: {}", ex.getMessage(), ex);
            throw new RuntimeException("Authentication error");
        }

        // Update last login timestamp
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        Long expiresIn = jwtTokenProvider.getAccessTokenExpiryInSeconds();

        // Build user info
        UserInfo userInfo = buildUserInfo(user);

        logger.info("Login successful for user: {} with roles: {}", user.getUsername(), user.getRoleNames());

        return new LoginResponse(accessToken, refreshToken, expiresIn, userInfo);
    }

    /**
     * Refresh access token using refresh token
     * 
     * @param refreshToken Valid refresh token
     * @return RefreshTokenResponse with new access token
     * @throws RuntimeException if refresh token is invalid
     */
    @Transactional(readOnly = true)
    public RefreshTokenResponse refreshAccessToken(String refreshToken) {
        logger.debug("Refresh token request received");

        // Validate refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            logger.warn("Refresh token validation failed");
            throw new RuntimeException("Invalid or expired refresh token");
        }

        // Extract user ID from refresh token
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        // Load user from database
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                logger.warn("Refresh token failed: User not found with id - {}", userId);
                return new RuntimeException("User not found");
            });

        // Check if user is still active
        if (!user.getIsActive()) {
            logger.warn("Refresh token failed: User account is inactive - {}", user.getUsername());
            throw new RuntimeException("Account is inactive");
        }

        // Generate new access token
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        Long expiresIn = jwtTokenProvider.getAccessTokenExpiryInSeconds();

        logger.debug("Access token refreshed for user: {}", user.getUsername());

        return new RefreshTokenResponse(newAccessToken, expiresIn);
    }

    /**
     * Build UserInfo DTO from User entity
     * 
     * @param user User entity
     * @return UserInfo DTO
     */
    private UserInfo buildUserInfo(User user) {
        List<String> roles = user.getRoles().stream()
            .map(role -> role.getName())
            .collect(Collectors.toList());

        return new UserInfo(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            roles
        );
    }
}
