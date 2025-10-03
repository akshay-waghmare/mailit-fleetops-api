package com.fleetops.bulkupload.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Validation error DTO for bulk upload row processing
 * Contains structured error information for client debugging
 * Matches OpenAPI schema in contracts/bulk-upload-api.yaml
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorDto {

    /**
     * Error code for programmatic handling
     * Examples: MISSING_RECEIVER_PINCODE, INVALID_SERVICE_TYPE, DECLARED_VALUE_EXCEEDS_LIMIT
     */
    private String code;

    /**
     * Field name that caused the validation error
     * Examples: receiverPincode, serviceType, declaredValue
     */
    private String field;

    /**
     * Human-readable error message
     * Examples: "Receiver pincode is required", "Service type must be express, standard, or economy"
     */
    private String message;
}
