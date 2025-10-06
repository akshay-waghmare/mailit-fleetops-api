# Data Model: Bulk Order Upload

**Feature**: 001-bulk-order-upload  
**Date**: 2025-10-04  
**Status**: Draft

## Overview
Defines entities, relationships, validation rules, and state transitions for bulk order upload feature. Two primary entities: `BulkUploadBatch` (upload metadata) and `BulkUploadRow` (per-row outcome). Reuses existing `Order` entity for order persistence.

---

## Entity Definitions

### 1. BulkUploadBatch

**Purpose**: Stores metadata for each bulk upload operation

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Long | PK, Auto-increment | Internal database ID |
| batchId | String(50) | NOT NULL, UNIQUE | Business ID format: `BU{YYYYMMDD}{seq}` (e.g., BU202510040001) |
| uploaderUserId | Long | NOT NULL | FK to users table (who executed upload) |
| originalFilename | String(255) | NOT NULL | Original Excel filename (e.g., "orders_oct.xlsx") |
| fileChecksum | String(64) | NOT NULL | SHA-256 checksum of uploaded file bytes (hex encoded) |
| uploadedAt | Timestamp | NOT NULL, Default: CURRENT_TIMESTAMP | When file was uploaded |
| processingDurationMs | Long | NULLABLE | Time taken to process all rows (milliseconds) |
| totalRows | Integer | NOT NULL, Default: 0 | Total data rows in Excel (excluding header) |
| createdCount | Integer | NOT NULL, Default: 0 | Number of successfully created orders |
| failedCount | Integer | NOT NULL, Default: 0 | Number of rows that failed validation |
| skippedDuplicateCount | Integer | NOT NULL, Default: 0 | Number of duplicate rows skipped |
| status | String(20) | NOT NULL, Default: 'PROCESSING' | Enum: PROCESSING, COMPLETED, FAILED |
| createdAt | Timestamp | NOT NULL, Default: CURRENT_TIMESTAMP | Record creation timestamp (for retention) |
| updatedAt | Timestamp | NOT NULL, Default: CURRENT_TIMESTAMP | Last update timestamp |

**Relationships**:
- **OneToMany** → BulkUploadRow (cascade delete: when batch deleted, rows deleted)

**Indexes**:
- `idx_bulk_upload_batch_batch_id` (UNIQUE) on `batch_id` - fast business ID lookups
- `idx_bulk_upload_batch_uploader` on `uploader_user_id` - filter batches by user
- `idx_bulk_upload_batch_uploaded_at` on `uploaded_at` - time-based queries
- `idx_bulk_upload_batch_created_at` on `created_at` - retention cleanup queries

**Validation Rules**:
- `batchId` must match pattern `BU\d{8}\d{4}` (BU + YYYYMMDD + 4-digit seq)
- `fileChecksum` must be 64-character hex string (SHA-256 output)
- `totalRows` = `createdCount` + `failedCount` + `skippedDuplicateCount`
- `status` transitions: PROCESSING → (COMPLETED | FAILED); no reverse transitions

**State Transitions**:
```
[PROCESSING] --all rows processed successfully--> [COMPLETED]
[PROCESSING] --any row processing error--> [COMPLETED] (partial success allowed)
[PROCESSING] --catastrophic error (file corrupt)--> [FAILED]
```

**JPA Entity**:
```java
@Entity
@Table(name = "bulk_upload_batch")
public class BulkUploadBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "batch_id", nullable = false, unique = true, length = 50)
    private String batchId;
    
    @Column(name = "uploader_user_id", nullable = false)
    private Long uploaderUserId;
    
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @Column(name = "file_checksum", nullable = false, length = 64)
    private String fileChecksum;
    
    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;
    
    @Column(name = "processing_duration_ms")
    private Long processingDurationMs;
    
    @Column(name = "total_rows", nullable = false)
    private Integer totalRows = 0;
    
    @Column(name = "created_count", nullable = false)
    private Integer createdCount = 0;
    
    @Column(name = "failed_count", nullable = false)
    private Integer failedCount = 0;
    
    @Column(name = "skipped_duplicate_count", nullable = false)
    private Integer skippedDuplicateCount = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BatchStatus status = BatchStatus.PROCESSING;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BulkUploadRow> rows = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}

public enum BatchStatus {
    PROCESSING,
    COMPLETED,
    FAILED
}
```

---

### 2. BulkUploadRow

**Purpose**: Stores per-row processing outcome for each row in uploaded Excel

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Long | PK, Auto-increment | Internal database ID |
| batchId | Long | FK, NOT NULL | Foreign key to `bulk_upload_batch.id` |
| rowIndex | Integer | NOT NULL | Excel row number (1-based, excluding header) |
| status | String(30) | NOT NULL | Enum: CREATED, FAILED_VALIDATION, SKIPPED_DUPLICATE |
| idempotencyKey | String(300) | NOT NULL | Either `{clientId}:{clientReference}` or `HASH:{sha256}` |
| idempotencyBasis | String(20) | NOT NULL | Enum: CLIENT_REFERENCE, HASH |
| orderId | Long | FK, NULLABLE | Foreign key to `orders.id` (NULL if row failed) |
| errorMessages | JSONB | NULLABLE | JSON array of error objects: `[{code, field, message}]` |
| rawData | JSONB | NULLABLE | Optional: original Excel row data as JSON (for debugging) |
| createdAt | Timestamp | NOT NULL, Default: CURRENT_TIMESTAMP | Record creation timestamp (for retention) |

