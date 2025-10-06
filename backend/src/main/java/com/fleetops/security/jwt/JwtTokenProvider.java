package com.fleetops.security.jwt;

import com.fleetops.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JwtTokenProvider - JWT token generation and validation utility
 * Epic E10: Minimal RBAC (User Management)
 * Task T012: Create JwtTokenProvider
 * 
 * Handles:
 * - Access token generation (2-hour expiry)
 * - Refresh token generation (7-day expiry)
 * - Token validation
 * - Claims extraction (userId, roles)
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // Token expiry times
    private static final long ACCESS_TOKEN_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours
    private static final long REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

    @Value("${jwt.secret:fleetops-secret-key-minimum-32-characters-for-hs256-algorithm}")
    private String jwtSecret;

    /**
     * Generate access token with 2-hour expiry
     * Contains claims: userId, username, roles
     * 
     * @param user User for whom to generate token
     * @return JWT access token
     */
    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY);

        List<String> roles = user.getRoles().stream()
            .map(role -> role.getName())
            .collect(Collectors.toList());

        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("userId", user.getId())
            .claim("username", user.getUsername())
            .claim("roles", roles)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Generate refresh token with 7-day expiry
     * Contains only userId claim (minimal payload)
     * 
     * @param user User for whom to generate token
     * @return JWT refresh token
     */
    public String generateRefreshToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY);

        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("userId", user.getId())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Validate JWT token
     * Checks signature and expiration
     * 
     * @param token JWT token to validate
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Extract user ID from JWT token
     * 
     * @param token JWT token
     * @return User ID as Long
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        Object userIdClaim = claims.get("userId");
        
        if (userIdClaim instanceof Integer) {
            return ((Integer) userIdClaim).longValue();
        } else if (userIdClaim instanceof Long) {
            return (Long) userIdClaim;
        }
        
        throw new IllegalArgumentException("Invalid userId claim in token");
    }

    /**
     * Extract username from JWT token
     * 
     * @param token JWT token
     * @return Username
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("username", String.class);
    }

    /**
     * Extract roles from JWT token
     * 
     * @param token JWT token
     * @return List of role names
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("roles", List.class);
    }

    /**
     * Extract all claims from JWT token
     * 
     * @param token JWT token
     * @return Claims object
     */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    /**
     * Get signing key for JWT
     * Uses HS256 algorithm with secret from application.yml
     * 
     * @return SecretKey for JWT signing
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Get access token expiry time in seconds
     * Used for LoginResponse.expiresIn field
     * 
     * @return Expiry time in seconds
     */
    public long getAccessTokenExpiryInSeconds() {
        return ACCESS_TOKEN_EXPIRY / 1000;
    }
}
