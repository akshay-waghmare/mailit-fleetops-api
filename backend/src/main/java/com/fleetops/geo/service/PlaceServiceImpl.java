package com.fleetops.geo.service;

import com.fleetops.geo.dto.*;
import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.exception.PlaceNotFoundException;
import com.fleetops.geo.exception.InvalidCoordinateException;
import com.fleetops.geo.repository.PlaceRepository;
import com.fleetops.geo.util.LocationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PlaceServiceImpl implements PlaceService {
    
    private final PlaceRepository placeRepository;
    
    @Override
    public PlaceResponse createPlace(PlaceRequest request) {
        log.debug("Creating place: {}", request.getName());
        
        // Validate coordinates
        validateCoordinates(request.getLatitude(), request.getLongitude());
        
        // Check for duplicate name within organization
        if (placeRepository.existsByOrganizationIdAndNameIgnoreCase(request.getOrganizationId(), request.getName())) {
            throw new IllegalArgumentException("Place with name '" + request.getName() + "' already exists in this organization");
        }
        
        // Create entity
        Place place = new Place();
        mapRequestToEntity(request, place);
        
        // Save
        Place savedPlace = placeRepository.save(place);
        log.info("Created place with ID: {}", savedPlace.getId());
        
        return mapEntityToResponse(savedPlace);
    }
    
    @Override
    public PlaceResponse updatePlace(UUID id, PlaceRequest request) {
        log.debug("Updating place: {}", id);
        
        Place place = placeRepository.findById(id)
            .orElseThrow(() -> new PlaceNotFoundException("Place not found with ID: " + id));
        
        // Validate coordinates
        validateCoordinates(request.getLatitude(), request.getLongitude());
        
        // Update entity
        mapRequestToEntity(request, place);
        
        // Save
        Place savedPlace = placeRepository.save(place);
        log.info("Updated place with ID: {}", savedPlace.getId());
        
        return mapEntityToResponse(savedPlace);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PlaceResponse getPlace(UUID id) {
        Place place = placeRepository.findById(id)
            .orElseThrow(() -> new PlaceNotFoundException("Place not found with ID: " + id));
        
        return mapEntityToResponse(place);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PlaceResponse> getPlaces(UUID organizationId, PlaceType type, String search, String country, String city, Pageable pageable) {
        // Temporary fix: just return all places without filtering to isolate the bytea issue
        Page<Place> places = placeRepository.findAll(pageable);
        return places.map(this::mapEntityToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> getAllPlacesByOrganization(UUID organizationId) {
        List<Place> places = placeRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
        return places.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public void deletePlace(UUID id) {
        if (!placeRepository.existsById(id)) {
            throw new PlaceNotFoundException("Place not found with ID: " + id);
        }
        
        placeRepository.deleteById(id);
        log.info("Deleted place with ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> findNearbyPlaces(double latitude, double longitude, double radiusKm) {
        validateCoordinates(latitude, longitude);
        
        Point center = LocationMapper.createPoint(latitude, longitude);
        double radiusMeters = radiusKm * 1000; // Convert km to meters
        
        List<Place> places = placeRepository.findWithinRadius(center, radiusMeters);
        return places.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PlaceResponse> findNearbyPlacesByOrganization(UUID organizationId, double latitude, double longitude, double radiusKm) {
        validateCoordinates(latitude, longitude);
        
        Point center = LocationMapper.createPoint(latitude, longitude);
        double radiusMeters = radiusKm * 1000; // Convert km to meters
        
        List<Place> places = placeRepository.findByOrganizationWithinRadius(organizationId, center, radiusMeters);
        return places.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByOrganizationAndName(UUID organizationId, String name) {
        return placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, name);
    }
    
    @Override
    public ImportResultDto importPlaces(MultipartFile file, UUID organizationId) {
        // TODO: Implement CSV/Excel import logic
        ImportResultDto result = new ImportResultDto();
        result.setMessage("Import functionality will be implemented in future iteration");
        result.setTotalRows(0);
        result.setSuccessRows(0);
        result.setErrorRows(0);
        return result;
    }
    
    @Override
    public ExportResultDto exportPlaces(UUID organizationId, String format) {
        // TODO: Implement CSV/Excel export logic
        ExportResultDto result = new ExportResultDto();
        result.setContentType("text/csv");
        result.setFilename("places.csv");
        result.setData("Export functionality will be implemented in future iteration".getBytes());
        return result;
    }
    
    @Override
    public List<ColumnDefinitionDto> getAvailableColumns() {
        return Arrays.asList(
            createColumnDef("id", "ID", "text", true, false, true),
            createColumnDef("name", "Name", "text", true, true, true),
            createColumnDef("formattedAddress", "Address", "text", true, true, true),
            createColumnDef("city", "City", "text", true, true, true),
            createColumnDef("state", "State", "text", true, true, true),
            createColumnDef("postalCode", "Postal Code", "text", true, true, true),
            createColumnDef("country", "Country", "text", true, true, true),
            createColumnDef("type", "Type", "text", true, true, true),
            createColumnDef("createdAt", "Created At", "date", true, false, true)
        );
    }
    
    @Override
    public AddressValidationDto validateAddress(AddressValidationRequest request) {
        // TODO: Implement geocoding service integration
        AddressValidationDto result = new AddressValidationDto();
        result.setValid(true);
        result.setMessage("Address validation will be implemented in future iteration");
        return result;
    }
    
    // Private helper methods
    private void validateCoordinates(double latitude, double longitude) {
        if (latitude < -90 || latitude > 90) {
            throw new InvalidCoordinateException("Latitude must be between -90 and 90, got: " + latitude);
        }
        if (longitude < -180 || longitude > 180) {
            throw new InvalidCoordinateException("Longitude must be between -180 and 180, got: " + longitude);
        }
    }
    
    private void mapRequestToEntity(PlaceRequest request, Place place) {
        place.setName(request.getName());
        place.setDescription(request.getDescription());
        place.setLocation(LocationMapper.createPoint(request.getLatitude(), request.getLongitude()));
        place.setAddress(request.getAddress());
        place.setAddressLine1(request.getAddressLine1());
        place.setAddressLine2(request.getAddressLine2());
        place.setCity(request.getCity());
        place.setState(request.getState());
        place.setPostalCode(request.getPostalCode());
        place.setCountry(request.getCountry());
        place.setPhoneNumber(request.getPhoneNumber());
        place.setContactPerson(request.getContactPerson());
        place.setType(request.getType());
        place.setOrganizationId(request.getOrganizationId());
    }
    
    private PlaceResponse mapEntityToResponse(Place place) {
        PlaceResponse response = new PlaceResponse();
        response.setId(place.getId());
        response.setDisplayId("place_" + place.getType().toString().toLowerCase() + place.getId().toString().substring(0, 6));
        response.setName(place.getName());
        response.setDescription(place.getDescription());
        response.setLocation(LocationMapper.toLocationDto(place.getLocation()));
        response.setAddress(place.getAddress());
        response.setAddressLine1(place.getAddressLine1());
        response.setAddressLine2(place.getAddressLine2());
        response.setCity(place.getCity());
        response.setState(place.getState());
        response.setPostalCode(place.getPostalCode());
        response.setCountry(place.getCountry());
        response.setPhoneNumber(place.getPhoneNumber());
        response.setContactPerson(place.getContactPerson());
        response.setType(place.getType());
        response.setOrganizationId(place.getOrganizationId());
        response.setCreatedAt(place.getCreatedAt());
        response.setUpdatedAt(place.getUpdatedAt());
        
        // Build formatted address for table display
        StringBuilder formattedAddress = new StringBuilder();
        if (place.getAddressLine1() != null) formattedAddress.append(place.getAddressLine1());
        if (place.getAddressLine2() != null) formattedAddress.append(", ").append(place.getAddressLine2());
        if (place.getCity() != null) formattedAddress.append(", ").append(place.getCity());
        if (place.getState() != null) formattedAddress.append(", ").append(place.getState());
        if (place.getPostalCode() != null) formattedAddress.append(" ").append(place.getPostalCode());
        response.setFormattedAddress(formattedAddress.toString());
        
        return response;
    }
    
    private ColumnDefinitionDto createColumnDef(String key, String label, String type, boolean sortable, boolean filterable, boolean visible) {
        ColumnDefinitionDto col = new ColumnDefinitionDto();
        col.setKey(key);
        col.setLabel(label);
        col.setType(type);
        col.setSortable(sortable);
        col.setFilterable(filterable);
        col.setVisible(visible);
        return col;
    }
}
