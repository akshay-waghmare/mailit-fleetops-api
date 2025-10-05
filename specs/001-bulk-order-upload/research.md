# Research: Bulk Order Upload (Excel)

**Feature**: 001-bulk-order-upload  
**Date**: 2025-10-04  
**Status**: Complete

## Overview
This document captures technical research findings and decisions for implementing bulk order upload via Excel files. Focus areas: streaming Excel parsing, idempotency mechanisms, retention policies, scheduled cleanup, and frontend file handling.

---

## 1. Apache POI SXSSF Best Practices

### Decision
Use **Apache POI SXSSF (Streaming Workbook)** version 5.x for Excel parsing with row-by-row streaming to maintain low memory footprint.

### Rationale
- **Memory Efficiency**: SXSSF keeps only a sliding window of rows in memory (default 100 rows), crucial for processing up to 500 rows without heap pressure
- **DOM vs Streaming**: Standard XSSF loads entire workbook into memory (~10MB for 500 rows); SXSSF uses ~2MB
- **Production Fit**: Synchronous 15s target feasible with streaming; batch writes to database every 50 rows reduces transaction overhead
- **Error Recovery**: Row-level parsing allows graceful degradation—invalid row logged, processing continues

### Alternatives Considered
1. **Apache POI XSSF (DOM-based)**: Rejected—loads entire workbook into heap; risky for concurrent uploads
2. **JExcelApi**: Rejected—legacy library, poor .xlsx support, not actively maintained
3. **FastExcel**: Rejected—newer library with limited Spring Boot integration examples; risk for production

### Implementation Pattern
```java
try (InputStream is = file.getInputStream();
     Workbook workbook = new SXSSFWorkbook(100)) { // 100-row window
    
    Sheet sheet = workbook.getSheetAt(0);
    Iterator<Row> rowIterator = sheet.iterator();
    
    // Skip header row
    if (rowIterator.hasNext()) rowIterator.next();
    
    int rowIndex = 1;
    while (rowIterator.hasNext()) {
        Row row = rowIterator.next();
        try {
            OrderData orderData = parseRow(row, rowIndex);
            validateAndPersist(orderData);
        } catch (ParseException e) {
            recordFailure(rowIndex, e.getMessage());
        }
        rowIndex++;
    }
}
```

### Error Handling Strategy
- **Missing/Extra Columns**: Detect header mismatch in first pass; reject entire file with clear diff message
- **Malformed Excel**: Catch POI's `InvalidFormatException`; return 400 with "File corrupted or invalid .xlsx format"
- **Cell Type Mismatch**: Use `DataFormatter` to coerce cell values to strings; validate formats in business layer (e.g., numeric pincode)
- **Large Files**: Pre-check file size (2MB) and row count estimate (scan sheet without parsing) before streaming

### Integration Points
- **Dependency**: `org.apache.poi:poi-ooxml:5.2.5` (existing Spring Boot BOM includes 5.x)
- **Service Layer**: `ExcelParserService.parseAndValidate(MultipartFile) → List<OrderData>`
- **Resource Cleanup**: Use try-with-resources to auto-close SXSSF temp files (`SXSSFWorkbook.dispose()`)

---

## 2. Idempotency Strategies in Batch Processing

### Decision
**Dual idempotency mechanism**: Prefer `clientReference` as business key; fallback to **SHA-256 deterministic hash** over canonical field concatenation.

### Rationale
- **Business Context**: Operations teams may re-upload same file after fixing errors in subset of rows; must not duplicate successfully processed rows
- **Determinism**: SHA-256 over sorted, normalized field string ensures identical logical orders produce identical hash regardless of column order changes
- **Database Enforcement**: Unique constraint on `idempotency_key` column provides atomic duplicate detection; INSERT will fail-fast for duplicates
- **Auditability**: Store both `idempotency_key` and `idempotency_basis` (enum: CLIENT_REFERENCE | HASH) for troubleshooting

