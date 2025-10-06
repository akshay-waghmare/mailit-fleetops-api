package com.fleetops.geo.service;

import com.fleetops.geo.dto.PlaceRequest;
import com.fleetops.geo.dto.PlaceResponse;
import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.exception.PlaceNotFoundException;
import com.fleetops.geo.exception.InvalidCoordinateException;
import com.fleetops.geo.repository.PlaceRepository;
import com.fleetops.geo.util.LocationMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Point;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaceServiceTest {

    @Mock
    private PlaceRepository placeRepository;

    @InjectMocks
    private PlaceServiceImpl placeService;

    private UUID organizationId;
    private UUID placeId;
    private Place testPlace;
    private PlaceRequest testRequest;

    @BeforeEach
    void setUp() {
        organizationId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        placeId = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
        
        // Create test place entity
        testPlace = new Place();
        testPlace.setId(placeId);
        testPlace.setName("Test Warehouse");
        testPlace.setType(PlaceType.WAREHOUSE);
        testPlace.setAddress("123 Test St");
        testPlace.setAddressLine1("123 Test St");
        testPlace.setCity("Test City");
        testPlace.setState("TS");
        testPlace.setCountry("USA");
        testPlace.setPostalCode("12345");
        testPlace.setOrganizationId(organizationId);
        testPlace.setCreatedAt(LocalDateTime.now());
        testPlace.setUpdatedAt(LocalDateTime.now());
        
        // Create test request
        testRequest = new PlaceRequest();
        testRequest.setName("Test Warehouse");
        testRequest.setType(PlaceType.WAREHOUSE);
        testRequest.setLatitude(40.7128);
        testRequest.setLongitude(-74.0060);
        testRequest.setAddress("123 Test St");
        testRequest.setAddressLine1("123 Test St");
        testRequest.setCity("Test City");
        testRequest.setState("TS");
        testRequest.setCountry("USA");
        testRequest.setPostalCode("12345");
        testRequest.setOrganizationId(organizationId);
    }

    @Test
    void createPlace_ShouldReturnPlaceResponse_WhenValidRequest() {
        // Given
        try (MockedStatic<LocationMapper> mockedLocationMapper = mockStatic(LocationMapper.class)) {
            Point mockPoint = mock(Point.class);
            mockedLocationMapper.when(() -> LocationMapper.createPoint(40.7128, -74.0060))
                    .thenReturn(mockPoint);
            
            when(placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "Test Warehouse"))
                    .thenReturn(false);
            when(placeRepository.save(any(Place.class))).thenReturn(testPlace);

            // When
            PlaceResponse result = placeService.createPlace(testRequest);

            // Then
            assertNotNull(result);
            assertEquals("Test Warehouse", result.getName());
            assertEquals(PlaceType.WAREHOUSE, result.getType());
            verify(placeRepository).save(any(Place.class));
            mockedLocationMapper.verify(() -> LocationMapper.createPoint(40.7128, -74.0060));
        }
    }

    @Test
    void createPlace_ShouldThrowException_WhenDuplicateName() {
        // Given
        when(placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "Test Warehouse"))
                .thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            placeService.createPlace(testRequest);
        });
        
        assertTrue(exception.getMessage().contains("already exists"));
        verify(placeRepository, never()).save(any(Place.class));
    }

    @Test
    void getPlace_ShouldReturnPlaceResponse_WhenPlaceExists() {
        // Given
        when(placeRepository.findById(placeId)).thenReturn(Optional.of(testPlace));

        // When
        PlaceResponse result = placeService.getPlace(placeId);

        // Then
        assertNotNull(result);
        assertEquals(placeId, result.getId());
        assertEquals("Test Warehouse", result.getName());
        verify(placeRepository).findById(placeId);
    }

    @Test
    void getPlace_ShouldThrowException_WhenPlaceNotFound() {
        // Given
        when(placeRepository.findById(placeId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(PlaceNotFoundException.class, () -> {
            placeService.getPlace(placeId);
        });
    }

    @Test
    void updatePlace_ShouldReturnUpdatedPlaceResponse_WhenValidRequest() {
        // Given
        try (MockedStatic<LocationMapper> mockedLocationMapper = mockStatic(LocationMapper.class)) {
            Point mockPoint = mock(Point.class);
            mockedLocationMapper.when(() -> LocationMapper.createPoint(41.0, -75.0))
                    .thenReturn(mockPoint);
            
            testRequest.setLatitude(41.0);
            testRequest.setLongitude(-75.0);
            testRequest.setName("Updated Warehouse");
            
            when(placeRepository.findById(placeId)).thenReturn(Optional.of(testPlace));
            when(placeRepository.save(any(Place.class))).thenReturn(testPlace);

            // When
            PlaceResponse result = placeService.updatePlace(placeId, testRequest);

            // Then
            assertNotNull(result);
            verify(placeRepository).findById(placeId);
            verify(placeRepository).save(any(Place.class));
            mockedLocationMapper.verify(() -> LocationMapper.createPoint(41.0, -75.0));
        }
    }

    @Test
    void updatePlace_ShouldThrowException_WhenPlaceNotFound() {
        // Given
        when(placeRepository.findById(placeId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(PlaceNotFoundException.class, () -> {
            placeService.updatePlace(placeId, testRequest);
        });
    }

    @Test
    void deletePlace_ShouldDeletePlace_WhenPlaceExists() {
        // Given
        when(placeRepository.existsById(placeId)).thenReturn(true);

        // When
        placeService.deletePlace(placeId);

        // Then
        verify(placeRepository).existsById(placeId);
        verify(placeRepository).deleteById(placeId);
    }

    @Test
    void deletePlace_ShouldThrowException_WhenPlaceNotFound() {
        // Given
        when(placeRepository.existsById(placeId)).thenReturn(false);

        // When & Then
        assertThrows(PlaceNotFoundException.class, () -> {
            placeService.deletePlace(placeId);
        });
    }

    @Test
    void getPlaces_ShouldReturnPagedResults() {
        // Given
        List<Place> places = Arrays.asList(testPlace);
        Page<Place> placePage = new PageImpl<>(places);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(placeRepository.findAll(pageable)).thenReturn(placePage);

        // When
        Page<PlaceResponse> result = placeService.getPlaces(organizationId, null, null, null, null, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Warehouse", result.getContent().get(0).getName());
        verify(placeRepository).findAll(pageable);
    }

    @Test
    void findNearbyPlaces_ShouldReturnNearbyPlaces() {
        // Given
        double latitude = 40.7128;
        double longitude = -74.0060;
        double radiusKm = 10.0;
        
        try (MockedStatic<LocationMapper> mockedLocationMapper = mockStatic(LocationMapper.class)) {
            Point mockPoint = mock(Point.class);
            mockedLocationMapper.when(() -> LocationMapper.createPoint(latitude, longitude))
                    .thenReturn(mockPoint);
            
            List<Place> nearbyPlaces = Arrays.asList(testPlace);
            when(placeRepository.findWithinRadius(mockPoint, 10000.0)).thenReturn(nearbyPlaces);

            // When
            List<PlaceResponse> result = placeService.findNearbyPlaces(latitude, longitude, radiusKm);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Test Warehouse", result.get(0).getName());
            verify(placeRepository).findWithinRadius(mockPoint, 10000.0);
            mockedLocationMapper.verify(() -> LocationMapper.createPoint(latitude, longitude));
        }
    }

    @Test
    void getAllPlacesByOrganization_ShouldReturnPlacesForOrganization() {
        // Given
        List<Place> places = Arrays.asList(testPlace);
        when(placeRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId))
                .thenReturn(places);

        // When
        List<PlaceResponse> result = placeService.getAllPlacesByOrganization(organizationId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Warehouse", result.get(0).getName());
        verify(placeRepository).findByOrganizationIdOrderByCreatedAtDesc(organizationId);
    }

    @Test
    void existsByOrganizationAndName_ShouldReturnTrue_WhenPlaceExists() {
        // Given
        when(placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "Test Warehouse"))
                .thenReturn(true);

        // When
        boolean result = placeService.existsByOrganizationAndName(organizationId, "Test Warehouse");

        // Then
        assertTrue(result);
        verify(placeRepository).existsByOrganizationIdAndNameIgnoreCase(organizationId, "Test Warehouse");
    }

    @Test
    void createPlace_ShouldThrowException_WhenInvalidLatitude() {
        // Given
        testRequest.setLatitude(91.0); // Invalid latitude

        // When & Then
        assertThrows(InvalidCoordinateException.class, () -> {
            placeService.createPlace(testRequest);
        });
    }

    @Test
    void createPlace_ShouldThrowException_WhenInvalidLongitude() {
        // Given
        testRequest.setLongitude(181.0); // Invalid longitude

        // When & Then
        assertThrows(InvalidCoordinateException.class, () -> {
            placeService.createPlace(testRequest);
        });
    }
}