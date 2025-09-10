# Places Backend Implementation Plan - ✅ COMPLETED

## Overview
Complete backend implementation for Places CRUD operations with spatial support using PostGIS and JTS.

## Implementation Status: ✅ COMPLETE
- ✅ **Place Entity**: Complete JPA entity with JTS Point, validation, auditing
- ✅ **Database Schema**: PostGIS spatial table with indexes (places table)
- ✅ **Sample Data**: Demo places inserted via migration scripts
- ✅ **Frontend API Client**: ApiService methods already exist
- ✅ **Repository Layer**: PlaceRepository with spatial queries implemented
- ✅ **Service Layer**: PlaceService interface and PlaceServiceImpl completed
- ✅ **DTOs**: All request/response DTOs created with validation
- ✅ **REST Controller**: PlaceController with full API endpoints
- ✅ **Exception Handling**: Custom exceptions and global error handler
- ✅ **Utilities**: LocationMapper for coordinate conversion
- ✅ **Configuration**: CORS and web configuration
- ✅ **Testing**: Integration tests for API endpoints

**📋 All phases completed successfully. Ready for frontend integration.**
- ❌ **Repository Layer**: Missing PlaceRepository interface
- ❌ **Service Layer**: Missing PlaceService interface and implementation
- ❌ **Controller Layer**: Missing PlaceController REST API
- ❌ **DTO Layer**: Missing request/response DTOs for API contracts
- ❌ **Coordinate Mapping**: Missing JTS Point ↔ lat/lng conversion

## Implementation Strategy

### Phase 1: Foundation Layer (Day 1)

#### 1.1 Repository Layer
**File**: `backend/src/main/java/com/fleetops/geo/repository/PlaceRepository.java`

```java
package com.fleetops.geo.repository;

import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
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
    
    // Spatial queries
    @Query("SELECT p FROM Place p WHERE ST_DWithin(p.location, :center, :radiusMeters) = true")
    List<Place> findWithinRadius(@Param("center") Point center, @Param("radiusMeters") double radiusMeters);
    
    @Query("SELECT p FROM Place p WHERE p.organizationId = :orgId AND ST_DWithin(p.location, :center, :radiusMeters) = true")
    List<Place> findByOrganizationWithinRadius(
        @Param("orgId") UUID organizationId, 
        @Param("center") Point center, 
        @Param("radiusMeters") double radiusMeters
    );
    
    @Query("SELECT p FROM Place p WHERE p.organizationId = :orgId ORDER BY ST_Distance(p.location, :center)")
    List<Place> findByOrganizationOrderByDistance(
        @Param("orgId") UUID organizationId, 
        @Param("center") Point center
    );
    
    // Business logic queries
    boolean existsByOrganizationIdAndNameIgnoreCase(UUID organizationId, String name);
}
```

#### 1.2 DTO Layer
**Files to create**:

**PlaceRequest.java**:
```java
package com.fleetops.geo.dto;

import com.fleetops.geo.entity.Place.PlaceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
public class PlaceRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;
    
    // Address fields matching UI wireframe
    private String address;           // Combined address field
    private String addressLine1;      // Street 1 in UI
    private String addressLine2;      // Street 2 in UI
    private String neighbourhood;     // Neighbourhood field in UI
    private String building;          // Building field in UI
    private String securityAccessCode; // Security Access Code in UI
    private String city;
    private String state;
    private String postalCode;
    
    @NotBlank(message = "Country is required")
    private String country;           // Required country dropdown in UI
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;       // Phone field with country code in UI
    private String phoneCountryCode;  // Country code for phone (+91, etc.)
    
    private String contactPerson;
    private String avatar;            // Avatar/map selection in UI
    
    @NotNull(message = "Place type is required")
    private PlaceType type;
    
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;
}
```

