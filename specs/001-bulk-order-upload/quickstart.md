# Bulk Order Upload Quickstart: Integration Test Scenarios

**Purpose**: Narrative-driven integration test scenarios demonstrating all primary user flows through the bulk order upload feature. These scenarios guide contract and integration test development.

**Test Environment Setup**:
- Backend: Spring Boot application running on `localhost:8080` with PostgreSQL 15+
- Authentication: Valid JWT token with `ROLE_OPERATIONS` role
- Feature flag: `bulk.upload.enabled=true` (application-test.yml)
- Test data: Excel files generated via Apache POI in test fixtures

---

## Scenario 1: Happy Path — All Valid Orders

**Story Reference**: User Story #1 (Upload Excel, Create Orders)  
**Acceptance Criteria**: AC1 (Upload validation), AC2 (Order creation), AC3 (Response structure)

### Given
- System is configured with `bulk.upload.enabled=true`
- User `operations-user-123` is authenticated with `ROLE_OPERATIONS` role
- Excel file `happy_path_50_orders.xlsx` exists with:
  - Headers row: `clientReference, clientId, senderName, senderAddress, senderContact, senderEmail, receiverName, receiverAddress, receiverContact, receiverPincode, receiverCity, itemCount, totalWeight, itemDescription, declaredValue, serviceType, carrierName, codAmount, specialInstructions`
  - 50 data rows with unique `clientReference` values (`REF-001` through `REF-050`)
  - All rows have valid data (e.g., `receiverPincode` is 6 digits, `declaredValue` ≤ 100000, `serviceType` in [express, standard, economy])
  - File size: 45 KB

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="happy_path_50_orders.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 200  
**Body**:
```json
{
  "batchId": "BU202510040001",
  "totalRows": 50,
  "createdCount": 50,
  "failedCount": 0,
  "skippedDuplicateCount": 0,
  "processingDurationMs": <duration ≤ 15000>,
  "rows": [
    {
      "rowIndex": 1,
      "status": "CREATED",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": "ORD000123",
      "errorMessages": []
    },
    // ... 49 more rows with CREATED status
  ]
}
```

### Verify
1. **Database (bulk_upload_batches)**:
   - 1 row inserted with `batch_id='BU202510040001'`, `status='COMPLETED'`, `total_rows=50`, `created_count=50`, `failed_count=0`, `skipped_duplicate_count=0`
   - `file_checksum` matches SHA-256 of uploaded file
   - `uploader_user_id=123`

2. **Database (bulk_upload_rows)**:
   - 50 rows inserted, each with:
     - `batch_id='BU202510040001'`
     - `status='CREATED'`
     - `idempotency_key='REF-001'` through `'REF-050'`
     - `idempotency_basis='CLIENT_REFERENCE'`
     - `order_id` is not null (foreign key to `orders` table)
     - `error_messages='{}'::jsonb`

3. **Database (orders)**:
   - 50 orders created with unique `order_id` values
   - Each order's `client_id` matches the `clientId` from Excel row
   - `receiver_pincode`, `receiver_city` are normalized (trimmed, uppercase city)

4. **Performance**:
   - `processingDurationMs` ≤ 15000 (p95 target for 500 rows, so 50 rows should be ~1.5s)

---

## Scenario 2: Idempotency — Re-upload Identical File

**Story Reference**: User Story #2 (Prevent Duplicate Orders)  
**Acceptance Criteria**: AC4 (Duplicate detection via clientReference)

### Given
- Scenario 1 has been executed (50 orders with `REF-001` through `REF-050` already exist)
- Same Excel file `happy_path_50_orders.xlsx` is re-uploaded by user `operations-user-123`

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="happy_path_50_orders.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data — identical to Scenario 1>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 200  
**Body**:
```json
{
  "batchId": "BU202510040002",
  "totalRows": 50,
  "createdCount": 0,
  "failedCount": 0,
  "skippedDuplicateCount": 50,
  "processingDurationMs": <duration ≤ 3000>,
  "rows": [
    {
      "rowIndex": 1,
      "status": "SKIPPED_DUPLICATE",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": null,
      "errorMessages": []
    },
    // ... 49 more rows with SKIPPED_DUPLICATE status
  ]
}
```

### Verify
1. **Database (bulk_upload_batches)**:
   - 2 batches exist: `BU202510040001` (from Scenario 1) and `BU202510040002` (new)
   - Batch `BU202510040002` has `skipped_duplicate_count=50`

2. **Database (bulk_upload_rows)**:
   - 50 new rows inserted for batch `BU202510040002`, each with:
     - `status='SKIPPED_DUPLICATE'`
     - `idempotency_key='REF-001'` through `'REF-050'` (same as Scenario 1)
     - `order_id=null`

