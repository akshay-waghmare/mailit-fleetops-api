# Tasks: Bulk Order Upload (Excel)

**Feature**: 001-bulk-order-upload  
**Date**: 2025-10-04  
**Input**: Design documents from `specs/001-bulk-order-upload/`  
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Summary
Total Tasks: 42 | Parallel Tasks: 28 | Sequential Tasks: 14  
Estimated Duration: ~8-12 hours (with parallelization)

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- **⚠️ Tests MUST be written and MUST FAIL before implementation**

---

## Phase A: Foundation & Setup (6 tasks)

### A.1 Project Setup
- [ ] **T001** Add Apache POI 5.x SXSSF dependency to `backend/build.gradle`
  - Add: `implementation 'org.apache.poi:poi-ooxml:5.2.5'`
  - Add: `implementation 'org.apache.poi:poi-ooxml-schemas:4.1.2'`
  - Verify: Run `./gradlew dependencies` to confirm resolution

- [ ] **T002** Add Quartz scheduler dependency to `backend/build.gradle`
  - Add: `implementation 'org.springframework.boot:spring-boot-starter-quartz'`
  - Verify: Check Spring Boot auto-configuration picks up Quartz

- [ ] **T003** [P] Create package structure in `backend/src/main/java/com/fleetops/bulkupload/`
  - Create: `dto/`, `entity/`, `repository/`, `service/`, `controller/`, `validation/`, `cleanup/`, `parser/`
  - Create: `backend/src/test/java/com/fleetops/bulkupload/` with same subpackages

### A.2 Database Migrations (Parallel)
- [ ] **T004** [P] Flyway migration V5 in `backend/src/main/resources/db/migration/V5__create_bulk_upload_batch.sql`
  - Create `bulk_upload_batch` table with 13 fields per data-model.md
  - Add indexes: `idx_bulk_upload_batch_batch_id`, `idx_bulk_upload_batch_uploader_user_id`, `idx_bulk_upload_batch_uploaded_at`, `idx_bulk_upload_batch_created_at`
  - Add CHECK constraint: `total_rows = created_count + failed_count + skipped_duplicate_count` (update counts atomically at end of processing to avoid transient violations)
  - Add comment: `COMMENT ON TABLE bulk_upload_batch IS 'Batch metadata for bulk uploads; retained 180 days'`

- [ ] **T005** [P] Flyway migration V6 in `backend/src/main/resources/db/migration/V6__create_bulk_upload_row.sql`
  - Create `bulk_upload_row` table with 10 fields per data-model.md
  - Add indexes: `idx_bulk_upload_row_batch_id`, `idx_bulk_upload_row_idempotency_key`, `idx_bulk_upload_row_order_id`, `idx_bulk_upload_row_created_at`
  - Add FK constraints: `fk_bulk_upload_row_batch_id` → `bulk_upload_batch(id)` ON DELETE CASCADE
  - Add FK constraint: `fk_bulk_upload_row_order_id` → `orders(id)` ON DELETE SET NULL (nullable)
  - Add comment: `COMMENT ON TABLE bulk_upload_row IS 'Per-row outcomes for bulk uploads; retained 30 days'`

- [ ] **T006** Run Flyway migrations locally and verify schema
  - Execute: `./gradlew flywayMigrate` or start Spring Boot app
  - Verify: Query `information_schema.tables` for `bulk_upload_batch` and `bulk_upload_row`
  - Verify: Check indexes exist via `\d+ bulk_upload_batch` in psql

---

## Phase B: Entities & Repositories (8 tasks - TDD: Tests First)