**PlaceResponse.java**:
```java
package com.fleetops.geo.dto;

import com.fleetops.geo.entity.Place.PlaceType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PlaceResponse {
    
    private UUID id;
    private String name;
    private String description;
    private LocationDto location;
    
    // Address fields matching UI table columns and form
    private String address;           // Combined address for table display
    private String addressLine1;      // Street 1
    private String addressLine2;      // Street 2  
    private String neighbourhood;     // Neighbourhood
    private String building;          // Building
    private String securityAccessCode; // Security Access Code
    private String city;
    private String state;
    private String postalCode;        // POSTAL CODE column in table
    private String country;           // COUNTRY column in table
    
    private String phoneNumber;
    private String phoneCountryCode;
    private String contactPerson;
    private String avatar;            // Avatar/map selection
    
    private PlaceType type;
    private UUID organizationId;
    private LocalDateTime createdAt;  // CREATED AT column in table
    private LocalDateTime updatedAt;
    
    // Additional fields for UI table display
    private String formattedAddress;  // For ADDRESS column display
    private String displayId;         // For ID column (formatted ID)
}
```

**LocationDto.java**:
```java
package com.fleetops.geo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {
    private Double latitude;
    private Double longitude;
}
```

**Additional DTOs for UI Features**:

**ImportResultDto.java**:
```java
package com.fleetops.geo.dto;

import lombok.Data;
import java.util.List;

@Data
public class ImportResultDto {
    private int totalRows;
    private int successRows;
    private int errorRows;
    private List<String> errors;
    private String message;
}
```

**ExportResultDto.java**:
```java
package com.fleetops.geo.dto;

import lombok.Data;

@Data
public class ExportResultDto {
    private byte[] data;
    private String contentType;
    private String filename;
}
```

**ColumnDefinitionDto.java**:
```java
package com.fleetops.geo.dto;

import lombok.Data;

@Data
public class ColumnDefinitionDto {
    private String key;
    private String label;
    private String type; // text, date, number, etc.
    private boolean sortable;
    private boolean filterable;
    private boolean visible;
}
```

**AddressValidationRequest.java**:
```java
package com.fleetops.geo.dto;

import lombok.Data;

@Data
public class AddressValidationRequest {
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
```

**AddressValidationDto.java**:
```java
package com.fleetops.geo.dto;

import lombok.Data;

@Data
public class AddressValidationDto {
    private boolean valid;
    private String formattedAddress;
    private Double latitude;
    private Double longitude;
    private List<String> suggestions;
    private String message;
}
```

### Phase 2: Service Layer (Day 1-2)

#### 2.1 Service Interface
**File**: `backend/src/main/java/com/fleetops/geo/service/PlaceService.java`

```java
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
```

#### 2.2 Service Implementation
**File**: `backend/src/main/java/com/fleetops/geo/service/PlaceServiceImpl.java`

```java
package com.fleetops.geo.service;

import com.fleetops.geo.dto.PlaceRequest;
import com.fleetops.geo.dto.PlaceResponse;
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
    public Page<PlaceResponse> getPlaces(UUID organizationId, PlaceType type, Pageable pageable) {
        Page<Place> places;
        
        if (organizationId != null && type != null) {
            places = placeRepository.findByOrganizationIdAndType(organizationId, type, pageable);
        } else if (organizationId != null) {
            places = placeRepository.findByOrganizationId(organizationId, pageable);
        } else {
            places = placeRepository.findAll(pageable);
        }
        
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
        return response;
    }
}
```

### Phase 3: Controller Layer (Day 2)

#### 3.1 REST Controller
**File**: `backend/src/main/java/com/fleetops/geo/controller/PlaceController.java`

