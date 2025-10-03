package com.fleetops.bulkupload.repository;

import com.fleetops.bulkupload.entity.BulkUploadBatch;
import com.fleetops.bulkupload.entity.BulkUploadStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for BulkUploadBatchRepository
 * Uses TestContainers with PostgreSQL for realistic database testing
 * 
 * TDD: This test MUST FAIL FIRST (repository doesn't exist yet)
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/fleetops_dev",
    "spring.datasource.username=fleetops",
    "spring.datasource.password=fleetops",
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.flyway.enabled=false"
})
@DisplayName("BulkUploadBatch Repository Tests")
class BulkUploadBatchRepositoryTest {

    @Autowired
    private BulkUploadBatchRepository repository;

    @Autowired
    private TestEntityManager entityManager;


    @Test
    @DisplayName("Should find batch by batchId")
    void testFindByBatchId() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040001");
        batch.setUploaderUserId(1L);
        batch.setFileName("test.xlsx");
        batch.setFileSizeBytes(1024L);
        batch.setFileChecksum("abc123");
        batch.setStatus(BulkUploadStatus.PROCESSING);
        entityManager.persistAndFlush(batch);

        // When
        Optional<BulkUploadBatch> found = repository.findByBatchId("BU202510040001");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getBatchId()).isEqualTo("BU202510040001");
        assertThat(found.get().getFileName()).isEqualTo("test.xlsx");
    }

    @Test
    @DisplayName("Should return empty when batchId not found")
    void testFindByBatchIdNotFound() {
        // When
        Optional<BulkUploadBatch> found = repository.findByBatchId("BU999999999999");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should delete empty batches created before cutoff date")
    @Transactional
    void testDeleteEmptyBatchesCreatedBefore() {
        // Given - Create old empty batch (totalRows = 0)
        BulkUploadBatch emptyBatch = new BulkUploadBatch();
        emptyBatch.setBatchId("BU202501010001");
        emptyBatch.setUploaderUserId(1L);
        emptyBatch.setFileName("empty.xlsx");
        emptyBatch.setFileSizeBytes(512L);
        emptyBatch.setFileChecksum("empty123");
        emptyBatch.setStatus(BulkUploadStatus.COMPLETED);
        emptyBatch.setTotalRows(0);
        emptyBatch.setCreatedAt(LocalDateTime.now().minusDays(200));
        entityManager.persistAndFlush(emptyBatch);

        // Given - Create old non-empty batch (totalRows > 0)
        BulkUploadBatch nonEmptyBatch = new BulkUploadBatch();
        nonEmptyBatch.setBatchId("BU202501010002");
        nonEmptyBatch.setUploaderUserId(1L);
        nonEmptyBatch.setFileName("nonempty.xlsx");
        nonEmptyBatch.setFileSizeBytes(2048L);
        nonEmptyBatch.setFileChecksum("nonempty123");
        nonEmptyBatch.setStatus(BulkUploadStatus.COMPLETED);
        nonEmptyBatch.setTotalRows(50);
        nonEmptyBatch.setCreatedCount(50);
        nonEmptyBatch.setCreatedAt(LocalDateTime.now().minusDays(200));
        entityManager.persistAndFlush(nonEmptyBatch);

        // Given - Create recent empty batch
        BulkUploadBatch recentBatch = new BulkUploadBatch();
        recentBatch.setBatchId("BU202510040001");
        recentBatch.setUploaderUserId(1L);
        recentBatch.setFileName("recent.xlsx");
        recentBatch.setFileSizeBytes(256L);
        recentBatch.setFileChecksum("recent123");
        recentBatch.setStatus(BulkUploadStatus.PROCESSING);
        recentBatch.setTotalRows(0);
        recentBatch.setCreatedAt(LocalDateTime.now().minusDays(10));
        entityManager.persistAndFlush(recentBatch);

        entityManager.clear();

        // When - Delete batches older than 190 days
        LocalDateTime cutoff = LocalDateTime.now().minusDays(190);
        int deletedCount = repository.deleteEmptyBatchesCreatedBefore(cutoff);

        // Then - Only old empty batch should be deleted
        assertThat(deletedCount).isEqualTo(1);
        assertThat(repository.findByBatchId("BU202501010001")).isEmpty(); // Deleted (old + empty)
        assertThat(repository.findByBatchId("BU202501010002")).isPresent(); // Kept (non-empty)
        assertThat(repository.findByBatchId("BU202510040001")).isPresent(); // Kept (recent)
    }

    @Test
    @DisplayName("Should save batch with all fields")
    void testSaveBatch() {
        // Given
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId("BU202510040999");
        batch.setUploaderUserId(1L);
        batch.setUploaderName("Test User");
        batch.setFileName("orders.xlsx");
        batch.setFileSizeBytes(2048L);
        batch.setFileChecksum("abc123def456");
        batch.setStatus(BulkUploadStatus.COMPLETED);
        batch.setTotalRows(100);
        batch.setCreatedCount(95);
        batch.setFailedCount(3);
        batch.setSkippedDuplicateCount(2);
        batch.setProcessingDurationMs(5000L);

        // When
        BulkUploadBatch saved = repository.save(batch);
        entityManager.flush();
        entityManager.clear();

        // Then
        BulkUploadBatch found = repository.findById(saved.getId()).orElseThrow();
        assertThat(found.getBatchId()).isEqualTo("BU202510040999");
        assertThat(found.getTotalRows()).isEqualTo(100);
        assertThat(found.getCreatedCount()).isEqualTo(95);
        assertThat(found.getFailedCount()).isEqualTo(3);
        assertThat(found.getSkippedDuplicateCount()).isEqualTo(2);
        assertThat(found.getProcessingDurationMs()).isEqualTo(5000L);
    }

    @Test
    @DisplayName("Should enforce unique constraint on batchId")
    void testUniqueBatchId() {
        // Given - First batch
        BulkUploadBatch batch1 = new BulkUploadBatch();
        batch1.setBatchId("BU202510040001");
        batch1.setUploaderUserId(1L);
        batch1.setFileName("test1.xlsx");
        batch1.setFileSizeBytes(1024L);
        batch1.setFileChecksum("abc123");
        batch1.setStatus(BulkUploadStatus.PROCESSING);
        repository.save(batch1);
        entityManager.flush();

        // When - Second batch with same batchId
        BulkUploadBatch batch2 = new BulkUploadBatch();
        batch2.setBatchId("BU202510040001"); // Duplicate!
        batch2.setUploaderUserId(2L);
        batch2.setFileName("test2.xlsx");
        batch2.setFileSizeBytes(2048L);
        batch2.setFileChecksum("def456");
        batch2.setStatus(BulkUploadStatus.PROCESSING);

        // Then - Should throw constraint violation
        assertThatThrownBy(() -> {
            repository.save(batch2);
            entityManager.flush();
        }).satisfiesAnyOf(
                ex -> assertThat(ex).hasMessageContaining("unique"),
                ex -> assertThat(ex).hasMessageContaining("duplicate")
        );
    }
}
