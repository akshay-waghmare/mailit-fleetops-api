# 📋 Bulk Upload Implementation Checklist

## Quick Reference for Adding New Bulk Upload Features

Use this checklist when implementing bulk upload for a new entity type (Pickup, Customer, Shipment, etc.)

---

## 📝 Pre-Implementation (Planning)

- [ ] **Define Excel Schema**
  - List all required columns
  - List optional columns
  - Define validation rules per column
  - Document examples for each column

- [ ] **Choose Idempotency Strategy**
  - Primary: User-provided reference field? (e.g., clientReference)
  - Fallback: Which fields to hash? (e.g., name + address + date)
  - Document expected collision rate

- [ ] **Identify Business Rules**
  - Cross-field validations
  - Database constraints to check
  - External dependencies (APIs, lookups)

- [ ] **Estimate Scale**
  - Expected file size (KB/MB)
  - Expected row count per upload
  - Frequency of uploads per day

---

## 🗄️ Database Layer

- [ ] **Update Generic Tables** (if using shared schema)
  ```sql
  -- Add entity_type enum value
  ALTER TYPE entity_type_enum ADD VALUE 'YOUR_ENTITY';
  ```

- [ ] **OR Create Entity-Specific Tables** (if separate schema)
  ```sql
  -- Create your_entity_bulk_upload_batch
  -- Create your_entity_bulk_upload_row
  ```

- [ ] **Add Indexes**
  - [ ] On `batch_id`
  - [ ] On `idempotency_key` (UNIQUE)
  - [ ] On `entity_id` (if linking to main entity)
  - [ ] On `created_at` (for cleanup queries)

- [ ] **Flyway Migration**
  - [ ] Create `VXX__create_[entity]_bulk_upload_tables.sql`
  - [ ] Test migration locally
  - [ ] Document rollback steps

---

## 🏗️ Backend Implementation

### 1. DTOs

- [ ] **Create DTOs** in `dto/` package
  - [ ] `Create[Entity]Dto` - Request DTO (matches Excel columns)
  - [ ] `BulkUpload[Entity]ResponseDto` - Response DTO
  - [ ] `[Entity]RowOutcomeDto` - Per-row result
  - [ ] Reuse `ValidationErrorDto` (generic)

- [ ] **Add Validation Annotations**
  - [ ] `@NotNull`, `@NotBlank` on required fields
  - [ ] `@Pattern` for formats (phone, email, pincode)
  - [ ] `@Min`, `@Max` for numeric ranges
  - [ ] Custom validators if needed

### 2. Entities

- [ ] **Create JPA Entities** in `entity/` package
  - [ ] `BulkUpload[Entity]Batch` entity
  - [ ] `BulkUpload[Entity]Row` entity
  - [ ] Enums: `[Entity]BulkUploadStatus`, `[Entity]RowStatus`

- [ ] **Define Relationships**
  - [ ] `@OneToMany` from Batch → Rows
  - [ ] `@ManyToOne` from Row → Main Entity (nullable)
  - [ ] Cascade and orphan removal rules

### 3. Repositories

- [ ] **Create Repositories** in `repository/` package
  - [ ] `BulkUpload[Entity]BatchRepository`
    - [ ] `findByBatchId(String batchId)`
    - [ ] `deleteEmptyBatchesCreatedBefore(LocalDateTime cutoff)`
  - [ ] `BulkUpload[Entity]RowRepository`
    - [ ] `findByIdempotencyKey(String key)`
    - [ ] `findByBatch_IdOrderByRowIndexAsc(Long batchId)`
    - [ ] `deleteByCreatedAtBefore(LocalDateTime cutoff)`

### 4. Parser

- [ ] **Implement Excel Parser** in `parser/` package
  - [ ] `[Entity]ExcelParserService` class
  - [ ] `parse(InputStream excel)` → `List<Create[Entity]Dto>`
  - [ ] Header validation (exact names)
  - [ ] Type conversions (String → Date, String → BigDecimal)
  - [ ] Row limit check (default 500)

- [ ] **Create Custom Exceptions**
  - [ ] `[Entity]ExcelParseException`
  - [ ] `Missing[Entity]HeadersException`
  - [ ] Reuse generic exceptions where possible

- [ ] **Implement Template Generator**
  - [ ] `generateTemplate()` → `byte[]`
  - [ ] Sheet 1: Headers + 1-2 example rows
  - [ ] Sheet 2: Notes (field descriptions, validation rules)

### 5. Idempotency

- [ ] **Implement Idempotency Service** in `service/` package
  - [ ] `[Entity]IdempotencyService` class
  - [ ] `computeIdempotencyKey(Create[Entity]Dto)` → `String`
  - [ ] `getIdempotencyBasis(Create[Entity]Dto)` → `IdempotencyBasis`
  - [ ] `isDuplicate(String key)` → `boolean`

