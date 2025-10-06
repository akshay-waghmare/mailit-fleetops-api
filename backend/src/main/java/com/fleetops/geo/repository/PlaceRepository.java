package com.fleetops.geo.repository;

import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaceRepository extends JpaRepository<Place, UUID> {
    
    // Basic filtering
    List<Place> findByOrganizationId(UUID organizationId);
    Page<Place> findByOrganizationId(UUID organizationId, Pageable pageable);
    Page<Place> findByOrganizationIdAndType(UUID organizationId, PlaceType type, Pageable pageable);
    List<Place> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    
    // Search functionality for UI - using native SQL to avoid geometry field issues
    @Query(value = "SELECT p.id, p.organization_id, p.name, p.type, p.address, p.address_line_1, p.address_line_2, " +
           "p.city, p.state, p.postal_code, p.country, p.latitude, p.longitude, p.contact_person, " +
           "p.phone_number, p.email, p.description, p.active, p.created_at, p.updated_at " +
           "FROM places p WHERE " +
           "(:organizationId IS NULL OR p.organization_id = :organizationId) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER('%' || :search || '%') OR " +
           " LOWER(p.address) LIKE LOWER('%' || :search || '%') OR " +
           " LOWER(p.address_line_1) LIKE LOWER('%' || :search || '%')) AND " +
           "(:country IS NULL OR LOWER(p.country) = LOWER(:country)) AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city)) " +
           "ORDER BY p.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM places p WHERE " +
           "(:organizationId IS NULL OR p.organization_id = :organizationId) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER('%' || :search || '%') OR " +
           " LOWER(p.address) LIKE LOWER('%' || :search || '%') OR " +
           " LOWER(p.address_line_1) LIKE LOWER('%' || :search || '%')) AND " +
           "(:country IS NULL OR LOWER(p.country) = LOWER(:country)) AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city))",
           nativeQuery = true)
    Page<Place> findPlacesWithFilters(@Param("organizationId") UUID organizationId,
                                      @Param("type") String type,
                                      @Param("search") String search,
                                      @Param("country") String country,
                                      @Param("city") String city,
                                      Pageable pageable);
    
    // Spatial queries using native SQL since HQL doesn't support spatial functions properly
    @Query(value = "SELECT * FROM places p WHERE ST_DWithin(p.location, :center, :radiusMeters)", nativeQuery = true)
    List<Place> findWithinRadius(@Param("center") Point center, @Param("radiusMeters") double radiusMeters);
    
    @Query(value = "SELECT * FROM places p WHERE p.organization_id = :orgId AND ST_DWithin(p.location, :center, :radiusMeters)", nativeQuery = true)
    List<Place> findByOrganizationWithinRadius(
        @Param("orgId") UUID organizationId, 
        @Param("center") Point center, 
        @Param("radiusMeters") double radiusMeters
    );
    
    @Query(value = "SELECT * FROM places p WHERE p.organization_id = :orgId ORDER BY ST_Distance(p.location, :center)", nativeQuery = true)
    List<Place> findByOrganizationOrderByDistance(
        @Param("orgId") UUID organizationId, 
        @Param("center") Point center
    );
    
    // Business logic queries
    boolean existsByOrganizationIdAndNameIgnoreCase(UUID organizationId, String name);
}