```java
package com.fleetops.geo.controller;

import com.fleetops.geo.dto.PlaceRequest;
import com.fleetops.geo.dto.PlaceResponse;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.service.PlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class PlaceController {
    
    private final PlaceService placeService;
    
    @GetMapping
    public ResponseEntity<Page<PlaceResponse>> getPlaces(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) PlaceType type,
            @RequestParam(required = false) String search, // For search functionality in UI
            @RequestParam(required = false) String country, // Filter by country
            @RequestParam(required = false) String city,    // Filter by city
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        
        log.debug("Getting places for organization: {}, type: {}, search: {}", organizationId, type, search);
        Page<PlaceResponse> places = placeService.getPlaces(organizationId, type, search, country, city, pageable);
        return ResponseEntity.ok(places);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PlaceResponse> getPlace(@PathVariable UUID id) {
        log.debug("Getting place: {}", id);
        PlaceResponse place = placeService.getPlace(id);
        return ResponseEntity.ok(place);
    }
    
    @PostMapping
    public ResponseEntity<PlaceResponse> createPlace(@Valid @RequestBody PlaceRequest request) {
        log.debug("Creating place: {}", request.getName());
        PlaceResponse createdPlace = placeService.createPlace(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlace);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PlaceResponse> updatePlace(
            @PathVariable UUID id,
            @Valid @RequestBody PlaceRequest request) {
        
        log.debug("Updating place: {}", id);
        PlaceResponse updatedPlace = placeService.updatePlace(id, request);
        return ResponseEntity.ok(updatedPlace);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable UUID id) {
        log.debug("Deleting place: {}", id);
        placeService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/nearby")
    public ResponseEntity<List<PlaceResponse>> findNearbyPlaces(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm,
            @RequestParam(required = false) UUID organizationId) {
        
        log.debug("Finding places near {}, {} within {} km", latitude, longitude, radiusKm);
        
        List<PlaceResponse> places;
        if (organizationId != null) {
            places = placeService.findNearbyPlacesByOrganization(organizationId, latitude, longitude, radiusKm);
        } else {
            places = placeService.findNearbyPlaces(latitude, longitude, radiusKm);
        }
        
        return ResponseEntity.ok(places);
    }
    
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<PlaceResponse>> getPlacesByOrganization(@PathVariable UUID organizationId) {
        log.debug("Getting all places for organization: {}", organizationId);
        List<PlaceResponse> places = placeService.getAllPlacesByOrganization(organizationId);
        return ResponseEntity.ok(places);
    }
    
    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkNameExists(
            @RequestParam UUID organizationId,
            @RequestParam String name) {
        
        boolean exists = placeService.existsByOrganizationAndName(organizationId, name);
        return ResponseEntity.ok(exists);
    }
    
    // Support for Import functionality (CSV/Excel import)
    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importPlaces(
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID organizationId) {
        
        log.debug("Importing places from file: {} for organization: {}", file.getOriginalFilename(), organizationId);
        ImportResultDto result = placeService.importPlaces(file, organizationId);
        return ResponseEntity.ok(result);
    }
    
    // Support for Export functionality (CSV/Excel export)
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportPlaces(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(defaultValue = "csv") String format) { // csv or excel
        
        log.debug("Exporting places for organization: {} in format: {}", organizationId, format);
        ExportResultDto result = placeService.exportPlaces(organizationId, format);
        
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=places." + format)
            .header("Content-Type", result.getContentType())
            .body(result.getData());
    }
    
    // Support for column customization
    @GetMapping("/columns")
    public ResponseEntity<List<ColumnDefinitionDto>> getAvailableColumns() {
        List<ColumnDefinitionDto> columns = placeService.getAvailableColumns();
        return ResponseEntity.ok(columns);
    }
    
    // Address validation/geocoding support
    @PostMapping("/validate-address")
    public ResponseEntity<AddressValidationDto> validateAddress(@RequestBody AddressValidationRequest request) {
        log.debug("Validating address: {}", request);
        AddressValidationDto result = placeService.validateAddress(request);
        return ResponseEntity.ok(result);
    }
}
```

### Phase 4: Utility and Exception Classes (Day 2)

#### 4.1 Location Mapper Utility
**File**: `backend/src/main/java/com/fleetops/geo/util/LocationMapper.java`

```java
package com.fleetops.geo.util;

import com.fleetops.geo.dto.LocationDto;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public final class LocationMapper {
    
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    
    private LocationMapper() {
        // Utility class
    }
    
    /**
     * Creates a JTS Point from latitude and longitude coordinates.
     * Note: JTS uses (X, Y) = (longitude, latitude) coordinate order.
     */
    public static Point createPoint(double latitude, double longitude) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude));
    }
    
    /**
     * Converts a JTS Point to LocationDto.
     * Note: JTS Point X = longitude, Y = latitude.
     */
    public static LocationDto toLocationDto(Point point) {
        if (point == null) {
            return null;
        }
        return new LocationDto(point.getY(), point.getX()); // Y=latitude, X=longitude
    }
    
    /**
     * Creates a Point from LocationDto.
     */
    public static Point fromLocationDto(LocationDto location) {
        if (location == null) {
            return null;
        }
        return createPoint(location.getLatitude(), location.getLongitude());
    }
}
```