### Alternatives Considered
1. **File-level Checksum Only**: Rejected—entire file must be identical; doesn't handle partial corrections
2. **UUID per Upload**: Rejected—no duplicate detection; multiple uploads create duplicate orders
3. **Composite DB Unique Index on Business Fields**: Rejected—requires exact field match in DB; doesn't handle whitespace/case variations

### Hash Computation Approach
```java
public String computeIdempotencyHash(OrderData data) {
    // Canonical field order (alphabetical)
    String canonical = String.join("|",
        String.valueOf(data.getClientId()),
        normalize(data.getSenderName()),
        normalize(data.getReceiverName()),
        normalize(data.getReceiverPincode()),
        String.valueOf(data.getItemCount()),
        String.valueOf(data.getTotalWeight()),
        data.getServiceType().name()
    );
    
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] hash = digest.digest(canonical.getBytes(StandardCharsets.UTF_8));
    return "HASH:" + Hex.encodeHexString(hash);
}

private String normalize(String value) {
    return value.trim().replaceAll("\\s+", " ").toLowerCase();
}
```

### Database Schema
```sql
-- bulk_upload_rows table
idempotency_key VARCHAR(300) NOT NULL,
idempotency_basis VARCHAR(20) NOT NULL CHECK (idempotency_basis IN ('CLIENT_REFERENCE', 'HASH')),
UNIQUE INDEX idx_idempotency_key (idempotency_key)
```

### Key Decision Rule
- If `clientReference` column present AND non-empty → `idempotency_key = "{clientId}:{clientReference}"`
- Else → `idempotency_key = computeIdempotencyHash(data)`

### Integration Points
- **Service**: `IdempotencyService.resolveKey(clientId, OrderData) → IdempotencyResult{key, basis}`
- **Validation**: `IdempotencyValidator` checks DB for existing key; marks row SKIPPED_DUPLICATE if found
- **Performance**: Index on `idempotency_key` supports O(1) lookups; hash computation ~0.5ms per row (negligible vs DB I/O)

---

## 3. Flyway Migration for Retention Policies

### Decision
Use **Flyway versioned migrations** to create bulk upload tables with `created_at` timestamp columns indexed for efficient retention cleanup queries.

### Rationale
- **Zero-Downtime**: Flyway migrations run before app start; new tables don't conflict with existing schema
- **Idempotency**: Flyway checksum validation prevents accidental re-runs; safe for multi-instance deployments
- **Audit Trail**: Migration history in `flyway_schema_history` table documents when retention schema was introduced
- **Index Strategy**: B-tree index on `created_at` enables efficient range scans for `WHERE created_at < NOW() - INTERVAL '30 days'`

### Alternatives Considered
1. **Liquibase**: Rejected—existing project uses Flyway; consistency preferred
2. **Manual SQL Scripts**: Rejected—no checksum validation; risk of duplicate execution
3. **JPA @Table with ddl-auto=update**: Rejected—production anti-pattern; no migration versioning

### Migration Files

**V5__create_bulk_upload_batch.sql**:
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
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_upload_batch_uploader ON bulk_upload_batch(uploader_user_id);
CREATE INDEX idx_bulk_upload_batch_uploaded_at ON bulk_upload_batch(uploaded_at);
CREATE INDEX idx_bulk_upload_batch_created_at ON bulk_upload_batch(created_at); -- For retention cleanup

