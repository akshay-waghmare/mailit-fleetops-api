package com.fleetops.geo.controller;

import com.fleetops.geo.dto.*;
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
import org.springframework.web.multipart.MultipartFile;

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
