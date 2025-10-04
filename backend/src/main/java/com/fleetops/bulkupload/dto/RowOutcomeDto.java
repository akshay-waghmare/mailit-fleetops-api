package com.fleetops.bulkupload.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * Outcome DTO for individual row processing
 * Contains status, validation errors, and created order reference
 * Matches OpenAPI schema in contracts/bulk-upload-api.yaml
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RowOutcomeDto {

    /**
     * 1-based row index from Excel file (excluding header)
     */
    private Integer rowIndex;

    /**
     * Processing status: CREATED, FAILED_VALIDATION, SKIPPED_DUPLICATE
     */
    private String status;

    /**
     * How idempotency key was derived: CLIENT_REFERENCE or HASH
     */
    private String idempotencyBasis;

    /**
     * ID of created order (null if row failed or was skipped)
     */
    private Long orderId;

    /**
     * List of validation errors (empty if row was successful)
     */
    private List<ValidationErrorDto> errorMessages;
}
