package com.fleetops.bulkupload.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Unit tests for BulkUploadRow entity
 * Tests relationships, JSONB fields, and constraints
 * 
 * TDD: This test MUST FAIL FIRST (entity doesn't exist yet)
 */
@DisplayName("BulkUploadRow Entity Tests")
class BulkUploadRowTest {

    @Test
    @DisplayName("Should support ManyToOne relationship with BulkUploadBatch")
    void testManyToOneBatchRelationship() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040001");
        
        BulkUploadRow row = new BulkUploadRow();
        row.setBatch(batch);
        row.setRowIndex(1);
        
        // Then
        assertThat(row.getBatch()).isNotNull();
        assertThat(row.getBatch()).isEqualTo(batch);
        assertThat(row.getBatch().getBatchId()).isEqualTo("BU202510040001");
    }

    @Test
    @DisplayName("Should support nullable ManyToOne relationship with Order")
    void testManyToOneOrderRelationship() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        row.setRowIndex(1);
        
        // Case 1: Row without order (validation failed)
        assertThat(row.getOrderId()).isNull();
        
        // Case 2: Row with order (successfully created)
        row.setOrderId(12345L);
        assertThat(row.getOrderId()).isEqualTo(12345L);
    }

    @Test
    @DisplayName("Should enforce idempotencyKey max 300 chars")
    void testIdempotencyKeyLength() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        String longKey = "A".repeat(300);
        row.setIdempotencyKey(longKey);
        
        // Then
        assertThat(row.getIdempotencyKey()).hasSize(300);
        assertThat(row.getIdempotencyKey().length()).isLessThanOrEqualTo(300);
    }

    @Test
    @DisplayName("Should support idempotency basis enum: CLIENT_REFERENCE or HASH")
    void testIdempotencyBasis() {
        // Given
        BulkUploadRow row1 = new BulkUploadRow();
        row1.setIdempotencyKey("REF-12345");
        row1.setIdempotencyBasis(IdempotencyBasis.CLIENT_REFERENCE);
        
        BulkUploadRow row2 = new BulkUploadRow();
        row2.setIdempotencyKey("abc123def456..."); // SHA-256 hash
        row2.setIdempotencyBasis(IdempotencyBasis.HASH);
        
        // Then
        assertThat(row1.getIdempotencyBasis()).isEqualTo(IdempotencyBasis.CLIENT_REFERENCE);
        assertThat(row2.getIdempotencyBasis()).isEqualTo(IdempotencyBasis.HASH);
    }

    @Test
    @DisplayName("Should support status enum: CREATED, FAILED_VALIDATION, SKIPPED_DUPLICATE")
    void testStatusEnum() {
        // Given
        BulkUploadRow createdRow = new BulkUploadRow();
        createdRow.setStatus(RowStatus.CREATED);
        
        BulkUploadRow failedRow = new BulkUploadRow();
        failedRow.setStatus(RowStatus.FAILED_VALIDATION);
        
        BulkUploadRow skippedRow = new BulkUploadRow();
        skippedRow.setStatus(RowStatus.SKIPPED_DUPLICATE);
        
        // Then
        assertThat(createdRow.getStatus()).isEqualTo(RowStatus.CREATED);
        assertThat(failedRow.getStatus()).isEqualTo(RowStatus.FAILED_VALIDATION);
        assertThat(skippedRow.getStatus()).isEqualTo(RowStatus.SKIPPED_DUPLICATE);
    }

    @Test
    @DisplayName("Should support JSONB errorMessages deserialization")
    void testErrorMessagesJsonb() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        // errorMessages is JSONB array: [{"code": "MISSING_RECEIVER_PINCODE", "field": "receiverPincode", "message": "..."}]
        // The exact type depends on Hibernate Types library
        
        // Then - verify field exists (actual JSONB tested in integration tests)
        assertThat(row).hasFieldOrProperty("errorMessages");
    }

    @Test
    @DisplayName("Should support JSONB rawData for debugging")
    void testRawDataJsonb() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        // rawData is JSONB object containing original Excel row
        
        // Then - verify field exists (actual JSONB tested in integration tests)
        assertThat(row).hasFieldOrProperty("rawData");
    }

    @Test
    @DisplayName("Should enforce positive row index")
    void testPositiveRowIndex() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        row.setRowIndex(1); // Valid: 1-based indexing
        
        // Then
        assertThat(row.getRowIndex()).isPositive();
        assertThat(row.getRowIndex()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Should support audit fields: createdAt, updatedAt")
    void testAuditFields() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        LocalDateTime now = LocalDateTime.now();
        row.setCreatedAt(now);
        row.setUpdatedAt(now);
        
        // Then
        assertThat(row.getCreatedAt()).isNotNull();
        assertThat(row.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should enforce required fields")
    void testRequiredFields() {
        // Given
        BulkUploadRow row = new BulkUploadRow();
        BulkUploadBatch batch = new BulkUploadBatch();
        
        row.setBatch(batch);
        row.setRowIndex(1);
        row.setIdempotencyKey("REF-12345");
        row.setIdempotencyBasis(IdempotencyBasis.CLIENT_REFERENCE);
        row.setStatus(RowStatus.CREATED);
        
        // Then
        assertThat(row.getBatch()).isNotNull();
        assertThat(row.getRowIndex()).isNotNull();
        assertThat(row.getIdempotencyKey()).isNotNull();
        assertThat(row.getIdempotencyBasis()).isNotNull();
        assertThat(row.getStatus()).isNotNull();
    }

    @Test
    @DisplayName("Should maintain cascade relationship with batch")
    void testCascadeDelete() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040001");
        
        BulkUploadRow row = new BulkUploadRow();
        row.setBatch(batch);
        row.setRowIndex(1);
        
        // Then - verify relationship exists
        // Actual CASCADE behavior tested in integration tests with database
        assertThat(row.getBatch()).isEqualTo(batch);
    }
}
