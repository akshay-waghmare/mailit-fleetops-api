package com.fleetops.geo.repository;

import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.util.LocationMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@Disabled("Disabled due to spatial database configuration issues - will be fixed separately")
class PlaceRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PlaceRepository placeRepository;

    private UUID organizationId;
    private Place testPlace;
    private Point testPoint;

    @BeforeEach
    void setUp() {
        organizationId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        testPoint = LocationMapper.createPoint(40.7128, -74.0060);

        testPlace = new Place();
        testPlace.setName("Test Warehouse");
        testPlace.setType(PlaceType.WAREHOUSE);
        testPlace.setOrganizationId(organizationId);
        testPlace.setLocation(testPoint);
        testPlace.setAddress("123 Test St");
        testPlace.setAddressLine1("123 Test St");
        testPlace.setCity("New York");
        testPlace.setState("NY");
        testPlace.setCountry("USA");
        testPlace.setPostalCode("10001");
        testPlace.setCreatedAt(LocalDateTime.now());
        testPlace.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void save_ShouldPersistPlace() {
        // When
        Place savedPlace = placeRepository.save(testPlace);

        // Then
        assertNotNull(savedPlace.getId());
        assertEquals("Test Warehouse", savedPlace.getName());
        assertEquals(PlaceType.WAREHOUSE, savedPlace.getType());
        assertEquals(organizationId, savedPlace.getOrganizationId());
        assertNotNull(savedPlace.getLocation());
    }

    @Test
    void findByOrganizationIdOrderByCreatedAtDesc_ShouldReturnPlacesInOrder() {
        // Given
        Place place1 = createPlace("Place 1", PlaceType.WAREHOUSE);
        Place place2 = createPlace("Place 2", PlaceType.DEPOT);
        
        entityManager.persistAndFlush(place1);
        // Set place2's createdAt to be after place1's createdAt deterministically
        place2.setCreatedAt(place1.getCreatedAt().plusNanos(1_000_000)); // plus 1 ms
        entityManager.persistAndFlush(place2);

        // When
        List<Place> places = placeRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);

        // Then
        assertEquals(2, places.size());
        assertEquals("Place 2", places.get(0).getName()); // Most recent first
        assertEquals("Place 1", places.get(1).getName());
    }

    @Test
    void existsByOrganizationIdAndNameIgnoreCase_ShouldReturnTrue_WhenExists() {
        // Given
        entityManager.persistAndFlush(testPlace);

        // When
        boolean exists = placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "test warehouse");

        // Then
        assertTrue(exists);
    }

    @Test
    void existsByOrganizationIdAndNameIgnoreCase_ShouldReturnFalse_WhenNotExists() {
        // When
        boolean exists = placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "Nonexistent Place");

        // Then
        assertFalse(exists);
    }

    @Test
    @org.junit.jupiter.api.Disabled("H2 database doesn't support PostGIS ST_DWithin function")
    void findWithinRadius_ShouldReturnNearbyPlaces() {
        // Given
        testPlace.setLocation(LocationMapper.createPoint(40.7128, -74.0060)); // NYC
        Place nearbyPlace = createPlace("Nearby Place", PlaceType.DEPOT);
        nearbyPlace.setLocation(LocationMapper.createPoint(40.7589, -73.9851)); // Times Square
        Place farPlace = createPlace("Far Place", PlaceType.WAREHOUSE);
        farPlace.setLocation(LocationMapper.createPoint(34.0522, -118.2437)); // LA
        
        entityManager.persistAndFlush(testPlace);
        entityManager.persistAndFlush(nearbyPlace);
        entityManager.persistAndFlush(farPlace);

        Point center = LocationMapper.createPoint(40.7128, -74.0060);
        double radiusMeters = 10000; // 10km

        // When
        List<Place> nearbyPlaces = placeRepository.findWithinRadius(center, radiusMeters);

        // Then
        assertEquals(2, nearbyPlaces.size()); // Should find testPlace and nearbyPlace, but not farPlace
        assertTrue(nearbyPlaces.stream().anyMatch(p -> p.getName().equals("Test Warehouse")));
        assertTrue(nearbyPlaces.stream().anyMatch(p -> p.getName().equals("Nearby Place")));
        assertFalse(nearbyPlaces.stream().anyMatch(p -> p.getName().equals("Far Place")));
    }

    @Test
    @org.junit.jupiter.api.Disabled("H2 database doesn't support PostGIS ST_DWithin function")
    void findByOrganizationWithinRadius_ShouldReturnNearbyPlacesForOrganization() {
        // Given
        UUID otherOrgId = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
        
        testPlace.setLocation(LocationMapper.createPoint(40.7128, -74.0060));
        Place nearbyPlaceOtherOrg = createPlace("Nearby Other Org", PlaceType.DEPOT);
        nearbyPlaceOtherOrg.setLocation(LocationMapper.createPoint(40.7589, -73.9851));
        nearbyPlaceOtherOrg.setOrganizationId(otherOrgId);
        
        entityManager.persistAndFlush(testPlace);
        entityManager.persistAndFlush(nearbyPlaceOtherOrg);

        Point center = LocationMapper.createPoint(40.7128, -74.0060);
        double radiusMeters = 10000; // 10km

        // When
        List<Place> nearbyPlaces = placeRepository.findByOrganizationWithinRadius(organizationId, center, radiusMeters);

        // Then
        assertEquals(1, nearbyPlaces.size()); // Should only find testPlace for this organization
        assertEquals("Test Warehouse", nearbyPlaces.get(0).getName());
    }

    private Place createPlace(String name, PlaceType type) {
        Place place = new Place();
        place.setName(name);
        place.setType(type);
        place.setOrganizationId(organizationId);
        place.setLocation(testPoint);
        place.setAddress("Test Address");
        place.setAddressLine1("Test Address Line 1");
        place.setCity("Test City");
        place.setState("TS");
        place.setCountry("USA");
        place.setPostalCode("12345");
        place.setCreatedAt(LocalDateTime.now());
        place.setUpdatedAt(LocalDateTime.now());
        return place;
    }
}