3. **Database (orders)**:
   - Still only 50 orders (no new orders created)
   - Order count unchanged from Scenario 1

4. **Performance**:
   - Faster than Scenario 1 (no order creation overhead, only idempotency lookups)

---

## Scenario 3: Mixed Valid/Invalid Rows

**Story Reference**: User Story #1 (Upload Excel, Create Orders)  
**Acceptance Criteria**: AC2 (Independent row processing), AC7 (Partial success)

### Given
- Excel file `mixed_results_50_rows.xlsx` with 50 data rows:
  - Rows 1-40: Valid data with unique `clientReference` (`MIX-001` through `MIX-040`)
  - Row 41: Missing `receiverPincode` (validation failure)
  - Row 42: `declaredValue=150000` (exceeds limit of 100000, validation failure)
  - Row 43: `serviceType='overnight'` (invalid enum value, validation failure)
  - Row 44: Valid data but `clientReference='MIX-001'` (duplicate of Row 1, idempotency skip)
  - Rows 45-50: Valid data with unique `clientReference` (`MIX-045` through `MIX-050`)

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="mixed_results_50_rows.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 200  
**Body**:
```json
{
  "batchId": "BU202510040003",
  "totalRows": 50,
  "createdCount": 46,
  "failedCount": 3,
  "skippedDuplicateCount": 1,
  "processingDurationMs": <duration ≤ 15000>,
  "rows": [
    {
      "rowIndex": 41,
      "status": "FAILED_VALIDATION",
      "idempotencyBasis": null,
      "orderId": null,
      "errorMessages": [
        {
          "code": "MISSING_RECEIVER_PINCODE",
          "field": "receiverPincode",
          "message": "Receiver pincode is required"
        }
      ]
    },
    {
      "rowIndex": 42,
      "status": "FAILED_VALIDATION",
      "idempotencyBasis": null,
      "orderId": null,
      "errorMessages": [
        {
          "code": "DECLARED_VALUE_EXCEEDS_LIMIT",
          "field": "declaredValue",
          "message": "Declared value 150000 exceeds maximum allowed 100000"
        }
      ]
    },
    {
      "rowIndex": 43,
      "status": "FAILED_VALIDATION",
      "idempotencyBasis": null,
      "orderId": null,
      "errorMessages": [
        {
          "code": "INVALID_SERVICE_TYPE",
          "field": "serviceType",
          "message": "Service type must be one of: express, standard, economy"
        }
      ]
    },
    {
      "rowIndex": 44,
      "status": "SKIPPED_DUPLICATE",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": null,
      "errorMessages": []
    },
    // ... other rows with CREATED status
  ]
}
```

### Verify
1. **Database (bulk_upload_batches)**:
   - Batch `BU202510040003` has `status='COMPLETED'`, `created_count=46`, `failed_count=3`, `skipped_duplicate_count=1`

2. **Database (bulk_upload_rows)**:
   - 50 rows total for batch `BU202510040003`:
     - 46 rows with `status='CREATED'`, `order_id` not null
     - 3 rows (indexes 41, 42, 43) with `status='FAILED_VALIDATION'`, `error_messages` JSONB array populated
     - 1 row (index 44) with `status='SKIPPED_DUPLICATE'`

3. **Database (orders)**:
   - 46 new orders created (only valid, non-duplicate rows)

4. **Rollback Isolation**:
   - Failed rows do NOT prevent successful rows from being committed
   - Each row is processed independently (no all-or-nothing batch transaction)

---

## Scenario 4: Template Download

**Story Reference**: User Story #3 (Download Template)  
**Acceptance Criteria**: AC8 (Template contains headers + example)

### Given
- User is authenticated with valid JWT token

### When
```http
GET /api/v1/bulk-upload/template HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
```

