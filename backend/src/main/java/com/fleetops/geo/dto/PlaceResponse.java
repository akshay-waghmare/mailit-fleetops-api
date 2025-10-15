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
    private Boolean active;           // Active status field
    private LocalDateTime createdAt;  // CREATED AT column in table
    private LocalDateTime updatedAt;
    
    // Additional fields for UI table display
    private String formattedAddress;  // For ADDRESS column display
    private String displayId;         // For ID column (formatted ID)
}
