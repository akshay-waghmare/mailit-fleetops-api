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
    
    private Boolean active = true;  // Default to active
}
