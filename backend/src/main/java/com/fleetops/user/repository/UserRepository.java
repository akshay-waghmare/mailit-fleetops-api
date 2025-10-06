package com.fleetops.user.repository;

import com.fleetops.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository - Spring Data JPA repository for User entity
 * Epic E10: Minimal RBAC (User Management)
 * Task T010: Create UserRepository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username
     * Used for authentication
     * 
     * @param username Username to search for
     * @return Optional containing user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find user by email
     * Used for duplicate email validation
     * 
     * @param email Email to search for
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if username already exists
     * Used for validation during user creation
     * 
     * @param username Username to check
     * @return true if username exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Check if email already exists
     * Used for validation during user creation
     * 
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find active users with a specific role
     * Used for agent listing in Delivery Sheet integration
     * 
     * @param isActive Active status filter
     * @param roleName Role name to filter by (e.g., "AGENT")
     * @return List of users matching criteria
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE u.isActive = :isActive AND r.name = :roleName")
    List<User> findByIsActiveAndRoles_Name(@Param("isActive") Boolean isActive, @Param("roleName") String roleName);

    /**
     * Find all active users
     * Used for user listing
     * 
     * @param isActive Active status filter
     * @return List of active/inactive users
     */
    List<User> findByIsActive(Boolean isActive);
}
