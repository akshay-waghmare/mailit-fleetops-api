# 📦 Bulk Upload Framework Guide

## 🎯 Purpose
Reusable patterns and components for implementing bulk upload features across different entities (Orders, Pickups, Shipments, Customers, etc.)

---

## 🧠 Lessons Learned from Order Bulk Upload

### ✅ What Worked Well

1. **Dual Idempotency Strategy**
   - CLIENT_REFERENCE (user-provided) + HASH (computed fallback)
   - Prevents duplicates at both file and row level
   - ✨ **Reusable for all entities**

2. **Batch + Row Pattern**
   - Batch tracks file-level metadata
   - Rows track individual outcomes
   - Clear audit trail with processing metrics
   - ✨ **Universal pattern for any bulk operation**

3. **Phase-Based Implementation**
   - Phase 1: Core upload + persistence (no actual entity creation)
   - Phase 2: Actual entity creation + validation
   - Allows frontend/backend parallel development
   - ✨ **Reduces risk, enables incremental delivery**

4. **Excel Template Generation**
   - Downloadable template with examples and validation notes
   - Reduces user errors
   - ✨ **Essential for user onboarding**

5. **File Checksum for Duplicate Detection**
   - SHA-256 of entire file prevents re-upload of same file
   - Complements row-level idempotency
   - ✨ **Fast rejection at file level**

6. **Retention Policy with Cleanup Jobs**
   - Rows: 30 days, Batches: 180 days
   - Quartz scheduled job for automated cleanup
   - ✨ **Prevents database bloat**

### ⚠️ Challenges & Solutions

1. **Challenge**: Repository tests disabled due to JPA complexity
   - **Solution**: Focus on service-level integration tests with TestContainers
   - **Learning**: Unit test services, integration test repositories

2. **Challenge**: Excel header mapping fragility
   - **Solution**: Exact header names in template + parser validation
   - **Learning**: Generate template from same constants as parser

3. **Challenge**: Manual testing tedious
   - **Solution**: Created comprehensive test guide with SQL queries
   - **Learning**: Automate test data generation in integration tests

4. **Challenge**: Frontend needed real-time status updates
   - **Solution**: Deferred to Phase 2 (SSE/WebSocket)
   - **Learning**: Plan for async processing from start

---

## 🏗️ Generic Bulk Upload Architecture

### Core Components (Reusable)