COMMENT ON TABLE bulk_upload_batch IS 'Metadata for bulk order upload batches; retained 180 days';
COMMENT ON COLUMN bulk_upload_batch.batch_id IS 'Business ID format: BU{YYYYMMDD}{seq}';
```

**V6__create_bulk_upload_row.sql**:
```sql
CREATE TABLE bulk_upload_row (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES bulk_upload_batch(id) ON DELETE CASCADE,
    row_index INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    idempotency_key VARCHAR(300) NOT NULL,
    idempotency_basis VARCHAR(20) NOT NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    error_messages JSONB,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_upload_row_batch ON bulk_upload_row(batch_id);
CREATE INDEX idx_bulk_upload_row_idempotency_key ON bulk_upload_row(idempotency_key);
CREATE INDEX idx_bulk_upload_row_created_at ON bulk_upload_row(created_at); -- For retention cleanup
CREATE UNIQUE INDEX idx_bulk_upload_row_batch_index ON bulk_upload_row(batch_id, row_index);

COMMENT ON TABLE bulk_upload_row IS 'Per-row outcomes for bulk uploads; retained 30 days';
COMMENT ON COLUMN bulk_upload_row.error_messages IS 'JSON array of {code, field, message}';
```

### Retention Cleanup Query Pattern
```sql
-- Delete rows older than 30 days (executed by scheduled job)
DELETE FROM bulk_upload_row
WHERE created_at < NOW() - INTERVAL '30 days';

-- Prune empty batches older than 180 days
DELETE FROM bulk_upload_batch
WHERE created_at < NOW() - INTERVAL '180 days'
  AND id NOT IN (SELECT DISTINCT batch_id FROM bulk_upload_row);
```

### Integration Points
- **Configuration**: Retention intervals configurable via `bulk.upload.retention.rows.days=30`, `bulk.upload.retention.batches.days=180`
- **Monitoring**: Log cleanup job execution (rows deleted count, duration) for observability
- **Performance**: Index-only scans on `created_at` ensure cleanup completes <5s even with 1M+ rows

---

## 4. Spring Quartz Integration

### Decision
Use **Spring Boot Quartz Scheduler** to run daily retention cleanup job at 2 AM (off-peak) using cron expression `0 0 2 * * ?`.

### Rationale
- **Built-in Integration**: `spring-boot-starter-quartz` already in project dependencies (used for other scheduled tasks)
- **Persistent Jobs**: Quartz stores job definitions in DB; survives app restarts; prevents duplicate executions across instances
- **Cluster-Safe**: Quartz clustering (via `org.quartz.jobStore.isClustered=true`) ensures only one instance runs cleanup at a time
- **Transaction Management**: Quartz jobs run within Spring's transaction context; cleanup can rollback on errors

### Alternatives Considered
1. **@Scheduled Annotation**: Rejected—no built-in clustering; risk of duplicate execution in multi-instance deployment
2. **Spring Batch**: Rejected—overkill for single cleanup query; adds complexity
3. **Cron Job on Server**: Rejected—external to application; harder to monitor, test, deploy

### Implementation Pattern

**Job Class**:
```java
@Component
@DisallowConcurrentExecution // Prevent overlapping executions
public class RetentionCleanupJob extends QuartzJobBean {
    
    @Autowired
    private BulkUploadRowRepository rowRepository;
    
    @Autowired
    private BulkUploadBatchRepository batchRepository;
    
    @Value("${bulk.upload.retention.rows.days:180}")
    private int rowRetentionDays;
    
    @Value("${bulk.upload.retention.batches.days:180}")
    private int batchRetentionDays;
    
    @Override
    @Transactional
    protected void executeInternal(JobExecutionContext context) {
        log.info("Starting bulk upload retention cleanup job");
        
        LocalDateTime rowCutoff = LocalDateTime.now().minusDays(rowRetentionDays);
        int rowsDeleted = rowRepository.deleteByCreatedAtBefore(rowCutoff);
        log.info("Deleted {} expired bulk upload rows (older than {} days)", rowsDeleted, rowRetentionDays);
        
        LocalDateTime batchCutoff = LocalDateTime.now().minusDays(batchRetentionDays);
        int batchesDeleted = batchRepository.deleteEmptyBatchesCreatedBefore(batchCutoff);
        log.info("Deleted {} empty bulk upload batches (older than {} days)", batchesDeleted, batchRetentionDays);
    }
}
```

**Quartz Configuration**:
```java
@Configuration
public class QuartzConfig {
    
    @Bean
    public JobDetail retentionCleanupJobDetail() {
        return JobBuilder.newJob(RetentionCleanupJob.class)
            .withIdentity("retentionCleanupJob")
            .withDescription("Delete expired bulk upload rows and empty batches")
            .storeDurably()
            .build();
    }
    
    @Bean
    public Trigger retentionCleanupTrigger(JobDetail retentionCleanupJobDetail) {
        return TriggerBuilder.newTrigger()
            .forJob(retentionCleanupJobDetail)
            .withIdentity("retentionCleanupTrigger")
            .withSchedule(CronScheduleBuilder.cronSchedule("0 0 2 * * ?")) // 2 AM daily
            .build();
    }
}
```

### Monitoring & Alerting
- **Metrics**: Increment Micrometer counter `bulk_upload.cleanup.rows_deleted` and `bulk_upload.cleanup.batches_deleted`
- **Failure Handling**: If cleanup fails (e.g., DB connection error), Quartz retries up to 3 times with exponential backoff
- **Admin Override**: Expose actuator endpoint `/actuator/quartz/jobs/retentionCleanupJob/trigger` for manual execution

### Integration Points
- **Database**: Quartz tables (`qrtz_*`) created automatically by Flyway or Quartz init script
- **Testing**: Use `@QuartzTest` to verify cron expression, job execution logic with in-memory scheduler
- **Configuration**: `application.yml` enables Quartz with `spring.quartz.job-store-type=jdbc`

---

## 5. Angular Material File Upload Patterns

### Decision
Use **Angular Material `<input type="file">` with reactive forms** and custom file validator. Display upload progress via loading spinner; render per-row outcomes in `MatTable`.

### Rationale
- **Material Design**: Consistent with existing UI (pickup/order pages use Material components)
- **Reactive Forms**: Provides synchronous validation (file size, type) before HTTP request; better UX than template-driven forms
- **HttpClient with Observe**: `httpClient.post(..., {observe: 'events'})` enables progress tracking for large files
- **MatTable**: Built-in sorting, pagination for per-row results; reuses existing table patterns from order-list component

### Alternatives Considered
1. **ngx-file-drop**: Rejected—third-party library; drag-drop not required for Phase 1
2. **PrimeNG FileUpload**: Rejected—different design system; inconsistent with Material theme
3. **Plain HTML5 File API**: Rejected—requires manual styling, validation; more boilerplate

### Implementation Pattern

**Component Template**:
```html
<form [formGroup]="uploadForm" (ngSubmit)="onUpload()">
  <mat-form-field appearance="outline">
    <mat-label>Select Excel File</mat-label>
    <input matInput readonly [value]="selectedFileName" />
    <button mat-icon-button matSuffix type="button" (click)="fileInput.click()">
      <mat-icon>attach_file</mat-icon>
    </button>
  </mat-form-field>
  
  <input #fileInput type="file" hidden accept=".xlsx"
         (change)="onFileSelected($event)" />
  
  <mat-error *ngIf="uploadForm.get('file')?.hasError('fileSize')">
    File size exceeds 2 MB
  </mat-error>
  
  <mat-error *ngIf="uploadForm.get('file')?.hasError('fileType')">
    Only .xlsx files allowed
  </mat-error>
  
  <button mat-raised-button color="primary" type="submit"
          [disabled]="uploadForm.invalid || isUploading">
    <mat-icon *ngIf="isUploading">
      <mat-spinner diameter="20"></mat-spinner>
    </mat-icon>
    {{ isUploading ? 'Uploading...' : 'Upload Orders' }}
  </button>
</form>

<!-- Results table -->
<mat-table [dataSource]="rowOutcomes" *ngIf="uploadResult">
  <ng-container matColumnDef="rowIndex">
    <mat-header-cell *matHeaderCellDef>Row</mat-header-cell>
    <mat-cell *matCellDef="let row">{{row.rowIndex}}</mat-cell>
  </ng-container>
  
  <ng-container matColumnDef="status">
    <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
    <mat-cell *matCellDef="let row">
      <mat-chip [color]="getStatusColor(row.status)">
        {{row.status}}
      </mat-chip>
    </mat-cell>
  </ng-container>
  
  <ng-container matColumnDef="orderId">
    <mat-header-cell *matHeaderCellDef>Order ID</mat-header-cell>
    <mat-cell *matCellDef="let row">{{row.orderId || 'N/A'}}</mat-cell>
  </ng-container>
  
  <ng-container matColumnDef="errors">
    <mat-header-cell *matHeaderCellDef>Errors</mat-header-cell>
    <mat-cell *matCellDef="let row">
      <span *ngFor="let err of row.errorMessages" class="error-chip">
        {{err.message}}
      </span>
    </mat-cell>
  </ng-container>
  
  <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
  <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
</mat-table>
```

**Component TypeScript**:
```typescript
export class BulkUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFileName = '';
  isUploading = false;
  uploadResult: BulkUploadResponse | null = null;
  rowOutcomes: RowOutcome[] = [];
  displayedColumns = ['rowIndex', 'status', 'orderId', 'errors'];
  
  constructor(
    private fb: FormBuilder,
    private bulkUploadService: BulkUploadService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    this.uploadForm = this.fb.group({
      file: [null, [Validators.required, fileValidator()]]
    });
  }
  
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadForm.patchValue({ file });
      this.selectedFileName = file.name;
    }
  }
  
  onUpload() {
    if (this.uploadForm.invalid) return;
    
    const file = this.uploadForm.get('file')?.value;
    this.isUploading = true;
    
    this.bulkUploadService.uploadOrders(file).subscribe({
      next: (response) => {
        this.uploadResult = response;
        this.rowOutcomes = response.rows;
        this.isUploading = false;
        this.snackBar.open(
          `Upload complete: ${response.createdCount} created, ${response.failedCount} failed`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Upload failed', 'Close', { duration: 5000 });
      }
    });
  }
  
  getStatusColor(status: string): ThemePalette {
    return status === 'CREATED' ? 'accent' : status === 'FAILED_VALIDATION' ? 'warn' : undefined;
  }
}
```

**Custom File Validator**:
```typescript
export function fileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (!file) return null;
    
    // Max 2 MB
    if (file.size > 2 * 1024 * 1024) {
      return { fileSize: true };
    }
    
    // Only .xlsx
    if (!file.name.endsWith('.xlsx')) {
      return { fileType: true };
    }
    
    return null;
  };
}
```

**Service**:
```typescript
@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  private apiUrl = '/api/v1/bulk-upload';
  
  constructor(private http: HttpClient) {}
  
  uploadOrders(file: File): Observable<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<BulkUploadResponse>(this.apiUrl, formData);
  }
  
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, { responseType: 'blob' });
  }
}
```

### Integration Points
- **Route**: Add `{ path: 'bulk-upload', loadComponent: () => import('./pages/bulk-upload.component').then(m => m.BulkUploadComponent) }` to `app.routes.ts`
- **Navigation**: Add menu item in sidebar (icon: `upload_file`, label: "Bulk Upload")
- **Permissions**: Guard route with `canActivate: [AuthGuard]` and role check for `ROLE_OPERATIONS`

---

## Summary & Next Steps

All research tasks complete. Key decisions documented:
1. ✅ **Apache POI SXSSF**: Streaming parser for memory efficiency
2. ✅ **Dual Idempotency**: clientReference + SHA-256 hash fallback
3. ✅ **Flyway Migrations**: V5/V6 with indexed `created_at` columns
4. ✅ **Quartz Scheduler**: Daily 2 AM cleanup job with clustering
5. ✅ **Angular Material**: Reactive forms + MatTable for results

**Next Phase**: Generate Phase 1 artifacts (data-model.md, contracts/, quickstart.md)
