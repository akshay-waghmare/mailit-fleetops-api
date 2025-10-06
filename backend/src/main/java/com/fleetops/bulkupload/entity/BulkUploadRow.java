package com.fleetops.bulkupload.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Entity representing a single row outcome in a bulk upload
 * Tracks validation results, idempotency, and order creation
 * 
 * Retention: 30 days (configurable via application properties)
 */
@Entity
@Table(name = "bulk_upload_row")
@Data
@NoArgsConstructor
public class BulkUploadRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ManyToOne relationship with BulkUploadBatch (CASCADE delete)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bulk_upload_row_batch_id"))
    private BulkUploadBatch batch;

    @Column(name = "row_index", nullable = false)
    private Integer rowIndex; // 1-based row number from Excel (excluding header)

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 300)
    private String idempotencyKey; // clientReference (preferred) or SHA-256 hash

    @Column(name = "idempotency_basis", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private IdempotencyBasis idempotencyBasis;

    @Column(name = "status", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private RowStatus status;

    // Nullable - only set if order created successfully
    @Column(name = "order_id")
    private Long orderId; // Foreign key to orders(id) - SET NULL on delete

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "error_messages", columnDefinition = "jsonb")
    private List<String> errorMessages = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_data", columnDefinition = "jsonb")
    private Map<String, Object> rawData = new HashMap<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Lifecycle callback to update updatedAt
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
