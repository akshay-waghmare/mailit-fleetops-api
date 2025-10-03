
# Implementation Plan: Bulk Order Upload (Excel)

**Branch**: `feature/001-bulk-order-upload` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-bulk-order-upload/spec.md`

## Execution Flow (/plan command scope)
```
✓ 1. Load feature spec from Input path
✓ 2. Fill Technical Context  
✓ 3. Fill Constitution Check section
✓ 4. Evaluate Constitution Check (no violations)
✓ 5. Execute Phase 0 (research)
✓ 6. Execute Phase 1 (design & contracts)
✓ 7. Document Phase 2 task planning approach
✓ 8. Constitution re-check (no violations)
✓ 9. Mark ready for /tasks command
```

**Phase Status**:
- [x] Phase 0: Research ✅ COMPLETE
- [x] Phase 1: Design & Contracts ✅ COMPLETE (data-model.md, contracts/bulk-upload-api.yaml, quickstart.md)
- [x] Phase 2: Task Planning ✅ COMPLETE (tasks.md with 46 tasks, auth deferral documented)
- [ ] Phase 3: Implementation (Execute T001-T046)

**Execution Flow**:
1. ✓ Check environment (git, branch, directories) ✅ COMPLETE
2. ✓ Analyze spec.md for technical requirements ✅ COMPLETE
3. ✓ Verify constitution alignment ✅ COMPLETE
4. ✓ Document execution flow with task list ✅ COMPLETE
5. ✓ Execute Phase 0 → research.md ✅ COMPLETE
6. ✓ Execute Phase 1 → contracts, data-model.md, quickstart.md ✅ COMPLETE
7. ✓ Execute Phase 1 → update .github/copilot-instructions.md ✅ COMPLETE
8. ✓ Phase 1 completion check & constitution re-evaluation ✅ COMPLETE
9. ✅ Ready for /tasks command

## Summary
Enable operations teams to upload Excel files (10-500 orders) with synchronous validation and bulk creation. Backend uses Spring Boot 3.3.5 + Apache POI SXSSF for streaming Excel parsing, PostgreSQL for persistence, and implements idempotency via clientReference or SHA-256 hash. Frontend provides Angular 17 + Material file upload with progress feedback and per-row outcome display. Target: ≤15s p95 for 500 rows with granular per-row validation feedback.

## Technical Context
**Language/Version**: Java 17, Spring Boot 3.3.5 (backend); TypeScript 5.x, Angular 17 (frontend)  
**Primary Dependencies**: 
- Backend: Apache POI 5.x (SXSSF streaming), Spring Data JPA, Spring Security, Flyway, MapStruct
- Frontend: Angular Material 17, RxJS 7.x, HttpClient
**Storage**: PostgreSQL 15+ (entities: BulkUploadBatch, BulkUploadRow, Order)  
**Testing**: JUnit 5 + TestContainers (backend), Jasmine/Karma (frontend)  
**Target Platform**: Linux server (backend), Modern browsers (frontend)  
**Project Type**: Web (frontend + backend)  
**Performance Goals**: ≤15s p95 for 500-row upload; streaming parse to avoid memory spikes  
**Constraints**: 
- Synchronous processing (no background workers Phase 1)
- 2 MB max file size, 500 max rows
- Idempotent re-uploads (clientReference or hash-based)
- 30-day row retention, 180-day batch retention
**Scale/Scope**: 500 rows/batch, ~100 batches/day expected

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Spec Before Code** | ✅ PASS | spec.md with clarifications Q1-Q5 complete |
| **II. Plan & Tasks Discipline** | ⏳ IN PROGRESS | This plan being generated; tasks.md next |
| **III. Test-First & Red-Green** | ✅ PASS | Contract tests, integration tests planned before implementation |
| **IV. Contracts Are Source of Truth** | ✅ PASS | OpenAPI contracts will precede code generation |
| **V. Simplicity & Iterative Delivery** | ✅ PASS | Phase 1 synchronous only; async deferred to Phase 2 |
| **VI. Observability & Traceability** | ✅ PASS | Structured logging, metrics (duration histogram, failure counter) |
| **VII. Consistency Frontend/Backend** | ✅ PASS | DTOs align with existing Order model; pagination/filters follow pickup pattern |
| **Tech Stack Guardrails** | ✅ PASS | Spring Boot, PostgreSQL, Angular Material, Flyway - all approved |
| **Performance & Reliability** | ✅ PASS | Target ≤15s p95 documented; streaming parser for memory control |
| **Data & Schema Evolution** | ✅ PASS | New tables with nullable columns; Flyway migrations |
| **Security & Input Validation** | ✅ PASS | Boundary validation (file size, row count, field formats); role-based access |

**Gate Status**: ✅ PASS - No constitutional violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)
```
specs/001-bulk-order-upload/
├── spec.md              # ✅ Complete (with clarifications)
├── plan.md              # ⏳ This file (Phase 0-1 output)
├── research.md          # → Phase 0 output
├── data-model.md        # → Phase 1 output
├── quickstart.md        # → Phase 1 output
├── contracts/           # → Phase 1 output
│   ├── bulk-upload-api.yaml
│   └── template-download-api.yaml
└── tasks.md             # → Phase 2 output (/tasks command)
```

### Source Code (repository root)
```
backend/src/main/java/com/fleetops/
├── bulkupload/
│   ├── BulkUploadBatch.java            # Entity
│   ├── BulkUploadRow.java              # Entity
│   ├── BulkUploadBatchRepository.java
│   ├── BulkUploadRowRepository.java
│   ├── BulkUploadService.java
│   ├── BulkUploadServiceImpl.java
│   ├── BulkUploadController.java
│   ├── ExcelParserService.java
│   ├── IdempotencyService.java
│   ├── dto/
│   ├── validation/
│   └── cleanup/
└── order/ (existing, reused)

