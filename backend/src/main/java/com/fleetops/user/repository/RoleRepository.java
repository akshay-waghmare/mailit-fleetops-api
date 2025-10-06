package com.fleetops.user.repository;

import com.fleetops.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * RoleRepository - Spring Data JPA repository for Role entity
 * Epic E10: Minimal RBAC (User Management)
 * Task T011: Create RoleRepository
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find role by name
     * Used for role assignment during user creation
     * 
     * @param name Role name (e.g., "ADMIN", "STAFF", "AGENT")
     * @return Optional containing role if found
     */
    Optional<Role> findByName(String name);

    /**
     * Check if role exists by name
     * Used for validation
     * 
     * @param name Role name to check
     * @return true if role exists, false otherwise
     */
    boolean existsByName(String name);
}