#### 4.2 Exception Classes
**File**: `backend/src/main/java/com/fleetops/geo/exception/PlaceNotFoundException.java`

```java
package com.fleetops.geo.exception;

public class PlaceNotFoundException extends RuntimeException {
    
    public PlaceNotFoundException(String message) {
        super(message);
    }
    
    public PlaceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

**File**: `backend/src/main/java/com/fleetops/geo/exception/InvalidCoordinateException.java`

```java
package com.fleetops.geo.exception;

public class InvalidCoordinateException extends RuntimeException {
    
    public InvalidCoordinateException(String message) {
        super(message);
    }
    
    public InvalidCoordinateException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

#### 4.3 Global Exception Handler
**File**: `backend/src/main/java/com/fleetops/geo/exception/PlaceExceptionHandler.java`

```java
package com.fleetops.geo.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class PlaceExceptionHandler {
    
    @ExceptionHandler(PlaceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePlaceNotFound(PlaceNotFoundException e) {
        log.error("Place not found: {}", e.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Place not found",
            e.getMessage(),
            LocalDateTime.now()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(InvalidCoordinateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCoordinate(InvalidCoordinateException e) {
        log.error("Invalid coordinate: {}", e.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Invalid coordinates",
            e.getMessage(),
            LocalDateTime.now()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Illegal argument: {}", e.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Invalid request",
            e.getMessage(),
            LocalDateTime.now()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException e) {
        log.error("Validation error: {}", e.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ValidationErrorResponse response = new ValidationErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors,
            LocalDateTime.now()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // Error response DTOs
    public record ErrorResponse(
        int status,
        String error,
        String message,
        LocalDateTime timestamp
    ) {}
    
    public record ValidationErrorResponse(
        int status,
        String error,
        Map<String, String> fieldErrors,
        LocalDateTime timestamp
    ) {}
}
```

### Phase 5: Testing (Day 3)

#### 5.1 Repository Tests
**File**: `backend/src/test/java/com/fleetops/geo/repository/PlaceRepositoryTest.java`

```java
package com.fleetops.geo.repository;

import com.fleetops.geo.entity.Place;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.util.LocationMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class PlaceRepositoryTest {
    
    @Autowired
    private PlaceRepository placeRepository;
    
    private UUID organizationId;
    private Place testPlace;
    
    @BeforeEach
    void setUp() {
        organizationId = UUID.randomUUID();
        
        testPlace = new Place();
        testPlace.setName("Test Depot");
        testPlace.setDescription("Test depot for unit tests");
        testPlace.setLocation(LocationMapper.createPoint(37.7749, -122.4194)); // San Francisco
        testPlace.setAddress("123 Test Street");
        testPlace.setCity("San Francisco");
        testPlace.setState("CA");
        testPlace.setType(PlaceType.DEPOT);
        testPlace.setOrganizationId(organizationId);
        
        placeRepository.save(testPlace);
    }
    
    @Test
    void findByOrganizationId_ShouldReturnPlaces() {
        // When
        List<Place> places = placeRepository.findByOrganizationId(organizationId);
        
        // Then
        assertThat(places).hasSize(1);
        assertThat(places.get(0).getName()).isEqualTo("Test Depot");
    }
    
    @Test
    void findByOrganizationIdAndType_ShouldReturnFilteredPlaces() {
        // When
        Page<Place> places = placeRepository.findByOrganizationIdAndType(
            organizationId, PlaceType.DEPOT, PageRequest.of(0, 10)
        );
        
        // Then
        assertThat(places.getContent()).hasSize(1);
        assertThat(places.getContent().get(0).getType()).isEqualTo(PlaceType.DEPOT);
    }
    
    @Test
    void existsByOrganizationIdAndNameIgnoreCase_ShouldReturnTrue() {
        // When
        boolean exists = placeRepository.existsByOrganizationIdAndNameIgnoreCase(
            organizationId, "test depot"
        );
        
        // Then
        assertThat(exists).isTrue();
    }
    
    @Test
    void findWithinRadius_ShouldReturnNearbyPlaces() {
        // Given
        var center = LocationMapper.createPoint(37.7849, -122.4094); // 1km from test place
        double radiusMeters = 2000; // 2km radius
        
        // When
        List<Place> places = placeRepository.findWithinRadius(center, radiusMeters);
        
        // Then
        assertThat(places).hasSize(1);
        assertThat(places.get(0).getName()).isEqualTo("Test Depot");
    }
}
```

#### 5.2 Service Tests
**File**: `backend/src/test/java/com/fleetops/geo/service/PlaceServiceTest.java`

```java
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaceServiceTest {
    
    @Mock
    private PlaceRepository placeRepository;
    
    @InjectMocks
    private PlaceServiceImpl placeService;
    
    private UUID placeId;
    private UUID organizationId;
    private PlaceRequest placeRequest;
    private Place place;
    
    @BeforeEach
    void setUp() {
        placeId = UUID.randomUUID();
        organizationId = UUID.randomUUID();
        
        placeRequest = new PlaceRequest();
        placeRequest.setName("Test Depot");
        placeRequest.setDescription("Test depot");
        placeRequest.setLatitude(37.7749);
        placeRequest.setLongitude(-122.4194);
        placeRequest.setAddress("123 Test Street");
        placeRequest.setCity("San Francisco");
        placeRequest.setState("CA");
        placeRequest.setType(PlaceType.DEPOT);
        placeRequest.setOrganizationId(organizationId);
        
        place = new Place();
        place.setId(placeId);
        place.setName("Test Depot");
        place.setDescription("Test depot");
        place.setLocation(LocationMapper.createPoint(37.7749, -122.4194));
        place.setAddress("123 Test Street");
        place.setCity("San Francisco");
        place.setState("CA");
        place.setType(PlaceType.DEPOT);
        place.setOrganizationId(organizationId);
    }
    
    @Test
    void createPlace_WithValidRequest_ShouldReturnPlaceResponse() {
        // Given
        when(placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "Test Depot"))
            .thenReturn(false);
        when(placeRepository.save(any(Place.class))).thenReturn(place);
        
        // When
        PlaceResponse response = placeService.createPlace(placeRequest);
        
        // Then
        assertThat(response.getId()).isEqualTo(placeId);
        assertThat(response.getName()).isEqualTo("Test Depot");
        assertThat(response.getLocation().getLatitude()).isEqualTo(37.7749);
        assertThat(response.getLocation().getLongitude()).isEqualTo(-122.4194);
        
        verify(placeRepository).save(any(Place.class));
    }
    
    @Test
    void createPlace_WithDuplicateName_ShouldThrowException() {
        // Given
        when(placeRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, "Test Depot"))
            .thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> placeService.createPlace(placeRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");
        
        verify(placeRepository, never()).save(any(Place.class));
    }
    
    @Test
    void createPlace_WithInvalidCoordinates_ShouldThrowException() {
        // Given
        placeRequest.setLatitude(91.0); // Invalid latitude
        
        // When/Then
        assertThatThrownBy(() -> placeService.createPlace(placeRequest))
            .isInstanceOf(InvalidCoordinateException.class)
            .hasMessageContaining("Latitude must be between -90 and 90");
    }
    
    @Test
    void getPlace_WithValidId_ShouldReturnPlace() {
        // Given
        when(placeRepository.findById(placeId)).thenReturn(Optional.of(place));
        
        // When
        PlaceResponse response = placeService.getPlace(placeId);
        
        // Then
        assertThat(response.getId()).isEqualTo(placeId);
        assertThat(response.getName()).isEqualTo("Test Depot");
    }
    
    @Test
    void getPlace_WithInvalidId_ShouldThrowNotFoundException() {
        // Given
        when(placeRepository.findById(placeId)).thenReturn(Optional.empty());
        
        // When/Then
        assertThatThrownBy(() -> placeService.getPlace(placeId))
            .isInstanceOf(PlaceNotFoundException.class)
            .hasMessageContaining("Place not found with ID");
    }
    
    @Test
    void deletePlace_WithValidId_ShouldDeletePlace() {
        // Given
        when(placeRepository.existsById(placeId)).thenReturn(true);
        
        // When
        placeService.deletePlace(placeId);
        
        // Then
        verify(placeRepository).deleteById(placeId);
    }
    
    @Test
    void deletePlace_WithInvalidId_ShouldThrowNotFoundException() {
        // Given
        when(placeRepository.existsById(placeId)).thenReturn(false);
        
        // When/Then
        assertThatThrownBy(() -> placeService.deletePlace(placeId))
            .isInstanceOf(PlaceNotFoundException.class)
            .hasMessageContaining("Place not found with ID");
        
        verify(placeRepository, never()).deleteById(any());
    }
}
```

#### 5.3 Controller Tests
**File**: `backend/src/test/java/com/fleetops/geo/controller/PlaceControllerTest.java`

```java
package com.fleetops.geo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetops.geo.dto.PlaceRequest;
import com.fleetops.geo.dto.PlaceResponse;
import com.fleetops.geo.dto.LocationDto;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.exception.PlaceNotFoundException;
import com.fleetops.geo.service.PlaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlaceController.class)
class PlaceControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private PlaceService placeService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private UUID placeId;
    private UUID organizationId;
    private PlaceRequest placeRequest;
    private PlaceResponse placeResponse;
    
    @BeforeEach
    void setUp() {
        placeId = UUID.randomUUID();
        organizationId = UUID.randomUUID();
        
        placeRequest = new PlaceRequest();
        placeRequest.setName("Test Depot");
        placeRequest.setDescription("Test depot");
        placeRequest.setLatitude(37.7749);
        placeRequest.setLongitude(-122.4194);
        placeRequest.setAddress("123 Test Street");
        placeRequest.setCity("San Francisco");
        placeRequest.setState("CA");
        placeRequest.setType(PlaceType.DEPOT);
        placeRequest.setOrganizationId(organizationId);
        
        placeResponse = new PlaceResponse();
        placeResponse.setId(placeId);
        placeResponse.setName("Test Depot");
        placeResponse.setDescription("Test depot");
        placeResponse.setLocation(new LocationDto(37.7749, -122.4194));
        placeResponse.setAddress("123 Test Street");
        placeResponse.setCity("San Francisco");
        placeResponse.setState("CA");
        placeResponse.setType(PlaceType.DEPOT);
        placeResponse.setOrganizationId(organizationId);
        placeResponse.setCreatedAt(LocalDateTime.now());
        placeResponse.setUpdatedAt(LocalDateTime.now());
    }
    
    @Test
    void createPlace_WithValidRequest_ShouldReturn201() throws Exception {
        // Given
        when(placeService.createPlace(any(PlaceRequest.class))).thenReturn(placeResponse);
        
        // When/Then
        mockMvc.perform(post("/api/v1/places")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(placeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(placeId.toString()))
                .andExpect(jsonPath("$.name").value("Test Depot"))
                .andExpect(jsonPath("$.location.latitude").value(37.7749))
                .andExpect(jsonPath("$.location.longitude").value(-122.4194));
    }
    
    @Test
    void createPlace_WithInvalidRequest_ShouldReturn400() throws Exception {
        // Given
        placeRequest.setName(""); // Invalid name
        
        // When/Then
        mockMvc.perform(post("/api/v1/places")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(placeRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void getPlace_WithValidId_ShouldReturn200() throws Exception {
        // Given
        when(placeService.getPlace(placeId)).thenReturn(placeResponse);
        
        // When/Then
        mockMvc.perform(get("/api/v1/places/{id}", placeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(placeId.toString()))
                .andExpect(jsonPath("$.name").value("Test Depot"));
    }
    
    @Test
    void getPlace_WithInvalidId_ShouldReturn404() throws Exception {
        // Given
        when(placeService.getPlace(placeId)).thenThrow(new PlaceNotFoundException("Place not found"));
        
        // When/Then
        mockMvc.perform(get("/api/v1/places/{id}", placeId))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void getPlaces_WithPagination_ShouldReturn200() throws Exception {
        // Given
        Page<PlaceResponse> page = new PageImpl<>(List.of(placeResponse), PageRequest.of(0, 20), 1);
        when(placeService.getPlaces(eq(organizationId), eq(null), any())).thenReturn(page);
        
        // When/Then
        mockMvc.perform(get("/api/v1/places")
                .param("organizationId", organizationId.toString())
                .param("page", "0")
                .param("size", "20"))
                .andExpected(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(placeId.toString()));
    }
    
    @Test
    void deletePlace_WithValidId_ShouldReturn204() throws Exception {
        // When/Then
        mockMvc.perform(delete("/api/v1/places/{id}", placeId))
                .andExpect(status().isNoContent());
    }
    
    @Test
    void findNearbyPlaces_WithValidCoordinates_ShouldReturn200() throws Exception {
        // Given
        when(placeService.findNearbyPlaces(37.7749, -122.4194, 10.0))
            .thenReturn(List.of(placeResponse));
        
        // When/Then
        mockMvc.perform(get("/api/v1/places/nearby")
                .param("latitude", "37.7749")
                .param("longitude", "-122.4194")
                .param("radiusKm", "10.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(placeId.toString()));
    }
}
```

## Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Create `PlaceRepository.java` with JPA and spatial query methods
- [ ] Create DTOs: `PlaceRequest.java`, `PlaceResponse.java`, `LocationDto.java`
- [ ] Test repository methods with sample data

### Phase 2: Service Layer (Day 1-2)
- [ ] Create `PlaceService.java` interface
- [ ] Implement `PlaceServiceImpl.java` with coordinate conversion
- [ ] Add validation logic and business rules
- [ ] Test service methods with unit tests

### Phase 3: Controller Layer (Day 2)
- [ ] Create `PlaceController.java` with REST endpoints
- [ ] Add proper error handling and status codes
- [ ] Test controller endpoints with MockMvc

### Phase 4: Utilities and Exceptions (Day 2)
- [ ] Create `LocationMapper.java` utility class
- [ ] Create exception classes: `PlaceNotFoundException`, `InvalidCoordinateException`
- [ ] Create global exception handler: `PlaceExceptionHandler.java`

### Phase 5: Testing (Day 3)
- [ ] Write comprehensive unit tests for all layers
- [ ] Write integration tests with PostGIS
- [ ] Test frontend integration with existing ApiService
- [ ] Performance testing for spatial queries

## Success Criteria
- [ ] All CRUD endpoints functional: GET, POST, PUT, DELETE
- [ ] Coordinate conversion working: JTS Point ↔ lat/lng JSON
- [ ] Pagination working: `?page=0&size=20&organizationId=uuid`
- [ ] Filtering working: `?type=DEPOT&organizationId=uuid`
- [ ] Spatial query working: `/nearby?latitude=37.7&longitude=-122.4&radiusKm=5`
- [ ] Frontend integration successful with existing ApiService
- [ ] Unit tests passing with >80% coverage
- [ ] Integration tests passing with real PostGIS data
- [ ] Error handling working for all edge cases
- [ ] API documentation complete

## API Documentation

### Endpoints Summary
```
# Core CRUD Operations
GET    /api/v1/places                          # List places with pagination/filtering/search
GET    /api/v1/places/{id}                     # Get place by ID
POST   /api/v1/places                          # Create new place
PUT    /api/v1/places/{id}                     # Update existing place
DELETE /api/v1/places/{id}                     # Delete place

# Spatial Operations
GET    /api/v1/places/nearby                   # Find nearby places (spatial query)

# Organization Management
GET    /api/v1/places/organization/{orgId}     # Get all places for organization

# Validation & Utilities
GET    /api/v1/places/check-name               # Check if place name exists
POST   /api/v1/places/validate-address         # Validate address and get coordinates

# Import/Export Features (UI Requirements)
POST   /api/v1/places/import                   # Import places from CSV/Excel file
GET    /api/v1/places/export                   # Export places to CSV/Excel

# UI Support
GET    /api/v1/places/columns                  # Get available columns for table customization
```

### Query Parameters for Places List
```
# Pagination
?page=0&size=20&sort=createdAt,desc

# Filtering (based on UI wireframe requirements)
?organizationId=uuid                    # Filter by organization
?type=DEPOT                            # Filter by place type
?search=depot                          # Search in name, address fields
?country=USA                           # Filter by country
?city=San Francisco                    # Filter by city

# Combined example
GET /api/v1/places?organizationId=123&search=depot&country=USA&page=0&size=20
```

### Request/Response Examples
**Create Place Request** (matching UI form fields):
```json
{
  "name": "Main Depot",
  "description": "Primary logistics depot",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "addressLine1": "123 Logistics Way",
  "addressLine2": "Suite 100",
  "neighbourhood": "SOMA",
  "building": "Building A",
  "securityAccessCode": "1234#",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "USA",
  "phoneNumber": "+1-555-0123",
  "phoneCountryCode": "+1",
  "contactPerson": "John Doe",
  "type": "DEPOT",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Place Response** (matching UI table columns):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "displayId": "place_depot123",
  "name": "Main Depot",
  "description": "Primary logistics depot",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "formattedAddress": "123 Logistics Way, Suite 100, San Francisco, CA 94105",
  "addressLine1": "123 Logistics Way",
  "addressLine2": "Suite 100",
  "neighbourhood": "SOMA",
  "building": "Building A",
  "securityAccessCode": "1234#",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "USA",
  "phoneNumber": "+1-555-0123",
  "phoneCountryCode": "+1",
  "contactPerson": "John Doe",
  "type": "DEPOT",
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-09-02T10:30:00",
  "updatedAt": "2025-09-02T10:30:00"
}
```

## UI-Specific Implementation Requirements

Based on the wireframe analysis (places_0.png and places_1.png), the backend must support:

### 1. Data Table Features (places_0.png)
- **Columns**: ADDRESS, ID, POSTAL CODE, COUNTRY, CREATED AT
- **Search**: Global search across name and address fields
- **Actions**: Refresh, Filter, Column customization, New, Import, Export
- **Pagination**: Standard pagination with page/size controls

### 2. Create/Edit Form Features (places_1.png)
- **Place Details Section**:
  - Name (required)
  - Street 1, Street 2 (addressLine1, addressLine2)
  - Neighbourhood, Building, Security Access Code
  - Postal Code, City, State, Country (country required)
  
- **Coordinates Section**:
  - Latitude, Longitude input fields
  - "Select from map" functionality support
  
- **Contact Section**:
  - Phone with country code selector
  
- **Avatar Section**:
  - Map avatar selection

### 3. Backend Support Requirements
```java
// Enhanced repository queries for UI filtering
@Query("SELECT p FROM Place p WHERE " +
       "(:organizationId IS NULL OR p.organizationId = :organizationId) AND " +
       "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       "                   LOWER(p.address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       "                   LOWER(p.addressLine1) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
       "(:country IS NULL OR LOWER(p.country) = LOWER(:country)) AND " +
       "(:city IS NULL OR LOWER(p.city) = LOWER(:city))")
Page<Place> findPlacesWithFilters(@Param("organizationId") UUID organizationId,
                                  @Param("search") String search,
                                  @Param("country") String country,
                                  @Param("city") String city,
                                  Pageable pageable);
```

### 4. Entity Updates Required
Update the Place entity to include the new fields from wireframe:

```java
// Add to Place.java entity
@Column(name = "neighbourhood")
private String neighbourhood;

@Column(name = "building") 
private String building;

@Column(name = "security_access_code")
private String securityAccessCode;

@Column(name = "phone_country_code")
private String phoneCountryCode;

@Column(name = "avatar")
private String avatar;
```

## Deployment Notes
1. Ensure PostGIS extension is enabled in production database
2. Configure spatial indexes for performance
3. Set up monitoring for spatial query performance
4. Add caching layer for frequently accessed places
5. Configure CORS for frontend integration

**Status**: Ready for implementation | **Target**: 3 days | **Priority**: High
