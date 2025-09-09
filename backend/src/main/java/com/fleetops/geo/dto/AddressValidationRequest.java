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