### Then
**Response**: HTTP 200  
**Headers**:
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="bulk_upload_template.xlsx"`

**Body**: Binary Excel file

### Verify
1. **Excel Structure**:
   - Sheet 1 ("Orders"):
     - Row 1 (Headers): Contains all 19 required column names (e.g., `clientReference`, `clientId`, `senderName`, ..., `specialInstructions`)
     - Row 2 (Example): Sample data (e.g., `REF-EXAMPLE-001`, `123`, `John Doe`, ...)
   - Sheet 2 ("Notes"):
     - Contains idempotency guidance: "Use clientReference for tracking; leave blank for auto-generated hash"
     - Field descriptions: "receiverPincode: 6-digit postal code"
     - Validation rules: "declaredValue: Maximum 100000"

2. **File Validity**:
   - Downloaded file can be opened in Excel/LibreOffice without errors
   - File can be uploaded via `/api/v1/bulk-upload` after modifying example row

---

## Scenario 5: Retention Cleanup After 31 Days

**Story Reference**: User Story #4 (System Retention Cleanup)  
**Acceptance Criteria**: AC9 (Row retention), AC10 (Batch retention)

### Given
- Quartz job `BulkUploadRetentionJob` is configured with cron `0 0 2 * * ?` (2 AM daily)
- Configuration:
  - `bulk.upload.retention.row.days=180`
  - `bulk.upload.retention.batch.days=180`
- Test database contains:
  - Batch `BU202508010001` (uploaded 65 days ago) with 50 rows, `status='COMPLETED'`
  - Batch `BU202509280001` (uploaded 5 days ago) with 30 rows, `status='COMPLETED'`
  - Batch `BU202409010001` (uploaded 220 days ago) with 20 rows, `status='COMPLETED'` (empty batch: all rows already deleted)

### When
- System clock is set to `2025-10-04T02:00:00Z`
- Quartz scheduler triggers `BulkUploadRetentionJob.execute()`

### Then
**Job Execution**:
- Deletes rows from `bulk_upload_rows` where `created_at < NOW() - INTERVAL '180 days'`
- Deletes batches from `bulk_upload_batches` where `created_at < NOW() - INTERVAL '180 days'` AND `total_rows = 0` (empty batches)

### Verify
1. **Database (bulk_upload_rows)**:
   - Rows from batch `BU202508010001` (65 days old) are retained (not yet 180 days old)
   - Rows from batch `BU202509280001` (5 days old) are retained (30 rows remain)

2. **Database (bulk_upload_batches)**:
   - Batch `BU202508010001` remains (not empty after row deletion from this run, but will be deleted when 180 days old)
   - Batch `BU202409010001` (220 days old, empty) is deleted
   - Batch `BU202509280001` remains (only 5 days old)

3. **Job Logging**:
   - Log entry: `Retention job completed: deleted 0 rows, deleted 1 batch`

4. **Idempotency**:
   - Running job again immediately (same timestamp) deletes 0 rows, 0 batches (no duplicates)

5. **Transaction Rollback**:
   - If job fails mid-execution (e.g., database connection loss), entire transaction rolls back (no partial deletions)

---

## Scenario 6: Upload Rejected — Feature Disabled

**Story Reference**: User Story #1 (Upload Excel, Create Orders)  
**Acceptance Criteria**: AC6 (Feature flag enforcement)

### Given
- Configuration: `bulk.upload.enabled=false` (feature flag disabled)
- User `operations-user-123` is authenticated with `ROLE_OPERATIONS` role

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="test.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 403 Forbidden  
**Body**:
```json
{
  "timestamp": "2025-10-04T10:15:30Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Bulk upload feature is currently disabled",
  "path": "/api/v1/bulk-upload"
}
```

### Verify
1. **Database**: No rows inserted into `bulk_upload_batches` or `bulk_upload_rows`
2. **Early Exit**: File is NOT parsed or validated (rejected before POI processing)

---

## Scenario 7: Upload Rejected — Insufficient Role

**Story Reference**: User Story #1 (Upload Excel, Create Orders)  
**Acceptance Criteria**: AC5 (Role-based access control)

### Given
- Configuration: `bulk.upload.enabled=true`
- User `viewer-user-999` is authenticated with `ROLE_VIEWER` role (lacks `ROLE_OPERATIONS`)

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token-for-viewer-user>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="test.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 403 Forbidden  
**Body**:
```json
{
  "timestamp": "2025-10-04T10:15:30Z",
  "status": 403,
  "error": "Forbidden",
  "message": "User does not have required role: ROLE_OPERATIONS",
  "path": "/api/v1/bulk-upload"
}
```

### Verify
1. **Database**: No rows inserted into `bulk_upload_batches` or `bulk_upload_rows`
2. **Authorization Check**: Fails before file parsing

---

## Scenario 8: Upload Rejected — File Too Large

**Story Reference**: User Story #1 (Upload Excel, Create Orders)  
**Acceptance Criteria**: AC1 (File size constraint)

### Given
- Configuration: `spring.servlet.multipart.max-file-size=2MB`
- Excel file `oversized.xlsx` has size 3.2 MB (contains 800 rows with complex formulas/formatting)

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="oversized.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data — 3.2 MB>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 413 Payload Too Large  
**Body**:
```json
{
  "timestamp": "2025-10-04T10:15:30Z",
  "status": 413,
  "error": "Payload Too Large",
  "message": "Maximum upload size exceeded",
  "path": "/api/v1/bulk-upload"
}
```

### Verify
1. **Early Rejection**: Request is rejected by Spring Boot's multipart resolver before reaching controller
2. **Database**: No rows inserted

---

## Scenario 9: Upload Rejected — Missing Required Headers

**Story Reference**: User Story #1 (Upload Excel, Create Orders)  
**Acceptance Criteria**: AC1 (Structural validation)

### Given
- Excel file `missing_headers.xlsx` has headers row missing `receiverPincode` and `serviceType` columns

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="missing_headers.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 400 Bad Request  
**Body**:
```json
{
  "timestamp": "2025-10-04T10:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Missing required headers: receiverPincode, serviceType",
  "path": "/api/v1/bulk-upload"
}
```

### Verify
1. **Validation Timing**: Detected during structural validation (Layer 1) before any row processing
2. **Database**: No batch or rows inserted

---

## Scenario 10: Hash-Based Idempotency (No clientReference)

**Story Reference**: User Story #2 (Prevent Duplicate Orders)  
**Acceptance Criteria**: AC4 (Duplicate detection via hash)

### Given
- Excel file `no_client_reference.xlsx` with 10 rows:
  - All rows have `clientReference` column empty (blank cells)
  - Row 1 and Row 5 have identical data for all other fields (duplicate candidates)

### When
```http
POST /api/v1/bulk-upload HTTP/1.1
Host: localhost:8080
Authorization: Bearer <valid-jwt-token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="no_client_reference.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary Excel data>
------WebKitFormBoundary--
```

### Then
**Response**: HTTP 200  
**Body**:
```json
{
  "batchId": "BU202510040004",
  "totalRows": 10,
  "createdCount": 9,
  "failedCount": 0,
  "skippedDuplicateCount": 1,
  "processingDurationMs": <duration>,
  "rows": [
    {
      "rowIndex": 1,
      "status": "CREATED",
      "idempotencyBasis": "HASH",
      "orderId": "ORD000456",
      "errorMessages": []
    },
    {
      "rowIndex": 5,
      "status": "SKIPPED_DUPLICATE",
      "idempotencyBasis": "HASH",
      "orderId": null,
      "errorMessages": []
    },
    // ... other rows with CREATED status and idempotencyBasis=HASH
  ]
}
```

### Verify
1. **Database (bulk_upload_rows)**:
   - Row 1: `idempotency_basis='HASH'`, `idempotency_key='<sha256-hash-value>'`, `status='CREATED'`
   - Row 5: `idempotency_basis='HASH'`, `idempotency_key='<same-sha256-hash-as-row-1>'`, `status='SKIPPED_DUPLICATE'`

2. **Hash Computation**:
   - Hash is computed over canonical concatenation: `clientId|senderName|receiverName|receiverPincode|itemCount|totalWeight|serviceType`
   - Rows 1 and 5 produce identical hash → Row 5 detected as duplicate

---

## Test Data Generation Notes

**Excel File Creation (JUnit Test Fixtures)**:
```java
@TestConfiguration
public class BulkUploadTestDataFactory {
  public static File createHappyPathExcel(int rowCount) throws IOException {
    XSSFWorkbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Orders");
    
    // Headers row
    Row headerRow = sheet.createRow(0);
    String[] headers = {"clientReference", "clientId", "senderName", ...};
    for (int i = 0; i < headers.length; i++) {
      headerRow.createCell(i).setCellValue(headers[i]);
    }
    
    // Data rows
    for (int i = 0; i < rowCount; i++) {
      Row dataRow = sheet.createRow(i + 1);
      dataRow.createCell(0).setCellValue("REF-" + String.format("%03d", i + 1));
      dataRow.createCell(1).setCellValue(123L); // clientId
      // ... populate other columns
    }
    
    File tempFile = File.createTempFile("test_upload", ".xlsx");
    try (FileOutputStream fos = new FileOutputStream(tempFile)) {
      workbook.write(fos);
    }
    workbook.close();
    return tempFile;
  }
}
```

**Integration Test Base Class**:
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public abstract class BulkUploadIntegrationTestBase {
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
    .withDatabaseName("fleetops_test");
  
  @Autowired
  protected TestRestTemplate restTemplate;
  
  @Autowired
  protected BulkUploadBatchRepository batchRepository;
  
  @Autowired
  protected BulkUploadRowRepository rowRepository;
  
  @Autowired
  protected OrderRepository orderRepository;
  
  protected String getAuthHeader() {
    // Return JWT token for user with ROLE_OPERATIONS
  }
}
```

---

**End of Quickstart Scenarios**  
These 10 scenarios provide comprehensive coverage for contract tests (Scenarios 1-4, 6-9) and integration tests (Scenarios 1-5, 10). Use them as the basis for `@RestClientTest` (contract) and `@SpringBootTest` (integration) test class generation in Phase 2 tasks.