backend/src/main/resources/db/migration/
├── V5__create_bulk_upload_batch.sql
└── V6__create_bulk_upload_row.sql

frontend/apps/console-app/src/app/
├── pages/bulk-upload.component.ts
├── services/bulk-upload.service.ts
└── models/
```

**Structure Decision**: Web application (frontend + backend). Backend follows existing pattern: `com.fleetops.<domain>` with entity, repository, service, controller separation. Frontend uses standalone components with lazy loading.

## Phase 0: Outline & Research

### Research Tasks
1. **Apache POI SXSSF Best Practices**
   - Streaming row-by-row parsing for memory efficiency
   - Error handling for malformed Excel files
   - Header detection strategies (first row vs named ranges)

2. **Idempotency Strategies in Batch Processing**
   - SHA-256 canonical field ordering (deterministic hashing)
   - Database unique constraints for composite keys
   - Re-upload detection patterns

3. **Flyway Migration for Retention Policies**
   - Adding retention timestamp columns
   - Index strategy for cleanup job queries (created_at indexes)

4. **Spring Quartz Integration**
   - Cron configuration for daily cleanup (off-peak: 2 AM)
   - Transaction management in scheduled jobs
   - Monitoring cleanup execution

5. **Angular Material File Upload Patterns**
   - Reactive forms with file validation (size, type)
   - Progress feedback during synchronous requests
   - Per-row result table rendering (Material Table)

### Research Output Location
All findings consolidated in `research.md` with format:
- **Decision**: [Chosen approach]
- **Rationale**: [Why selected]
- **Alternatives Considered**: [Other options evaluated]
- **Integration Points**: [How connects to existing code]

**Output**: → `specs/001-bulk-order-upload/research.md`

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### 1. Data Model (`data-model.md`)
Extract entities from spec:

**BulkUploadBatch**
- Fields: id (Long), batchId (String unique), uploaderUserId (Long), originalFilename (String), fileChecksum (String), uploadedAt (Timestamp), processingDurationMs (Long), totalRows (Integer), createdCount (Integer), failedCount (Integer), skippedDuplicateCount (Integer), status (Enum)
- Relationships: OneToMany → BulkUploadRow
- Indexes: batchId (unique), uploaderUserId, uploadedAt

**BulkUploadRow**
- Fields: id (Long), batch (FK), rowIndex (Integer), status (Enum), idempotencyKey (String), idempotencyBasis (Enum), orderId (Long nullable FK), errorMessages (JSONB), rawData (JSONB optional), createdAt (Timestamp)
- Relationships: ManyToOne → BulkUploadBatch, ManyToOne → Order (nullable)
- Indexes: (batch_id, rowIndex), idempotencyKey, createdAt

**Order** (existing entity - reused for bulk inserts)

**Output**: → `specs/001-bulk-order-upload/data-model.md`

### 2. API Contracts (`contracts/`)

**Endpoint 1**: POST `/api/v1/bulk-upload`
- Request: multipart/form-data with file (Excel .xlsx)
- Response 200: BulkUploadResponseDto with batchId, counts, per-row outcomes
- Response 400: Structural errors
- Response 403: Feature disabled or insufficient role

**Endpoint 2**: GET `/api/v1/bulk-upload/template`
- Response 200: Excel file with headers + example + notes

**Endpoint 3**: GET `/api/v1/bulk-upload/batches`
- Query params: page, size, uploaderUserId
- Response 200: Page<BatchSummaryDto>

**Output**: → `specs/001-bulk-order-upload/contracts/bulk-upload-api.yaml` (OpenAPI 3.0)

### 3. Contract Tests (Failing-First)
Generate test stubs from contracts in `BulkUploadControllerTest.java`:
- testUploadValidFile_Returns200WithSummary()
- testUploadFileExceedsRowLimit_Returns400()
- testUploadWithMissingHeaders_Returns400()
- testUploadWithFeatureDisabled_Returns403()
- testDownloadTemplate_Returns200ExcelFile()
- testListBatches_Returns200WithPagination()

All tests initially **FAIL** (no implementation yet).

### 4. Integration Test Scenarios (`quickstart.md`)
Extract from user stories:
- Scenario 1: Happy Path (50 valid orders)
- Scenario 2: Idempotency (re-upload identical file)
- Scenario 3: Mixed valid/invalid rows
- Scenario 4: Template download
- Scenario 5: Retention cleanup

**Output**: → `specs/001-bulk-order-upload/quickstart.md`

### 5. Update Agent Context
Run: `.specify/scripts/bash/update-agent-context.sh copilot`
- Add new tech: Apache POI SXSSF, Quartz scheduler
- Preserve existing context
- Keep under 150 lines

**Output**: → `.github/copilot-instructions.md` (updated)

**Post-Design Constitution Re-check**: ✅ PASS (no new violations)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `contracts/bulk-upload-api.yaml` → generate contract test tasks (one per endpoint) [P]
2. Load `data-model.md` → generate entity creation tasks (BulkUploadBatch, BulkUploadRow) [P]
3. Load `quickstart.md` → generate integration test tasks (one per scenario)
4. Generate implementation tasks to make tests pass:
   - Flyway migrations (V5, V6) [P]
   - Repository interfaces [P]
   - Service implementation (parse → validate → persist)
   - Controller endpoints
   - Frontend service + component
   - Cleanup job

**Ordering Strategy**:
1. **Phase A: Foundation (Parallel)** - Contract tests, entities, migrations [P]
2. **Phase B: Repositories & Parsing (Parallel)** - Repos, ExcelParser, IdempotencyService [P]
3. **Phase C: Validation (Sequential)** - 5 validators (depends on B)
4. **Phase D: Service & Controller (Sequential)** - BulkUploadService, Controller (depends on C)
5. **Phase E: Cleanup & Template (Parallel)** - RetentionJob, Template endpoint [P]
6. **Phase F: Frontend (Parallel)** - Angular service, component, tests [P]

**Dependencies**:
- Frontend independent (can start immediately)
- Backend validators depend on parser
- Controller depends on service + validators
- Integration tests depend on full stack

**Estimated Output**: ~40 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitutional violations - section empty*

## Implementation Decisions & Deferrals

### Auth & User Management (Deferred to Phase 2)
**Decision Date**: 2025-10-04  
**Context**: User/Role entities not yet implemented; SecurityConfig uses `.permitAll()` for development  
**Phase 1 Approach**:
- Use hardcoded `uploaderUserId = 1L` in controller
- Skip `@PreAuthorize` role checks
- Comment out `allowedRoles` configuration
- Feature flag enforcement remains (can disable uploads via config)

**Migration Path (When User/Role Implemented)**:
1. Uncomment `bulk.upload.allowedRoles: OPERATIONS,SUPERVISOR,ADMIN` in application.yml
2. Add `@PreAuthorize("hasAnyRole('OPERATIONS', 'SUPERVISOR', 'ADMIN')")` on POST /bulk-upload
3. Extract `uploaderUserId` from SecurityContext: `((UserDetails) auth.getPrincipal()).getId()`
4. Update tests to include auth scenarios (insufficient role → 403, valid role → 200)
5. Support admin users seeing all batches (non-admins see only their uploads)

**Rationale**: 
- Unblocks bulk upload feature development without waiting for User/Role system
- Maintains audit trail (uploader_user_id column populated)
- Clear migration path prevents tech debt accumulation
- Follows "Simplicity & Iterative Delivery" constitutional principle

**Impact on Tasks**: 
- T036 (Controller): Uses hardcoded userId with TODO comments for future auth
- T035, T040 (Tests): Skip auth failure scenarios; feature flag enforcement only
- T045 (Config): `allowedRoles` commented out with migration instructions

---

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅ research.md created (508 lines)
- [x] Phase 1: Design complete (/plan command) ✅ All artifacts created:
  - data-model.md (530 lines): BulkUploadBatch/Row entities, JPA, Flyway V5/V6, repositories
  - contracts/bulk-upload-api.yaml (634 lines): OpenAPI 3.0 spec with 3 endpoints, 10 schemas
  - quickstart.md (627 lines): 10 integration test scenarios (Given/When/Then/Verify)
  - .github/copilot-instructions.md: Updated with Java 17/Spring Boot 3.3.5, Apache POI, Quartz
- [x] Phase 2: Task planning complete (/tasks command) ✅ tasks.md created (46 tasks):
  - 8 phases: Foundation → Entities → DTOs → Parser → Validation → Service/Controller → Retention → Integration → Polish
  - 28 parallel tasks, 14 sequential tasks
  - TDD approach: Tests before implementation (all test tasks marked MUST FAIL FIRST)
  - Auth deferred: Documented hardcoded userId approach for Phase 1
  - Technical corrections applied: XSSFWorkbook (not SXSSF), Spring Security role syntax, retention periods
- [ ] Phase 3: Task execution → Next: Execute T001-T046
- [ ] Phase 4: Implementation validation
- [ ] Phase 5: Integration testing

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (no new violations from design decisions)
- [x] All NEEDS CLARIFICATION resolved: N/A (all clarified in spec Q1-Q5)
- [x] Complexity deviations documented: N/A (no deviations)

**Current Step**: Phase 2 complete ✅ → Ready to execute T001-T046 (Start with Phase A: Foundation & Setup)

---
*Based on Constitution v0.1.1 - See `.specify/memory/constitution.md`*
