package com.fleetops.bulkupload.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;

/**
 * Unit tests for BulkUploadBatch entity
 * Tests field constraints, count invariant, and relationships
 * 
 * TDD: This test MUST FAIL FIRST (entity doesn't exist yet)
 */
@DisplayName("BulkUploadBatch Entity Tests")
class BulkUploadBatchTest {

    @Test
    @DisplayName("Should create batch with valid batchId pattern BU{YYYYMMDD}{seq}")
    void testBatchIdPattern() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040001");
        
        // Then
        assertThat(batch.getBatchId()).matches("^BU\\d{12}$");
        assertThat(batch.getBatchId()).hasSize(14); // BU + 8 date digits + 4 sequence digits
    }

    @Test
    @DisplayName("Should enforce non-null required fields")
    void testRequiredFields() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040001");
        batch.setUploaderUserId(1L);
        batch.setFileName("orders.xlsx");
        batch.setFileSizeBytes(1024L);
        batch.setFileChecksum("abc123...");
        batch.setStatus(BulkUploadStatus.PROCESSING);
        
        // Then
        assertThat(batch.getBatchId()).isNotNull();
        assertThat(batch.getUploaderUserId()).isNotNull();
        assertThat(batch.getFileName()).isNotNull();
        assertThat(batch.getFileSizeBytes()).isNotNull();
        assertThat(batch.getFileChecksum()).isNotNull();
        assertThat(batch.getStatus()).isNotNull();
    }

    @Test
    @DisplayName("Should maintain count invariant: totalRows = created + failed + skipped")
    void testCountInvariant() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setCreatedCount(46);
        batch.setFailedCount(3);
        batch.setSkippedDuplicateCount(1);
        batch.setTotalRows(50);
        
        // Then
        assertThat(batch.getTotalRows())
            .isEqualTo(batch.getCreatedCount() + batch.getFailedCount() + batch.getSkippedDuplicateCount());
    }

    @Test
    @DisplayName("Should support status enum transitions: PROCESSING → COMPLETED/FAILED")
    void testStatusTransitions() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        
        // Initial state
        batch.setStatus(BulkUploadStatus.PROCESSING);
        assertThat(batch.getStatus()).isEqualTo(BulkUploadStatus.PROCESSING);
        
        // Success transition
        batch.setStatus(BulkUploadStatus.COMPLETED);
        assertThat(batch.getStatus()).isEqualTo(BulkUploadStatus.COMPLETED);
        
        // Failure transition
        BulkUploadBatch failedBatch = new BulkUploadBatch();
        failedBatch.setStatus(BulkUploadStatus.PROCESSING);
        failedBatch.setStatus(BulkUploadStatus.FAILED);
        assertThat(failedBatch.getStatus()).isEqualTo(BulkUploadStatus.FAILED);
    }

    @Test
    @DisplayName("Should initialize default values")
    void testDefaultValues() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        
        // Then - defaults should be set
        assertThat(batch.getTotalRows()).isEqualTo(0);
        assertThat(batch.getCreatedCount()).isEqualTo(0);
        assertThat(batch.getFailedCount()).isEqualTo(0);
        assertThat(batch.getSkippedDuplicateCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should support OneToMany relationship with BulkUploadRow")
    void testOneToManyRelationship() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040001");
        
        BulkUploadRow row1 = new BulkUploadRow();
        row1.setRowIndex(1);
        row1.setBatch(batch);
        
        BulkUploadRow row2 = new BulkUploadRow();
        row2.setRowIndex(2);
        row2.setBatch(batch);
        
        batch.getRows().add(row1);
        batch.getRows().add(row2);
        
        // Then
        assertThat(batch.getRows()).hasSize(2);
        assertThat(batch.getRows()).containsExactly(row1, row2);
        assertThat(row1.getBatch()).isEqualTo(batch);
        assertThat(row2.getBatch()).isEqualTo(batch);
    }

    @Test
    @DisplayName("Should track processing duration in milliseconds")
    void testProcessingDuration() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        LocalDateTime start = LocalDateTime.now();
        batch.setProcessingStartedAt(start);
        
        // Simulate processing
        LocalDateTime end = start.plusSeconds(5);
        batch.setProcessingCompletedAt(end);
        batch.setProcessingDurationMs(5000L);
        
        // Then
        assertThat(batch.getProcessingDurationMs()).isEqualTo(5000L);
        assertThat(batch.getProcessingStartedAt()).isEqualTo(start);
        assertThat(batch.getProcessingCompletedAt()).isEqualTo(end);
    }

    @Test
    @DisplayName("Should support audit fields: createdAt, updatedAt")
    void testAuditFields() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        LocalDateTime now = LocalDateTime.now();
        batch.setCreatedAt(now);
        batch.setUpdatedAt(now);
        
        // Then
        assertThat(batch.getCreatedAt()).isNotNull();
        assertThat(batch.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should support JSONB metadata field")
    void testMetadataField() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        // Metadata would typically be a Map<String, Object> or String
        // The exact type depends on Hibernate Types library configuration
        
        // Then - just verify the field exists and can be set/get
        // Actual JSONB serialization tested in integration tests
        assertThat(batch).hasFieldOrProperty("metadata");
    }
}