```
┌─────────────────────────────────────────────────────────────┐
│                    BULK UPLOAD FRAMEWORK                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐    ┌─────────────────┐                  │
│  │  Excel Parser  │───▶│  Idempotency    │                  │
│  │   (Generic)    │    │    Service      │                  │
│  └────────────────┘    └─────────────────┘                  │
│          │                       │                            │
│          ▼                       ▼                            │
│  ┌────────────────────────────────────────┐                 │
│  │       Validation Pipeline              │                 │
│  │  (Structural → Format → Business)      │                 │
│  └────────────────────────────────────────┘                 │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────────────────────────────┐                 │
│  │    Batch Orchestration Service         │                 │
│  │  (Batch + Row persistence)             │                 │
│  └────────────────────────────────────────┘                 │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────────────────────────────┐                 │
│  │    Entity-Specific Creation            │                 │
│  │  (Order/Pickup/Shipment Service)       │                 │
│  └────────────────────────────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema Pattern (Reusable)

```sql
-- Generic Batch Table
CREATE TABLE bulk_upload_batch (
  id BIGSERIAL PRIMARY KEY,
  batch_id VARCHAR(50) NOT NULL UNIQUE,        -- {PREFIX}YYYYMMDD-HHMM
  entity_type VARCHAR(32) NOT NULL,             -- NEW: 'ORDER', 'PICKUP', 'SHIPMENT'
  file_name VARCHAR(500),
  file_size_bytes BIGINT,
  file_checksum VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING',
  uploader_user_id BIGINT,
  total_rows INT NOT NULL DEFAULT 0,
  created_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  skipped_duplicate_count INT NOT NULL DEFAULT 0,
  processing_duration_ms BIGINT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generic Row Table
CREATE TABLE bulk_upload_row (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT NOT NULL REFERENCES bulk_upload_batch(id) ON DELETE CASCADE,
  entity_type VARCHAR(32) NOT NULL,             -- NEW: 'ORDER', 'PICKUP', 'SHIPMENT'
  row_index INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  idempotency_key VARCHAR(300) UNIQUE,
  idempotency_basis VARCHAR(32),
  entity_id BIGINT,                              -- NEW: Generic reference (polymorphic)
  entity_external_id VARCHAR(100),               -- NEW: e.g., orderId, pickupId
  error_messages JSONB DEFAULT '[]'::jsonb,
  raw_data JSONB,                                -- NEW: Store original row for audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_upload_batch_entity_type ON bulk_upload_batch(entity_type);
CREATE INDEX idx_bulk_upload_row_entity_type ON bulk_upload_row(entity_type);
CREATE INDEX idx_bulk_upload_row_entity_id ON bulk_upload_row(entity_type, entity_id);
```

---

## 🔧 Reusable Components Library

### 1. Generic Excel Parser

**Location**: `backend/src/main/java/com/fleetops/bulkupload/parser/GenericExcelParser.java`

```java
public interface GenericExcelParser<T> {
    List<T> parse(InputStream excelStream, Map<String, String> headerMapping) 
        throws ExcelParseException;
    
    byte[] generateTemplate(List<String> headers, List<T> exampleRows);
}
```

**Use Cases**:
- Orders: 27 columns
- Pickups: ~15 columns
- Shipments: ~20 columns
- Customers: ~10 columns

### 2. Generic Idempotency Service

**Location**: `backend/src/main/java/com/fleetops/bulkupload/service/GenericIdempotencyService.java`

```java
public interface IdempotencyService<T> {
    String computeIdempotencyKey(T dto, Function<T, String> clientRefExtractor);
    IdempotencyBasis getIdempotencyBasis(T dto);
    boolean isDuplicate(String key, String entityType);
}
```

**Canonical Hash Fields** (customize per entity):
- Orders: senderName, receiverName, receiverPincode, itemCount, totalWeight
- Pickups: clientName, pickupAddress, pickupDate, itemCount
- Customers: companyName, email, phone

### 3. Generic Validation Pipeline

**Location**: `backend/src/main/java/com/fleetops/bulkupload/validation/ValidationPipeline.java`

```java
public interface Validator<T> {
    List<ValidationErrorDto> validate(T dto);
}

public class ValidationPipeline<T> {
    private List<Validator<T>> validators;
    
    public List<ValidationErrorDto> runAll(T dto) {
        return validators.stream()
            .flatMap(v -> v.validate(dto).stream())
            .collect(Collectors.toList());
    }
}
```

**Standard Validators** (implement per entity):
- StructuralValidator: Required fields
- FormatValidator: Data types, patterns
- BusinessRulesValidator: Domain constraints
- DuplicationValidator: In-file duplicates

### 4. Generic Batch Service

**Location**: `backend/src/main/java/com/fleetops/bulkupload/service/GenericBatchService.java`

```java
public interface BulkUploadService<T, E> {
    BulkUploadResponseDto processBulkUpload(
        MultipartFile file, 
        String entityType,
        Function<T, E> entityCreator,
        Long uploaderUserId
    );
    
    Page<BatchSummaryDto> listBatches(Pageable pageable, String entityType);
    byte[] generateTemplate(String entityType);
}
```

---

## 📋 Future Bulk Upload Candidates

### Priority 1 (High Value)

1. **Bulk Pickup Upload** 🚚
   - **Excel Columns**: clientName, pickupAddress, pickupDate, pickupTime, itemCount, totalWeight
   - **Idempotency**: clientReference OR hash(clientName + pickupAddress + pickupDate)
   - **Validation**: Date not in past, valid address
   - **Estimated Effort**: 3-4 days (reuse 80% of Order framework)

2. **Bulk Customer Upload** 👥
   - **Excel Columns**: companyName, contactPerson, email, phone, address, city, pincode
   - **Idempotency**: email OR hash(companyName + phone)
   - **Validation**: Email format, phone format, unique email
   - **Estimated Effort**: 2-3 days

3. **Bulk Shipment Upload** 📦
   - **Excel Columns**: Similar to Orders but with trackingNumber, carrier, origin, destination
   - **Idempotency**: trackingNumber OR hash(sender + receiver + itemCount)
   - **Validation**: Valid tracking format, carrier exists
   - **Estimated Effort**: 3-4 days

### Priority 2 (Medium Value)

4. **Bulk Vehicle Upload** 🚗
   - **Excel Columns**: registrationNumber, vehicleType, capacity, assignedDriver
   - **Idempotency**: registrationNumber (unique by law)
   - **Validation**: Valid registration format, capacity > 0
   - **Estimated Effort**: 2-3 days

5. **Bulk Driver Upload** 🧑‍✈️
   - **Excel Columns**: name, licenseNumber, phone, email, vehicleAssignment
   - **Idempotency**: licenseNumber OR email
   - **Validation**: Valid license, unique phone/email
   - **Estimated Effort**: 2 days

6. **Bulk Price Update** 💰
   - **Excel Columns**: serviceType, fromPincode, toPincode, weight, newPrice
   - **Idempotency**: hash(serviceType + route + weight)
   - **Validation**: Price > 0, valid pincodes
   - **Estimated Effort**: 2 days

### Priority 3 (Low Value / Complex)

7. **Bulk Route Upload** 🗺️
   - **Excel Columns**: routeName, waypoints[], estimatedDuration
   - **Idempotency**: routeName
   - **Validation**: Valid waypoints, duration > 0
   - **Estimated Effort**: 4-5 days (complex geospatial validation)

---

## 🚀 Implementation Roadmap

### Phase 1: Extract Generic Framework (1 week)
- [ ] Refactor OrderBulkUpload to use generic components
- [ ] Create abstract base classes:
  - `AbstractBulkUploadService<T, E>`
  - `AbstractExcelParser<T>`
  - `AbstractIdempotencyService<T>`
- [ ] Update database schema with `entity_type` column
- [ ] Migrate existing Order bulk upload to new framework
- [ ] Add unit tests for generic components

### Phase 2: Implement Pickup Bulk Upload (1 week)
- [ ] Define Pickup Excel schema (15 columns)
- [ ] Implement PickupBulkUploadService extending AbstractBulkUploadService
- [ ] Implement PickupExcelParser
- [ ] Add Pickup-specific validators
- [ ] Frontend: Pickup bulk upload UI
- [ ] Integration tests

### Phase 3: Implement Customer Bulk Upload (3 days)
- [ ] Define Customer Excel schema (10 columns)
- [ ] Implement CustomerBulkUploadService
- [ ] Add email uniqueness validator
- [ ] Frontend: Customer bulk upload UI

### Phase 4: Advanced Features (2 weeks)
- [ ] Async processing for large files (>1000 rows)
- [ ] Real-time progress updates (SSE/WebSocket)
- [ ] Bulk update operations (not just create)
- [ ] Rollback support for failed batches
- [ ] Export failed rows to Excel for correction

---

## 🎨 Frontend Component Library

### Reusable Angular Components

1. **`BulkUploadComponent` (Generic)**
   ```typescript
   @Input() entityType: 'order' | 'pickup' | 'customer';
   @Input() uploadEndpoint: string;
   @Input() templateEndpoint: string;
   @Output() uploadComplete = new EventEmitter<BulkUploadResponse>();
   ```

2. **`BatchListComponent` (Generic)**
   ```typescript
   @Input() entityType: string;
   @Input() batchesEndpoint: string;
   ```

3. **`RowOutcomeTableComponent` (Generic)**
   ```typescript
   @Input() rows: RowOutcomeDto[];
   @Input() displayColumns: string[];
   ```

---

## 📊 Metrics & Monitoring

### Standard Metrics (per entity type)

1. **Upload Metrics**
   - `bulk_upload_files_total{entity_type="order"}`
   - `bulk_upload_rows_total{entity_type="order", status="created|failed|skipped"}`
   - `bulk_upload_duration_seconds{entity_type="order"}`

2. **Error Metrics**
   - `bulk_upload_validation_errors_total{entity_type="order", error_code="MISSING_PINCODE"}`
   - `bulk_upload_duplicate_rows_total{entity_type="order", basis="CLIENT_REFERENCE|HASH"}`

3. **Retention Metrics**
   - `bulk_upload_rows_deleted_total{entity_type="order"}`
   - `bulk_upload_batches_deleted_total{entity_type="order"}`

---

## 🔒 Security Considerations

### Authentication & Authorization

```java
// Generic authorization check
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATIONS') or " +
              "hasPermission(#entityType, 'BULK_UPLOAD')")
public BulkUploadResponseDto processBulkUpload(
    String entityType, 
    MultipartFile file
) { ... }
```

### Role-Based Access Control

| Entity Type | Required Roles |
|------------|----------------|
| ORDER | OPERATIONS, SUPERVISOR, ADMIN |
| PICKUP | OPERATIONS, SUPERVISOR, ADMIN |
| CUSTOMER | ADMIN, SALES_MANAGER |
| VEHICLE | ADMIN, FLEET_MANAGER |
| DRIVER | ADMIN, HR_MANAGER |
| PRICE | ADMIN, FINANCE_MANAGER |

---

## 🧪 Testing Strategy

### Test Pyramid (per entity type)

1. **Unit Tests** (70%)
   - Parser: Header validation, type conversion
   - Idempotency: Hash computation, duplicate detection
   - Validators: Each validation rule

2. **Integration Tests** (20%)
   - Service: End-to-end flow with TestContainers
   - Repository: Custom queries
   - Controller: API contracts

3. **E2E Tests** (10%)
   - Frontend: File upload flow
   - Real Excel files with various scenarios

### Test Data Generation

```java
// Reusable Excel test fixture generator
public class ExcelTestFixtureGenerator<T> {
    public byte[] generateExcel(
        List<String> headers, 
        List<T> rows,
        Function<T, Object[]> rowMapper
    ) { ... }
}
```

---

## 📝 Documentation Template

### For Each New Bulk Upload Feature

1. **Feature Spec** (in `specs/NNN-entity-bulk-upload/`)
   - Excel schema (columns + validation rules)
   - Idempotency strategy
   - Business rules
   - Edge cases

2. **Implementation Plan**
   - Database migrations
   - Service layer changes
   - Frontend components
   - Test scenarios

3. **Test Guide**
   - Sample Excel files
   - cURL examples
   - Verification SQL queries

4. **User Guide**
   - Template download instructions
   - Field descriptions
   - Common errors & solutions

---

## 🎯 Success Metrics

### Target Performance (per entity type)

| File Size | Rows | Max Time | Success Rate |
|-----------|------|----------|--------------|
| < 100KB | 10 | < 500ms | 99.9% |
| ~ 1MB | 100 | < 2s | 99.5% |
| ~ 5MB | 500 | < 10s | 99.0% |
| ~ 10MB | 1000 | < 30s | 98.5% |

### Quality Gates

- ✅ Zero data loss (all rows tracked)
- ✅ No duplicate creations (100% idempotency)
- ✅ < 1% false positive validation errors
- ✅ 95% user satisfaction (based on retry rate)

---

## 🔮 Future Enhancements

### Advanced Features (Phase 5+)

1. **Bulk Update Support**
   - Update existing entities via Excel
   - Match by ID or unique identifier
   - Partial updates (only changed fields)

2. **Data Transformation Rules**
   - Auto-correct common errors (e.g., pincode padding)
   - Data enrichment (fetch city from pincode)
   - Currency/unit conversions

3. **Multi-Sheet Support**
   - Upload related entities in one file
   - Sheet 1: Orders, Sheet 2: Line Items
   - Foreign key resolution

4. **Scheduled Uploads**
   - SFTP/S3 bucket monitoring
   - Auto-process files at specific times
   - Email notifications on completion

5. **AI-Powered Validation**
   - Learn from past corrections
   - Suggest fixes for validation errors
   - Anomaly detection (unusual patterns)

---

## 📚 References

1. **Order Bulk Upload Implementation**
   - Spec: `specs/001-bulk-order-upload/`
   - Code: `backend/src/main/java/com/fleetops/bulkupload/`
   - Docs: `docs/completed/BULK-UPLOAD-PHASE1-COMPLETE.md`

2. **Best Practices**
   - [Apache POI Documentation](https://poi.apache.org/)
   - [Spring Batch for Large Files](https://spring.io/projects/spring-batch)
   - [Idempotency Patterns](https://en.wikipedia.org/wiki/Idempotence)

---

**Version**: 1.0  
**Last Updated**: October 4, 2025  
**Status**: ✅ Framework Design Complete  
**Next Step**: Extract generic components from Order bulk upload