- [ ] **Define Canonical Hash Fields**
  - [ ] Document which fields are included in hash
  - [ ] Test hash stability (same input → same hash)

### 6. Validation

- [ ] **Implement Validators** in `validation/` package
  - [ ] `[Entity]StructuralValidator` - Required fields
  - [ ] `[Entity]FormatValidator` - Data formats
  - [ ] `[Entity]BusinessRulesValidator` - Domain rules
  - [ ] `[Entity]DuplicationValidator` - In-file duplicates

- [ ] **Test Each Validator**
  - [ ] Unit test with valid input → empty errors
  - [ ] Unit test with invalid input → correct error codes

### 7. Service Layer

- [ ] **Implement Bulk Upload Service** in `service/` package
  - [ ] `BulkUpload[Entity]Service` interface
  - [ ] `BulkUpload[Entity]ServiceImpl` class
  - [ ] `processBulkUpload(MultipartFile, Long userId)` method
  - [ ] `listBatches(Pageable, Long userId)` method
  - [ ] `generateTemplate()` method

- [ ] **Orchestration Logic**
  - [ ] File validation (size, type)
  - [ ] Checksum computation
  - [ ] Parse Excel
  - [ ] Create Batch record (status=PROCESSING)
  - [ ] Loop through rows:
    - [ ] Run validators
    - [ ] Check idempotency
    - [ ] Create main entity (if not duplicate)
    - [ ] Create Row record
  - [ ] Update Batch (status=COMPLETED, counts)
  - [ ] Return response DTO

- [ ] **Transaction Boundaries**
  - [ ] `@Transactional` on processBulkUpload
  - [ ] Consider nested transactions for large files

### 8. Controller

- [ ] **Implement REST Controller** in `controller/` package
  - [ ] `BulkUpload[Entity]Controller` class
  - [ ] `@PostMapping("/api/v1/bulk/[entities]")` - Upload endpoint
  - [ ] `@GetMapping("/api/v1/bulk/[entities]/template")` - Template download
  - [ ] `@GetMapping("/api/v1/bulk/[entities]/batches")` - List batches

- [ ] **Add Exception Handlers**
  - [ ] `@ExceptionHandler` for ExcelParseException → 400
  - [ ] `@ExceptionHandler` for FileSizeException → 413
  - [ ] `@ExceptionHandler` for validation errors → 400

- [ ] **Add Security**
  - [ ] `@PreAuthorize` with required roles
  - [ ] Capture authenticated user ID (not hardcoded)

### 9. Configuration

- [ ] **Add Properties** in `application.yml`
  ```yaml
  bulk:
    upload:
      [entity]:
        enabled: true
        max-file-size: 2MB
        max-rows: 500
        retention:
          rows:
            days: 30
          batches:
            days: 180
  ```

- [ ] **Add Logging**
  - [ ] INFO: Upload started, completed (with counts)
  - [ ] WARN: Validation failures (with row index)
  - [ ] ERROR: Unexpected failures

- [ ] **Add Metrics** (Micrometer)
  - [ ] Counter: uploads_total, rows_created, rows_failed
  - [ ] Histogram: processing_duration_ms
  - [ ] Gauge: active_uploads

### 10. Retention Job

- [ ] **Implement Cleanup Job** in `cleanup/` package
  - [ ] `BulkUpload[Entity]RetentionJob` class
  - [ ] Extends `QuartzJobBean`
  - [ ] Delete rows older than N days
  - [ ] Delete empty batches older than M days
  - [ ] Log deletion counts

- [ ] **Configure Quartz**
  - [ ] `QuartzConfig` - JobDetail + Trigger
  - [ ] Cron expression (e.g., daily at 2 AM)
  - [ ] `@DisallowConcurrentExecution`

---

## 🧪 Testing

### Unit Tests

- [ ] **Parser Tests**
  - [ ] Parse valid Excel → correct DTOs
  - [ ] Missing headers → exception
  - [ ] Invalid data types → exception
  - [ ] Row limit exceeded → exception

- [ ] **Idempotency Tests**
  - [ ] CLIENT_REFERENCE strategy
  - [ ] HASH fallback strategy
  - [ ] Hash stability (deterministic)
  - [ ] Duplicate detection

- [ ] **Validator Tests**
  - [ ] Each validation rule (pass + fail cases)
  - [ ] Error codes match spec

- [ ] **Service Tests** (with mocks)
  - [ ] Happy path (all rows succeed)
  - [ ] Partial success (some rows fail)
  - [ ] Duplicate detection (skip rows)
  - [ ] Rollback on critical error

### Integration Tests

- [ ] **Repository Tests** (with TestContainers)
  - [ ] CRUD operations
  - [ ] Custom queries (findByBatchId, etc.)
  - [ ] Cascade deletes

- [ ] **Service Integration Tests** (with TestContainers)
  - [ ] End-to-end upload flow
  - [ ] Database state verification
  - [ ] File checksum duplicate detection