**Relationships**:
- **ManyToOne** → BulkUploadBatch (required; cascade delete handled by FK)
- **ManyToOne** → Order (optional; SET NULL on order delete to preserve audit trail)

**Indexes**:
- `idx_bulk_upload_row_batch` on `batch_id` - fast batch-to-rows queries
- `idx_bulk_upload_row_idempotency_key` on `idempotency_key` - duplicate detection
- `idx_bulk_upload_row_created_at` on `created_at` - retention cleanup queries
- `idx_bulk_upload_row_batch_index` (UNIQUE) on `(batch_id, row_index)` - prevent duplicate row records

**Validation Rules**:
- `rowIndex` must be >= 1
- `idempotencyKey` max length 300 chars (hash prefix "HASH:" + 64-char hex = 69 chars)
- `errorMessages` must be valid JSON array (validated at application layer)
- `orderId` must be NULL if `status` != CREATED
- `orderId` must be NOT NULL if `status` = CREATED

**Error Message Schema**:
```json
[
  {
    "code": "MISSING_RECEIVER_PINCODE",
    "field": "receiverPincode",
    "message": "Receiver pincode is required"
  },
  {
    "code": "DECLARED_VALUE_EXCEEDS_LIMIT",
    "field": "declaredValue",
    "message": "Declared value 150000 exceeds maximum allowed 100000"
  }
]
```

**Status Values**:
- `CREATED`: Row successfully created an order; `orderId` populated
- `FAILED_VALIDATION`: Row failed one or more validation rules; `errorMessages` populated
- `SKIPPED_DUPLICATE`: Row matched existing `idempotencyKey`; `orderId` NULL

**JPA Entity**:
```java
@Entity
@Table(name = "bulk_upload_row",
       uniqueConstraints = @UniqueConstraint(columnNames = {"batch_id", "row_index"}))
public class BulkUploadRow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private BulkUploadBatch batch;
    
    @Column(name = "row_index", nullable = false)
    private Integer rowIndex;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RowStatus status;
    
    @Column(name = "idempotency_key", nullable = false, length = 300)
    private String idempotencyKey;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "idempotency_basis", nullable = false, length = 20)
    private IdempotencyBasis idempotencyBasis;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
    
    @Type(JsonBinaryType.class)
    @Column(name = "error_messages", columnDefinition = "jsonb")
    private List<ErrorMessage> errorMessages;
    
    @Type(JsonBinaryType.class)
    @Column(name = "raw_data", columnDefinition = "jsonb")
    private Map<String, String> rawData;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

public enum RowStatus {
    CREATED,
    FAILED_VALIDATION,
    SKIPPED_DUPLICATE
}

public enum IdempotencyBasis {
    CLIENT_REFERENCE,
    HASH
}

@Embeddable
public class ErrorMessage {
    private String code;
    private String field;
    private String message;
}
```

---

### 3. Order (Existing Entity - Reused)

**Purpose**: Existing entity for order persistence; no schema changes required

**Relevant Fields** (used by bulk upload):
- `id` (Long, PK)
- `orderId` (String, business ID like "ORD000123")
- `clientId` (Long)
- `senderName`, `senderAddress`, `senderContact`
- `receiverName`, `receiverAddress`, `receiverCity`, `receiverPincode`
- `itemCount`, `totalWeight`
- `serviceType` (Enum: EXPRESS, STANDARD, ECONOMY)
- `declaredValue`, `codAmount`
- `specialInstructions`
- `status` (Enum: PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED)
- `createdAt`, `updatedAt`

**Integration**:
- BulkUploadServiceImpl calls existing `OrderService.createOrder(CreateOrderDto)` for each valid row
- BulkUploadRow stores FK reference to created Order via `orderId` field

---

## Entity Relationships Diagram

```
┌─────────────────────────┐
│   BulkUploadBatch       │
│─────────────────────────│
│ id (PK)                 │
│ batchId (UK)            │
│ uploaderUserId          │
│ originalFilename        │
│ fileChecksum            │
│ uploadedAt              │
│ processingDurationMs    │
│ totalRows               │
│ createdCount            │
│ failedCount             │
│ skippedDuplicateCount   │
│ status                  │
│ createdAt               │
│ updatedAt               │
└─────────────────────────┘
           │ 1
           │
           │ owns
           │
           │ *
┌─────────────────────────┐         ┌──────────────────┐
│   BulkUploadRow         │         │   Order          │
│─────────────────────────│         │──────────────────│
│ id (PK)                 │         │ id (PK)          │
│ batch_id (FK)           │         │ orderId (UK)     │
│ rowIndex                │    *    │ clientId         │
│ status                  ├────────>│ senderName       │
│ idempotencyKey          │ refers  │ receiverName     │
│ idempotencyBasis        │    0..1 │ serviceType      │
│ order_id (FK)           │         │ ...              │
│ errorMessages (JSONB)   │         └──────────────────┘
│ rawData (JSONB)         │
│ createdAt               │
└─────────────────────────┘
```

