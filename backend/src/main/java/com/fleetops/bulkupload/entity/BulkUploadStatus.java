package com.fleetops.bulkupload.entity;

/**
 * Processing status for bulk upload batches
 * Tracks lifecycle: PROCESSING → COMPLETED/FAILED
 */
public enum BulkUploadStatus {
    /**
     * Batch is currently being processed
     * - File uploaded and validation started
     * - Rows being validated and orders being created
     */
    PROCESSING,

    /**
     * Batch processing completed successfully
     * - All rows processed (may include individual failures)
     * - Counts reconciled: totalRows = created + failed + skipped
     */
    COMPLETED,

    /**
     * Batch processing failed
     * - System error prevented completion
     * - File parsing error, database error, etc.
     */
    FAILED
}