- [ ] **Controller Tests** (with MockMvc)
  - [ ] POST /bulk/[entities] → 200 with response
  - [ ] POST with invalid file → 400
  - [ ] GET /template → 200 with Excel file
  - [ ] GET /batches → 200 with pagination

### Contract Tests

- [ ] **API Contract Tests**
  - [ ] Request/response match OpenAPI spec
  - [ ] Error responses match spec
  - [ ] Use JSON schema validator

---

## 🎨 Frontend Implementation

### Angular Components

- [ ] **Create Upload Component**
  - [ ] `[entity]-bulk-upload.component.ts`
  - [ ] File picker with drag-and-drop
  - [ ] Progress bar during upload
  - [ ] Success/error summary
  - [ ] Download template button

- [ ] **Create Batch List Component**
  - [ ] `[entity]-bulk-upload-list.component.ts`
  - [ ] Material table with pagination
  - [ ] Filter by date, status, uploader
  - [ ] View row details (expand row)

- [ ] **Create Row Outcome Component**
  - [ ] `[entity]-bulk-upload-rows.component.ts`
  - [ ] Display validation errors
  - [ ] Export failed rows to Excel
  - [ ] Retry failed rows

### Services

- [ ] **Create Angular Service**
  - [ ] `[entity]-bulk-upload.service.ts`
  - [ ] `uploadFile(file: File)` → Observable
  - [ ] `downloadTemplate()` → Observable
  - [ ] `listBatches(page, size)` → Observable
  - [ ] `getRowDetails(batchId)` → Observable

### Routing

- [ ] **Add Routes**
  ```typescript
  {
    path: '[entities]/bulk-upload',
    component: [Entity]BulkUploadComponent
  },
  {
    path: '[entities]/bulk-upload/:batchId',
    component: [Entity]BulkUploadRowsComponent
  }
  ```

### Navigation

- [ ] **Update Sidebar**
  - [ ] Add menu item for bulk upload
  - [ ] Icon + label
  - [ ] Role-based visibility

---

## 📚 Documentation

- [ ] **Create Implementation Plan**
  - [ ] File: `docs/implementation/[ENTITY]-BULK-UPLOAD-PLAN.md`
  - [ ] Excel schema
  - [ ] Idempotency strategy
  - [ ] Validation rules
  - [ ] API contracts

- [ ] **Create Test Guide**
  - [ ] File: `docs/completed/[ENTITY]-BULK-UPLOAD-TEST-GUIDE.md`
  - [ ] Sample Excel files
  - [ ] cURL examples
  - [ ] Verification SQL queries
  - [ ] Common issues & solutions

- [ ] **Create User Guide**
  - [ ] Template download instructions
  - [ ] Field descriptions
  - [ ] Example scenarios
  - [ ] Error code reference

- [ ] **Update API Documentation**
  - [ ] Add OpenAPI spec
  - [ ] Add Postman collection
  - [ ] Add sample requests/responses

---

## 🚀 Deployment

- [ ] **Database Migrations**
  - [ ] Test on development environment
  - [ ] Test on staging environment
  - [ ] Prepare rollback script
  - [ ] Schedule production deployment

- [ ] **Feature Flag**
  - [ ] Add configuration property
  - [ ] Default to `false` initially
  - [ ] Enable for beta users first
  - [ ] Monitor metrics before full rollout

- [ ] **Monitoring**
  - [ ] Set up alerts (error rate > 5%)
  - [ ] Dashboard with key metrics
  - [ ] Log aggregation (Elasticsearch/Splunk)

- [ ] **Performance Testing**
  - [ ] Load test with 1000 rows
  - [ ] Stress test with 5000 rows
  - [ ] Verify p95 latency < 15s

---

## ✅ Go-Live Checklist

- [ ] **All tests passing** (unit + integration + contract)
- [ ] **Code review completed** (2+ approvals)
- [ ] **Documentation complete** (API + user guide)
- [ ] **Staging tested** (manual + automated)
- [ ] **Rollback plan ready**
- [ ] **Monitoring configured**
- [ ] **Feature flag configured**
- [ ] **User training completed** (if needed)
- [ ] **Support team notified**
- [ ] **Success metrics defined**

---

## 📊 Post-Launch Checklist

### Week 1
- [ ] Monitor error rates daily
- [ ] Review user feedback
- [ ] Fix critical bugs (P0/P1)
- [ ] Adjust file size limits if needed

### Month 1
- [ ] Analyze usage metrics
- [ ] Identify common validation errors
- [ ] Optimize slow queries
- [ ] Plan Phase 2 enhancements

### Quarter 1
- [ ] Review retention policy effectiveness
- [ ] Consider bulk update support
- [ ] Evaluate async processing need
- [ ] Plan next entity type

---

**Version**: 1.0  
**Last Updated**: October 4, 2025  
**Status**: ✅ Ready for Use  
**Next Entity**: Pickup Bulk Upload (Priority 1)
