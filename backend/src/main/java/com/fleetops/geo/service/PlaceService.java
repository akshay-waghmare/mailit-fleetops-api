package com.fleetops.geo.service;

import com.fleetops.geo.dto.*;
import com.fleetops.geo.entity.Place.PlaceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface PlaceService {
    
    PlaceResponse createPlace(PlaceRequest request);
    PlaceResponse updatePlace(UUID id, PlaceRequest request);
    PlaceResponse getPlace(UUID id);
    Page<PlaceResponse> getPlaces(UUID organizationId, PlaceType type, String search, String country, String city, Pageable pageable);
    List<PlaceResponse> getAllPlacesByOrganization(UUID organizationId);
    void deletePlace(UUID id);
    
    // Spatial operations
    List<PlaceResponse> findNearbyPlaces(double latitude, double longitude, double radiusKm);
    List<PlaceResponse> findNearbyPlacesByOrganization(UUID organizationId, double latitude, double longitude, double radiusKm);
    
    // Validation
    boolean existsByOrganizationAndName(UUID organizationId, String name);
    
    // Import/Export functionality (for UI buttons)
    ImportResultDto importPlaces(MultipartFile file, UUID organizationId);
    ExportResultDto exportPlaces(UUID organizationId, String format);
    
    // Column management (for UI column customization)
    List<ColumnDefinitionDto> getAvailableColumns();
    
    // Address validation/geocoding
    AddressValidationDto validateAddress(AddressValidationRequest request);
}