### B.1 Entity Tests (Parallel - MUST FAIL FIRST)
- [ ] **T007** [P] Entity test for BulkUploadBatch in `backend/src/test/java/com/fleetops/bulkupload/entity/BulkUploadBatchTest.java`
  - Test: Field constraints (batchId pattern `BU\d{8}\d{4}`, non-null fields)
  - Test: Count invariant `totalRows = created + failed + skipped`
  - Test: OneToMany → BulkUploadRow relationship
  - Test: Status enum transitions (PROCESSING → COMPLETED/FAILED)
  - **Run test → MUST FAIL (class doesn't exist)**

- [ ] **T008** [P] Entity test for BulkUploadRow in `backend/src/test/java/com/fleetops/bulkupload/entity/BulkUploadRowTest.java`
  - Test: ManyToOne → BulkUploadBatch relationship
  - Test: ManyToOne → Order relationship (nullable)
  - Test: JSONB errorMessages deserialization
  - Test: idempotencyKey max 300 chars
  - **Run test → MUST FAIL (class doesn't exist)**

### B.2 Entity Implementation (Parallel - Make Tests Pass)
- [ ] **T009** [P] Create BulkUploadBatch entity in `backend/src/main/java/com/fleetops/bulkupload/entity/BulkUploadBatch.java`
  - Annotations: `@Entity`, `@Table(name = "bulk_upload_batch")`
  - Fields: 13 fields per data-model.md with `@Column` annotations
  - Relationship: `@OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)`
  - Enum: Create `BulkUploadStatus` enum (PROCESSING, COMPLETED, FAILED)
  - **Run T007 → MUST PASS**

- [ ] **T010** [P] Create BulkUploadRow entity in `backend/src/main/java/com/fleetops/bulkupload/entity/BulkUploadRow.java`
  - Annotations: `@Entity`, `@Table(name = "bulk_upload_row")`
  - Fields: 10 fields per data-model.md with `@Column` annotations
  - Relationships: `@ManyToOne` → BulkUploadBatch, `@ManyToOne` → Order (nullable)
  - JSONB: Use `@Type(JsonBinaryType.class)` for errorMessages (Hibernate Types library)
  - Enums: Create `RowStatus` (CREATED, FAILED_VALIDATION, SKIPPED_DUPLICATE), `IdempotencyBasis` (CLIENT_REFERENCE, HASH)
  - **Run T008 → MUST PASS**

### B.3 Repository Tests (Parallel - MUST FAIL FIRST)
- [ ] **T011** [P] Repository test for BulkUploadBatchRepository in `backend/src/test/java/com/fleetops/bulkupload/repository/BulkUploadBatchRepositoryTest.java`
  - Test: `findByBatchId(String batchId)` returns Optional<BulkUploadBatch>
  - Test: `deleteEmptyBatchesCreatedBefore(LocalDateTime cutoff)` deletes only empty batches
  - Use `@DataJpaTest` with TestContainers PostgreSQL
  - **Run test → MUST FAIL (interface doesn't exist)**

- [ ] **T012** [P] Repository test for BulkUploadRowRepository in `backend/src/test/java/com/fleetops/bulkupload/repository/BulkUploadRowRepositoryTest.java`
  - Test: `findByBatch_IdOrderByRowIndexAsc(Long batchId)` returns sorted list
  - Test: `deleteByCreatedAtBefore(LocalDateTime cutoff)` deletes old rows
  - Test: `findByIdempotencyKey(String key)` returns Optional<BulkUploadRow>
  - Use `@DataJpaTest` with TestContainers PostgreSQL
  - **Run test → MUST FAIL (interface doesn't exist)**

### B.4 Repository Implementation (Parallel - Make Tests Pass)
- [ ] **T013** [P] Create BulkUploadBatchRepository in `backend/src/main/java/com/fleetops/bulkupload/repository/BulkUploadBatchRepository.java`
  - Extend: `JpaRepository<BulkUploadBatch, Long>`
  - Method: `Optional<BulkUploadBatch> findByBatchId(String batchId);`
  - Method: `@Modifying @Query("DELETE FROM BulkUploadBatch b WHERE b.createdAt < :cutoff AND NOT EXISTS (SELECT 1 FROM BulkUploadRow r WHERE r.batch.id = b.id)") int deleteEmptyBatchesCreatedBefore(@Param("cutoff") LocalDateTime cutoff);`
  - Note: "Empty" means no row records exist (not totalRows=0, since rows may be purged independently by retention)
  - **Run T011 → MUST PASS**

- [ ] **T014** [P] Create BulkUploadRowRepository in `backend/src/main/java/com/fleetops/bulkupload/repository/BulkUploadRowRepository.java`
  - Extend: `JpaRepository<BulkUploadRow, Long>`
  - Method: `List<BulkUploadRow> findByBatch_IdOrderByRowIndexAsc(Long batchId);` (explicit batch.id property path for clarity)
  - Method: `@Modifying @Query("DELETE FROM BulkUploadRow r WHERE r.createdAt < :cutoff") int deleteByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);`
  - Method: `Optional<BulkUploadRow> findByIdempotencyKey(String idempotencyKey);`
  - **Run T012 → MUST PASS**

---

## Phase C: DTOs & Mappers (4 tasks - Parallel)

### C.1 DTOs (Parallel)
- [ ] **T015** [P] Create CreateOrderDto in `backend/src/main/java/com/fleetops/bulkupload/dto/CreateOrderDto.java`
  - Fields: 19 fields matching Excel columns per spec (clientReference, clientId, senderName, senderAddress, receiverName, receiverPincode, etc.)
  - Validation: `@NotNull`, `@NotBlank`, `@Pattern` for pincode, `@Min` for itemCount/totalWeight, `@DecimalMax` for declaredValue
  - Constructor: All-args for MapStruct

- [ ] **T016** [P] Create BulkUploadResponseDto in `backend/src/main/java/com/fleetops/bulkupload/dto/BulkUploadResponseDto.java`
  - Fields: batchId, totalRows, createdCount, failedCount, skippedDuplicateCount, processingDurationMs, List<RowOutcomeDto> rows
  - Match OpenAPI schema in contracts/bulk-upload-api.yaml

- [ ] **T017** [P] Create RowOutcomeDto in `backend/src/main/java/com/fleetops/bulkupload/dto/RowOutcomeDto.java`
  - Fields: rowIndex, status (String enum), idempotencyBasis (String enum), orderId (nullable), List<ValidationErrorDto> errorMessages
  - Match OpenAPI schema

- [ ] **T018** [P] Create ValidationErrorDto in `backend/src/main/java/com/fleetops/bulkupload/dto/ValidationErrorDto.java`
  - Fields: code, field, message
  - Match OpenAPI schema

---

## Phase D: Excel Parser & Idempotency (6 tasks - TDD)

### D.1 Parser Tests (MUST FAIL FIRST)
- [ ] **T019** [P] ExcelParserService test in `backend/src/test/java/com/fleetops/bulkupload/parser/ExcelParserServiceTest.java`
  - Test: Parse valid 50-row Excel → List<CreateOrderDto>
  - Test: Reject file with missing headers → throw MissingHeadersException
  - Test: Reject file with >500 rows → throw RowLimitExceededException
  - Test: Handle malformed Excel → throw InvalidFileFormatException
  - Use Apache POI to create test fixtures (XSSFWorkbook)
  - **Run test → MUST FAIL (service doesn't exist)**

- [ ] **T020** [P] IdempotencyService test in `backend/src/test/java/com/fleetops/bulkupload/service/IdempotencyServiceTest.java`
  - Test: computeHash(CreateOrderDto) with clientReference → returns clientReference
  - Test: computeHash(CreateOrderDto) without clientReference → returns SHA-256 hash of canonical fields
  - Test: Same DTO fields → same hash (deterministic)
  - Test: checkDuplicate(String key) → returns true if key exists in bulk_upload_rows
  - Use `@DataJpaTest` for repository integration
  - **Run test → MUST FAIL (service doesn't exist)**

### D.2 Parser Implementation (Sequential - depends on DTOs)
- [ ] **T021** Create ExcelParserService in `backend/src/main/java/com/fleetops/bulkupload/parser/ExcelParserService.java`
  - Method: `List<CreateOrderDto> parse(InputStream excelStream) throws ExcelParseException`
  - Use: Apache POI **XSSFWorkbook** (not SXSSF - SXSSF is for writing; for reading ≤2MB/≤500 rows, XSSF is stable and sufficient)
  - Logic: Read header row, validate required columns, iterate data rows, map to DTOs
  - Error handling: Wrap POI exceptions in custom ExcelParseException
  - **Run T019 → MUST PASS**

- [ ] **T022** Create custom exceptions in `backend/src/main/java/com/fleetops/bulkupload/parser/`
  - Create: `ExcelParseException`, `MissingHeadersException`, `RowLimitExceededException`, `InvalidFileFormatException`
  - All extend `RuntimeException` with message + cause constructors

- [ ] **T023** Create IdempotencyService in `backend/src/main/java/com/fleetops/bulkupload/service/IdempotencyService.java`
  - Method: `String computeIdempotencyKey(CreateOrderDto dto)` - returns clientReference if present, else SHA-256 hash
  - Method: `IdempotencyBasis getIdempotencyBasis(CreateOrderDto dto)` - returns CLIENT_REFERENCE or HASH enum
  - Method: `boolean isDuplicate(String key)` - checks bulk_upload_rows via repository
  - Hash: Use MessageDigest SHA-256 over canonical concatenation (research.md pattern)
  - **Run T020 → MUST PASS**

- [ ] **T024** Create SHA-256 utility in `backend/src/main/java/com/fleetops/bulkupload/util/HashUtil.java`
  - Method: `String computeSHA256(String input)` - returns hex-encoded hash
  - Use: `MessageDigest.getInstance("SHA-256")`
  - Test: Unit test with known inputs/outputs

---

## Phase E: Validation Layers (5 tasks - Sequential, depends on D)

### E.1 Validation Tests (MUST FAIL FIRST)
- [ ] **T025** Validation tests in `backend/src/test/java/com/fleetops/bulkupload/validation/ValidatorTest.java`
  - Test: StructuralValidator rejects missing receiverPincode → MISSING_RECEIVER_PINCODE
  - Test: FormatValidator rejects invalid serviceType enum → INVALID_SERVICE_TYPE
  - Test: BusinessRulesValidator rejects declaredValue > 100000 → DECLARED_VALUE_EXCEEDS_LIMIT
  - Test: BusinessRulesValidator rejects itemCount < 1 → INVALID_ITEM_COUNT
  - Test: DuplicationValidator detects in-file duplicates (case-insensitive receiverName)
  - **Run test → MUST FAIL (validators don't exist)**

### E.2 Validation Implementation (Sequential)
- [ ] **T026** Create StructuralValidator in `backend/src/main/java/com/fleetops/bulkupload/validation/StructuralValidator.java`
  - Method: `List<ValidationErrorDto> validate(CreateOrderDto dto)`
  - Checks: All required fields non-null (senderName, receiverName, receiverPincode, serviceType, itemCount, totalWeight)
  - Return: List of errors with codes (MISSING_SENDER_NAME, MISSING_RECEIVER_PINCODE, etc.)

- [ ] **T027** Create FormatValidator in `backend/src/main/java/com/fleetops/bulkupload/validation/FormatValidator.java`
  - Method: `List<ValidationErrorDto> validate(CreateOrderDto dto)`
  - Checks: receiverPincode length 6, serviceType in [express, standard, economy], totalWeight > 0
  - Return: List of errors with codes (INVALID_PINCODE_LENGTH, INVALID_SERVICE_TYPE, INVALID_WEIGHT)

- [ ] **T028** Create BusinessRulesValidator in `backend/src/main/java/com/fleetops/bulkupload/validation/BusinessRulesValidator.java`
  - Method: `List<ValidationErrorDto> validate(CreateOrderDto dto)`
  - Checks: itemCount >= 1, declaredValue <= configurable max (default 100000), COD amount validation
  - Configuration: `@Value("${bulk.upload.declaredValue.max:100000}")` for threshold
  - Return: List of errors with codes (INVALID_ITEM_COUNT, DECLARED_VALUE_EXCEEDS_LIMIT)

- [ ] **T029** Create DuplicationValidator in `backend/src/main/java/com/fleetops/bulkupload/validation/DuplicationValidator.java`
  - Method: `List<ValidationErrorDto> validateBatch(List<CreateOrderDto> dtos)`
  - Logic: Normalize receiverName and receiverCity (trim, collapse whitespace, lowercase), detect duplicates within batch
  - Return: List of errors with codes (DUPLICATE_IN_FILE) including row indexes

---

## Phase F: Core Service & Controller (7 tasks - TDD)

### F.1 Service Tests (MUST FAIL FIRST)
- [ ] **T030** BulkUploadService test in `backend/src/test/java/com/fleetops/bulkupload/service/BulkUploadServiceTest.java`
  - Test: processBulkUpload(MultipartFile) with 50 valid rows → BulkUploadResponseDto with 50 CREATED
  - Test: processBulkUpload with duplicate clientReference → SKIPPED_DUPLICATE
  - Test: processBulkUpload with invalid row → FAILED_VALIDATION with error codes
  - Test: processBulkUpload with mixed results → correct counts
  - Mock: ExcelParserService, IdempotencyService, Validators, OrderService
  - **Run test → MUST FAIL (service doesn't exist)**

### F.2 Service Implementation (Sequential)
- [ ] **T031** Create BulkUploadService interface in `backend/src/main/java/com/fleetops/bulkupload/service/BulkUploadService.java`
  - Method: `BulkUploadResponseDto processBulkUpload(MultipartFile file, Long uploaderUserId)`
  - Method: `Page<BatchSummaryDto> listBatches(Pageable pageable, Long uploaderUserId)`
  - Method: `byte[] generateTemplate()`

- [ ] **T032** Create BulkUploadServiceImpl in `backend/src/main/java/com/fleetops/bulkupload/service/BulkUploadServiceImpl.java`
  - Inject: ExcelParserService, IdempotencyService, all Validators, BulkUploadBatchRepository, BulkUploadRowRepository, OrderService
  - Logic: 
    1. Validate file size (2 MB) and type (.xlsx)
    2. Compute file checksum (SHA-256)
    3. Parse Excel → List<CreateOrderDto>
    4. Validate row count (max 500)
    5. Create BulkUploadBatch with status=PROCESSING
    6. For each row:
       - Run validators (structural → format → business rules)
       - If valid: check idempotency, create order if not duplicate
       - Create BulkUploadRow with outcome
    7. Update batch counts and status=COMPLETED
    8. Return BulkUploadResponseDto
  - Transaction: `@Transactional` on processBulkUpload
  - **Run T030 → MUST PASS**

- [ ] **T033** Implement listBatches in BulkUploadServiceImpl
  - Logic: Query BulkUploadBatchRepository with pagination, optionally filter by uploaderUserId
  - Return: Page<BatchSummaryDto> mapped from entities

- [ ] **T034** Implement generateTemplate in BulkUploadServiceImpl
  - Logic: Use Apache POI to create XSSFWorkbook with:
    - Sheet 1 "Orders": Headers row + 1 example row
    - Sheet 2 "Notes": Idempotency guidance, field descriptions, validation rules
  - Return: byte[] of workbook

### F.3 Controller Tests (MUST FAIL FIRST)
- [ ] **T035** Controller test in `backend/src/test/java/com/fleetops/bulkupload/controller/BulkUploadControllerTest.java`
  - Test: POST /api/v1/bulk-upload with valid file → 200 with BulkUploadResponseDto
  - Test: POST with file >2MB → 413 Payload Too Large
  - Test: POST with missing headers → 400 with error message
  - Test: POST with feature disabled → 403 Forbidden (feature flag only, no auth check)
  - Test: GET /api/v1/bulk-upload/template → 200 with Excel file
  - Test: GET /api/v1/bulk-upload/batches?page=0&size=20 → 200 with Page<BatchSummaryDto>
  - Use: `@WebMvcTest(BulkUploadController.class)` with MockMvc
  - Mock: BulkUploadService
  - **Run test → MUST FAIL (controller doesn't exist)**

### F.4 Controller Implementation (Sequential)
- [ ] **T036** Create BulkUploadController in `backend/src/main/java/com/fleetops/bulkupload/controller/BulkUploadController.java`
  - Annotation: `@RestController`, `@RequestMapping("/api/v1/bulk-upload")`, `@RequiredArgsConstructor`
  - Inject: BulkUploadService
  - Endpoints:
    1. POST /api/v1/bulk-upload (multipart/form-data, @RequestParam MultipartFile file)
       - Feature flag check: Read `@Value("${bulk.upload.enabled:true}")` and return 403 if disabled (don't use `@ConditionalOnProperty` on controller - keeps template/list endpoints available)
       - ⚠️ **Auth deferred**: Use hardcoded `uploaderUserId = 1L` for Phase 1 (User/Role not implemented yet; security is permitAll())
       - TODO: Add `@PreAuthorize("hasAnyRole('OPERATIONS', 'SUPERVISOR', 'ADMIN')")` when User/Role implemented
       - Call service.processBulkUpload(file, uploaderUserId)
       - Return ResponseEntity<BulkUploadResponseDto>
    2. GET /api/v1/bulk-upload/template
       - Call service.generateTemplate()
       - Return ResponseEntity with Content-Disposition header "attachment; filename=bulk_upload_template.xlsx"
    3. GET /api/v1/bulk-upload/batches (query params: page, size, uploaderUserId)
       - Call service.listBatches()
       - Return ResponseEntity<Page<BatchSummaryDto>>
  - Exception handling: `@ExceptionHandler` for ExcelParseException, FileSizeException
  - **Run T035 → MUST PASS**

---

## Phase G: Retention Cleanup Job (3 tasks - TDD)

### G.1 Job Tests (MUST FAIL FIRST)
- [ ] **T037** [P] RetentionJob test in `backend/src/test/java/com/fleetops/bulkupload/cleanup/BulkUploadRetentionJobTest.java`
  - Test: Job deletes rows older than 30 days
  - Test: Job deletes empty batches older than 180 days (where no row records exist)
  - Test: Job does NOT delete non-empty batches (batches with existing rows)
  - Test: Job is transactional (rollback on error)
  - Use: `@DataJpaTest` with TestContainers, simulate time travel by setting created_at in past
  - **Run test → MUST FAIL (job doesn't exist)**

### G.2 Job Implementation (Parallel)
- [ ] **T038** [P] Create BulkUploadRetentionJob in `backend/src/main/java/com/fleetops/bulkupload/cleanup/BulkUploadRetentionJob.java`
  - Extend: `QuartzJobBean`
  - Annotation: `@DisallowConcurrentExecution`, `@Component`
  - Inject: BulkUploadRowRepository, BulkUploadBatchRepository
  - Configuration: `@Value("${bulk.upload.retention.rows.days:30}")`, `@Value("${bulk.upload.retention.batches.days:180}")`
  - Logic:
    1. Calculate cutoffs: `rowCutoff = LocalDateTime.now().minusDays(rowRetentionDays)`, `batchCutoff = LocalDateTime.now().minusDays(batchRetentionDays)`
    2. Delete rows: `rowRepository.deleteByCreatedAtBefore(rowCutoff)`
    3. Delete empty batches: `batchRepository.deleteEmptyBatchesCreatedBefore(batchCutoff)` (uses NOT EXISTS check)
    4. Log: Deleted counts
  - Transaction: `@Transactional` on executeInternal
  - **Run T037 → MUST PASS**

- [ ] **T039** [P] Create Quartz configuration in `backend/src/main/java/com/fleetops/bulkupload/cleanup/QuartzConfig.java`
  - Annotation: `@Configuration`
  - Bean: `JobDetail` for BulkUploadRetentionJob
  - Bean: `Trigger` with cron `0 0 2 * * ?` (daily at 2 AM)
  - Verify: Job is registered on app startup

---

## Phase H: Contract & Integration Tests (5 tasks - Parallel after F+G)

### H.1 Contract Tests (Parallel - Full Stack Required)
- [ ] **T040** [P] Contract test suite in `backend/src/test/java/com/fleetops/bulkupload/contract/BulkUploadContractTest.java`
  - Use: `@SpringBootTest(webEnvironment = RANDOM_PORT)` with TestContainers PostgreSQL
  - Test all scenarios from contracts/bulk-upload-api.yaml:
    1. POST /bulk-upload with valid 50-row file → 200 with correct schema
    2. POST with 650 rows → 400 "Row limit exceeded"
    3. POST with missing headers → 400 "Missing required headers"
    4. POST with feature flag disabled → 403 "Feature disabled" (no auth scenarios - User/Role not implemented)
    5. GET /template → 200 with Excel Content-Type
    6. GET /batches → 200 with pagination schema
  - Verify: Response matches OpenAPI schema (use JSON schema validator)
  - **Run test → MUST PASS (all endpoints implemented)**

### H.2 Integration Tests from Quickstart (Parallel)
- [ ] **T041** [P] Integration test Scenario 1 (Happy Path) in `backend/src/test/java/com/fleetops/bulkupload/integration/HappyPathIntegrationTest.java`
  - Given: Valid 50-row Excel with unique clientReferences
  - When: POST /bulk-upload
  - Then: 200 with 50 CREATED, 0 failed, 0 skipped
  - Verify: 50 orders in database, 50 bulk_upload_rows with status=CREATED
  - Use: TestRestTemplate, TestContainers PostgreSQL
  - Fixture: Generate Excel via Apache POI in @BeforeEach

- [ ] **T042** [P] Integration test Scenario 2 (Idempotency) in `backend/src/test/java/com/fleetops/bulkupload/integration/IdempotencyIntegrationTest.java`
  - Given: Scenario 1 executed (50 orders exist)
  - When: Re-upload identical file
  - Then: 200 with 0 CREATED, 0 failed, 50 skipped
  - Verify: Still only 50 orders in database (no duplicates)

- [ ] **T043** [P] Integration test Scenario 3 (Mixed Results) in `backend/src/test/java/com/fleetops/bulkupload/integration/MixedResultsIntegrationTest.java`
  - Given: Excel with 50 rows (46 valid, 3 invalid, 1 duplicate)
  - When: POST /bulk-upload
  - Then: 200 with 46 CREATED, 3 failed, 1 skipped
  - Verify: Error codes match (MISSING_RECEIVER_PINCODE, DECLARED_VALUE_EXCEEDS_LIMIT, INVALID_SERVICE_TYPE)

- [ ] **T044** [P] Integration test Scenario 5 (Retention) in `backend/src/test/java/com/fleetops/bulkupload/integration/RetentionIntegrationTest.java`
  - Given: Batch with rows created 200 days ago (simulate via SQL UPDATE)
  - When: Trigger BulkUploadRetentionJob manually
  - Then: Rows deleted, empty batch deleted
  - Verify: Database state matches expected counts

---

## Phase I: Configuration & Polish (2 tasks - Parallel)

- [ ] **T045** [P] Add configuration properties in `backend/src/main/resources/application.yml`
  - Add:
    ```yaml
    bulk:
      upload:
        enabled: true
        retention:
          rows:
            days: 30
          batches:
            days: 180
        declaredValue:
          max: 100000
        # allowedRoles: OPERATIONS,SUPERVISOR,ADMIN  # TODO: Uncomment when User/Role implemented
    spring:
      servlet:
        multipart:
          max-file-size: 2MB
          max-request-size: 2MB
    ```

- [ ] **T046** [P] Add logging and metrics in BulkUploadServiceImpl
  - Add: Structured logging at INFO level (bulk_upload_started, bulk_upload_completed with counts)
  - Add: Metrics via Micrometer (histogram for processingDurationMs, counter for failed rows)
  - Add: Log at WARN for failed rows (include row index + error codes)

---

## Dependencies Graph

```
Setup (T001-T003) → Everything
├─ Migrations (T004-T006) → Entities (T007-T010)
├─ Entities (T007-T010) → Repositories (T011-T014)
├─ DTOs (T015-T018) → Parser (T019-T024)
├─ Parser (T019-T024) → Validation (T025-T029)
├─ Validation (T025-T029) → Service (T030-T034)
├─ Service (T030-T034) → Controller (T035-T036)
├─ Controller (T036) → Integration Tests (T040-T044)
├─ Repositories (T011-T014) → Retention Job (T037-T039)
└─ All Backend → Contract Tests (T040-T044)
```

**Critical Path**: T001 → T004 → T007 → T009 → T013 → T015 → T021 → T026 → T031 → T036 → T040

---

## Parallel Execution Examples

### Batch 1: Setup & Migrations (after T001-T003)
```bash
# Launch T004, T005 together (different files):
Task: "Flyway migration V5 in backend/src/main/resources/db/migration/V5__create_bulk_upload_batch.sql"
Task: "Flyway migration V6 in backend/src/main/resources/db/migration/V6__create_bulk_upload_row.sql"
```

### Batch 2: Entity Tests (after T006)
```bash
# Launch T007, T008 together:
Task: "Entity test for BulkUploadBatch in backend/src/test/java/com/fleetops/bulkupload/entity/BulkUploadBatchTest.java"
Task: "Entity test for BulkUploadRow in backend/src/test/java/com/fleetops/bulkupload/entity/BulkUploadRowTest.java"
```

### Batch 3: Entity Implementation (after T007-T008 FAIL)
```bash
# Launch T009, T010 together:
Task: "Create BulkUploadBatch entity in backend/src/main/java/com/fleetops/bulkupload/entity/BulkUploadBatch.java"
Task: "Create BulkUploadRow entity in backend/src/main/java/com/fleetops/bulkupload/entity/BulkUploadRow.java"
```

### Batch 4: Repository Tests (after T009-T010 PASS)
```bash
# Launch T011, T012 together:
Task: "Repository test for BulkUploadBatchRepository in backend/src/test/java/com/fleetops/bulkupload/repository/BulkUploadBatchRepositoryTest.java"
Task: "Repository test for BulkUploadRowRepository in backend/src/test/java/com/fleetops/bulkupload/repository/BulkUploadRowRepositoryTest.java"
```

### Batch 5: Repository Implementation (after T011-T012 FAIL)
```bash
# Launch T013, T014 together:
Task: "Create BulkUploadBatchRepository in backend/src/main/java/com/fleetops/bulkupload/repository/BulkUploadBatchRepository.java"
Task: "Create BulkUploadRowRepository in backend/src/main/java/com/fleetops/bulkupload/repository/BulkUploadRowRepository.java"
```

### Batch 6: DTOs (after T013-T014 PASS)
```bash
# Launch T015-T018 together (all different files):
Task: "Create CreateOrderDto in backend/src/main/java/com/fleetops/bulkupload/dto/CreateOrderDto.java"
Task: "Create BulkUploadResponseDto in backend/src/main/java/com/fleetops/bulkupload/dto/BulkUploadResponseDto.java"
Task: "Create RowOutcomeDto in backend/src/main/java/com/fleetops/bulkupload/dto/RowOutcomeDto.java"
Task: "Create ValidationErrorDto in backend/src/main/java/com/fleetops/bulkupload/dto/ValidationErrorDto.java"
```

### Batch 7: Parser & Idempotency Tests (after T015-T018)
```bash
# Launch T019, T020 together:
Task: "ExcelParserService test in backend/src/test/java/com/fleetops/bulkupload/parser/ExcelParserServiceTest.java"
Task: "IdempotencyService test in backend/src/test/java/com/fleetops/bulkupload/service/IdempotencyServiceTest.java"
```

### Batch 8: Integration Tests (after T036 complete)
```bash
# Launch T040-T044 together (all different test files):
Task: "Contract test suite in backend/src/test/java/com/fleetops/bulkupload/contract/BulkUploadContractTest.java"
Task: "Integration test Scenario 1 in backend/src/test/java/com/fleetops/bulkupload/integration/HappyPathIntegrationTest.java"
Task: "Integration test Scenario 2 in backend/src/test/java/com/fleetops/bulkupload/integration/IdempotencyIntegrationTest.java"
Task: "Integration test Scenario 3 in backend/src/test/java/com/fleetops/bulkupload/integration/MixedResultsIntegrationTest.java"
Task: "Integration test Scenario 5 in backend/src/test/java/com/fleetops/bulkupload/integration/RetentionIntegrationTest.java"
```

---

## Validation Checklist
*GATE: Verify before marking tasks complete*

- [x] All contracts have corresponding tests (T040 covers all 3 endpoints from contracts/)
- [x] All entities have model tasks (T009 BulkUploadBatch, T010 BulkUploadRow)
- [x] All tests come before implementation (tests in Phase B/D/F before impl in subsequent tasks)
- [x] Parallel tasks truly independent (all [P] tasks operate on different files)
- [x] Each task specifies exact file path (all tasks include full path)
- [x] No task modifies same file as another [P] task (verified: no conflicts)
- [x] All quickstart scenarios covered (T041-T044 map to Scenarios 1, 2, 3, 5)

---

## Notes
- **TDD Enforcement**: All test tasks (T007-T008, T011-T012, T019-T020, T025, T030, T035, T037) MUST be run and MUST FAIL before proceeding to implementation
- **Commit Strategy**: Commit after each task or logical group (e.g., T009+T010 entity pair)
- **TestContainers**: Use PostgreSQL 15 image `postgres:15-alpine` for all integration tests
- **Feature Flag**: Check `@Value("${bulk.upload.enabled}")` in controller method (not `@ConditionalOnProperty` on bean)
- **Performance**: Validate ≤15s p95 for 500 rows after T046 via manual testing or performance test
- **Frontend Tasks**: Deferred to separate frontend feature (Angular component + service) - can be developed in parallel after OpenAPI contract is stable
- **⚠️ Auth Deferred**: User/Role entities not implemented; security is `.permitAll()` for development. Using hardcoded `uploaderUserId = 1L` in Phase 1. Add `@PreAuthorize` checks when auth system is ready.

---

**Total Estimated Duration**: 8-12 hours with parallel execution  
**Critical Path Duration**: ~6 hours (sequential dependencies)  
**Next Step**: Execute T001-T003 (Setup), then proceed with TDD cycle (test → fail → implement → pass → refactor)
