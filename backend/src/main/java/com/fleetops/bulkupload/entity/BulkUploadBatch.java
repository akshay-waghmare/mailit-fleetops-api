package com.fleetops.bulkupload.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a bulk upload batch
 * Tracks metadata for Excel-based bulk order uploads
 * 
 * Retention: 180 days (configurable via application properties)
 */
@Entity
@Table(name = "bulk_upload_batch")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false, unique = true, length = 50)
    private String batchId; // Format: BU{YYYYMMDD}{seq} e.g., BU202510040001

    @Column(name = "uploader_user_id", nullable = false)
    private Long uploaderUserId; // Hardcoded to 1 in Phase 1 (auth deferred to Phase 2)

    @Column(name = "uploader_name", length = 255)
    private String uploaderName;

    @Column(name = "file_name", nullable = false, length = 512)
    private String fileName;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "file_checksum", nullable = false, length = 64)
    private String fileChecksum; // SHA-256 hash for duplicate detection

    @Column(name = "status", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private BulkUploadStatus status = BulkUploadStatus.PROCESSING;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows = 0;

    @Column(name = "created_count", nullable = false)
    private Integer createdCount = 0;

    @Column(name = "failed_count", nullable = false)
    private Integer failedCount = 0;

    @Column(name = "skipped_duplicate_count", nullable = false)
    private Integer skippedDuplicateCount = 0;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(name = "processing_started_at")
    private LocalDateTime processingStartedAt;

    @Column(name = "processing_completed_at")
    private LocalDateTime processingCompletedAt;

    @Column(name = "processing_duration_ms")
    private Long processingDurationMs;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata = "{}"; // JSONB stored as String, parsed as needed

    // OneToMany relationship with BulkUploadRow
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BulkUploadRow> rows = new ArrayList<>();

    // Lifecycle callback to update updatedAt
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper method to add a row
    public void addRow(BulkUploadRow row) {
        rows.add(row);
        row.setBatch(this);
    }

    // Helper method to remove a row
    public void removeRow(BulkUploadRow row) {
        rows.remove(row);
        row.setBatch(null);
    }
}
