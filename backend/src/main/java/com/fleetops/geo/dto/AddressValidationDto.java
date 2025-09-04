package com.fleetops.geo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AddressValidationDto {
    private boolean valid;
    private String formattedAddress;
    private Double latitude;
    private Double longitude;
    private List<String> suggestions;
    private String message;
}