---

## Validation Rules Summary

### BulkUploadBatch
1. **batchId Format**: Must match `BU\d{8}\d{4}` pattern
2. **Count Invariant**: `totalRows = createdCount + failedCount + skippedDuplicateCount`
3. **Status Transitions**: Only forward transitions (PROCESSING → COMPLETED/FAILED)

### BulkUploadRow
1. **Row Index**: Must be >= 1
2. **Idempotency Key**: Max 300 chars; unique across all rows
3. **Order Reference**: `orderId` NULL ↔ `status` != CREATED
4. **Error Messages**: Valid JSON array when `status = FAILED_VALIDATION`

### Cross-Entity
1. **Retention**: Rows deleted after 180 days (via `created_at`); batches after 180 days
2. **Cascade Delete**: Deleting batch deletes all associated rows
3. **Orphan Prevention**: Cannot create BulkUploadRow without valid batch FK

---

## Database Migrations

### V5__create_bulk_upload_batch.sql
```sql
CREATE TABLE bulk_upload_batch (
    id BIGSERIAL PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL UNIQUE,
    uploader_user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_checksum VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_duration_ms BIGINT,
    total_rows INT NOT NULL DEFAULT 0,
    created_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    skipped_duplicate_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_upload_batch_batch_id ON bulk_upload_batch(batch_id);
CREATE INDEX idx_bulk_upload_batch_uploader ON bulk_upload_batch(uploader_user_id);
CREATE INDEX idx_bulk_upload_batch_uploaded_at ON bulk_upload_batch(uploaded_at);
CREATE INDEX idx_bulk_upload_batch_created_at ON bulk_upload_batch(created_at);

COMMENT ON TABLE bulk_upload_batch IS 'Metadata for bulk order upload batches; retained 180 days';
COMMENT ON COLUMN bulk_upload_batch.batch_id IS 'Business ID format: BU{YYYYMMDD}{seq}';
```

### V6__create_bulk_upload_row.sql
```sql
CREATE TABLE bulk_upload_row (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES bulk_upload_batch(id) ON DELETE CASCADE,
    row_index INT NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('CREATED', 'FAILED_VALIDATION', 'SKIPPED_DUPLICATE')),
    idempotency_key VARCHAR(300) NOT NULL,
    idempotency_basis VARCHAR(20) NOT NULL CHECK (idempotency_basis IN ('CLIENT_REFERENCE', 'HASH')),
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    error_messages JSONB,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_upload_row_batch ON bulk_upload_row(batch_id);
CREATE INDEX idx_bulk_upload_row_idempotency_key ON bulk_upload_row(idempotency_key);
CREATE INDEX idx_bulk_upload_row_created_at ON bulk_upload_row(created_at);
CREATE UNIQUE INDEX idx_bulk_upload_row_batch_index ON bulk_upload_row(batch_id, row_index);

COMMENT ON TABLE bulk_upload_row IS 'Per-row outcomes for bulk uploads; retained 180 days';
COMMENT ON COLUMN bulk_upload_row.error_messages IS 'JSON array of {code, field, message}';
```

---

## Repository Interfaces

### BulkUploadBatchRepository
```java
public interface BulkUploadBatchRepository extends JpaRepository<BulkUploadBatch, Long> {
    
    Optional<BulkUploadBatch> findByBatchId(String batchId);
    
    Page<BulkUploadBatch> findByUploaderUserId(Long uploaderUserId, Pageable pageable);
    
    @Query("DELETE FROM BulkUploadBatch b WHERE b.createdAt < :cutoff AND SIZE(b.rows) = 0")
    @Modifying
    int deleteEmptyBatchesCreatedBefore(@Param("cutoff") LocalDateTime cutoff);
}
```

### BulkUploadRowRepository
```java
public interface BulkUploadRowRepository extends JpaRepository<BulkUploadRow, Long> {
    
    List<BulkUploadRow> findByBatchId(Long batchId);
    
    Optional<BulkUploadRow> findByIdempotencyKey(String idempotencyKey);
    
    @Modifying
    @Query("DELETE FROM BulkUploadRow r WHERE r.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);
}
```

---

## Performance Considerations

1. **Batch Inserts**: Use `saveAll()` with batch size 50 for BulkUploadRow to reduce DB round-trips
2. **Index Usage**: All queries covered by indexes; no full table scans expected
3. **JSONB Storage**: Error messages stored as JSONB for flexible querying; consider GIN index if filtering by error codes required
4. **Retention Queries**: Indexed `created_at` columns enable efficient `WHERE created_at < cutoff` scans

---

## Next Steps

- ✅ Data model defined
- → Generate OpenAPI contracts for DTOs (Phase 1.2)
- → Generate integration test scenarios (Phase 1.4)
