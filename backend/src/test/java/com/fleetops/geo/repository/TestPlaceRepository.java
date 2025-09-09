package com.fleetops.geo.repository;

import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import org.locationtech.jts.geom.Point;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@Profile("test")
public interface TestPlaceRepository extends JpaRepository<Place, UUID> {
    
    // Basic filtering - same as main repository
    List<Place> findByOrganizationId(UUID organizationId);
    Page<Place> findByOrganizationId(UUID organizationId, Pageable pageable);
    Page<Place> findByOrganizationIdAndType(UUID organizationId, PlaceType type, Pageable pageable);
    List<Place> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    
    // Search functionality for UI - same as main repository
    @Query("SELECT p FROM Place p WHERE " +
           "(:organizationId IS NULL OR p.organizationId = :organizationId) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(p.addressLine1) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:country IS NULL OR LOWER(p.country) = LOWER(:country)) AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city))")
    Page<Place> findPlacesWithFilters(@Param("organizationId") UUID organizationId,
                                      @Param("type") PlaceType type,
                                      @Param("search") String search,
                                      @Param("country") String country,
                                      @Param("city") String city,
                                      Pageable pageable);
    
    // Dummy spatial queries that return empty lists for tests
    default List<Place> findWithinRadius(Point center, double radiusMeters) {
        return List.of();
    }
    
    default List<Place> findByOrganizationWithinRadius(UUID organizationId, Point center, double radiusMeters) {
        return List.of();
    }
    
    default List<Place> findByOrganizationOrderByDistance(UUID organizationId, Point center) {
        return List.of();
    }
    
    // Business logic queries
    boolean existsByOrganizationIdAndNameIgnoreCase(UUID organizationId, String name);
}
