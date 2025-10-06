package com.fleetops.bulkupload.entity;

/**
 * Processing status for individual rows in bulk upload
 * Indicates outcome after validation and order creation attempt
 */
public enum RowStatus {
    /**
     * Row successfully validated and order created
     * - All validations passed
     * - Order record inserted into database
     * - order_id populated
     */
    CREATED,

    /**
     * Row failed validation
     * - Structural, format, or business rule violations
     * - error_messages populated with validation errors
     * - order_id remains NULL
     */
    FAILED_VALIDATION,

    /**
     * Row skipped due to duplicate idempotency key
     * - Same clientReference or hash already exists
     * - order_id remains NULL (or references existing order)
     */
    SKIPPED_DUPLICATE
}
