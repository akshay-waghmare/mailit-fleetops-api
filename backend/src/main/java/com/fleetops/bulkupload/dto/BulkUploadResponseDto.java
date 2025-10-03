package com.fleetops.bulkupload.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * Response DTO for bulk upload operations
 * Returns batch summary with per-row outcomes
 * Matches OpenAPI schema in contracts/bulk-upload-api.yaml
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponseDto {

    /**
     * Unique batch identifier (e.g., BU202510040001)
     */
    private String batchId;

    /**
     * Total number of rows processed
     */
    private Integer totalRows;

    /**
     * Number of orders successfully created
     */
    private Integer createdCount;

    /**
     * Number of rows that failed validation
     */
    private Integer failedCount;

    /**
     * Number of rows skipped due to duplicate idempotency keys
     */
    private Integer skippedDuplicateCount;

    /**
     * Processing duration in milliseconds
     */
    private Long processingDurationMs;

    /**
     * Detailed outcome for each row
     */
    private List<RowOutcomeDto> rows;
}
