# Feature Specification: Bulk Order Upload (Excel)

**ID**: 001-bulk-order-upload  
**Status**: Draft  
**Owner**: TBD  
**Last Updated**: 2025-10-03

## 1. Overview
Operations teams currently create orders individually, which is slow for batch shipping scenarios (campaigns, marketplace settlements, seasonal spikes). This feature enables uploading an Excel (.xlsx) file containing multiple orders, validating rows, and creating orders in bulk with granular per-row feedback.

## Clarifications
### Session 2025-10-03
- Q1: How should idempotency / uniqueness be enforced for each uploaded row?
  - A1: Prefer `clientReference` when present; if absent compute deterministic SHA-256 hash over canonical fields `(clientId|senderName|receiverName|receiverPincode|itemCount|totalWeight|serviceType)`. Use that as idempotency key. Re-uploads with identical basis become `SKIPPED_DUPLICATE`.
  - Impact: `clientReference` becomes *recommended* not strictly required; idempotency always available. Spec sections updated: Functional Requirements (Required vs Recommended), Validation Layers (Idempotency), Acceptance Criteria, Glossary.
- Q2: What retention policy for batch & row records?
  - A2: Adopt unified retention: Row details retained 180 days; batch metadata retained 180 days. Both windows configurable via properties (`bulk.upload.retention.rows.days`, `bulk.upload.retention.batches.days`). Scheduled cleanup job runs daily (off-peak) removing expired rows then pruning empty batches. Metrics exclude purged historical data beyond retention.
  - Impact: Constraints & Assumptions updated (retention + config keys); Acceptance Criteria adds verification of cleanup scheduling; Risks updated (misconfiguration). Open Questions list pruned.
- Q3: Case sensitivity rule for duplicate in-file detection (receiverName / receiverCity)?
  - A3: Apply case-insensitive comparison for `receiverName` and `receiverCity` only. Normalization: trim whitespace, collapse internal whitespace to single space, lowercase for comparison. Store original values. This limits scope vs full address normalization while preventing obvious duplicates (`"ACME Corp" vs "acme corp"` or `"New York  " vs "new york"`).
  - Impact: Validation Layers (Duplication) updated; Constraints adds normalization scope; Acceptance Criteria adds duplication detection test; Risks notes scope exclusion of full postal normalization.
- Q4: Role-based restriction scope (ROLE_OPERATIONS, ROLE_SUPERVISOR?)?
  - A4: Introduce feature flag (`bulk.upload.enabled`) default `true`. When enabled, access gated by optional role whitelist config (`bulk.upload.allowedRoles`). If list empty/absent: all authenticated users; if populated: user must possess at least one listed role. Enables production ramp-up control and future RBAC refinement. Existing role naming confirmed: `ROLE_OPERATIONS`, `ROLE_SUPERVISOR`, `ROLE_ADMIN`.
  - Impact: Constraints adds feature flag + role list config; Acceptance Criteria adds authorization test; Risks updated (misconfigured roles). Open Questions pruned.
- Q5: Max allowable `declaredValue` threshold triggering validation failure?
  - A5: Introduce configurable threshold `bulk.upload.declaredValue.max` (default `100000` units). Rows exceeding threshold fail validation with code `DECLARED_VALUE_EXCEEDS_LIMIT`. Rationale: balance operational flexibility and fraud risk mitigation. Threshold adjustable per business policy without code changes.
  - Impact: Validation Layers (Business Rules) updated; Constraints adds config key; Acceptance Criteria adds threshold test; Risks adds policy misconfiguration; Open Questions pruned.

## 2. Goals
- Create 10–500 orders in a single interaction.
- Provide deterministic validation feedback per row (no silent skips).
- Guarantee idempotency: re-uploading same logical data does not duplicate orders.
- Establish an auditable batch record for future analytics / troubleshooting.

## 3. Non-Goals (Phase 1)
- CSV / TSV support (future enhancement).
- Asynchronous background worker (synchronous request only within defined limits).
- Email or notification center alerts (UI-only summary).
- Bulk status updates or cancellations (out of scope here).
- Advanced pricing optimization or rate shopping.

## 4. User Stories
1. As an operations associate, I can download a blank Excel template with headers & example row.
2. As an operations associate, I can upload a filled template and get a processing summary (created / failed / duplicates) with per-row messages.
3. As an operations associate, I can correct failed rows and safely re-upload without creating duplicates.
4. As a supervisor, I can retrieve a list of past bulk uploads with key metrics (counts, duration, who executed it) — (may be deferred to Phase 2 if needed).
5. As the system, I reject files exceeding size/row limits with a clear error before processing rows.

## 5. Functional Requirements
- Accept only `.xlsx` format; enforce max file size (default 2 MB) & max data rows (default 500).
- Required Columns (align with existing Order DTO fields):
  - senderName, senderAddress, senderContact
  - receiverName, receiverAddress, receiverCity, receiverPincode
  - itemCount (>=1), totalWeight (>0)
  - serviceType (enum: express|standard|economy)
  - declaredValue (optional)
  - codAmount (optional; required if COD service type emerges)
  - specialInstructions (optional)
- Recommended Column:
  - clientReference (preferred business idempotency key; absence triggers fallback hash)
- Validation Layers:
  1. Structural: Presence of all required headers; missing required header → reject whole file. If `clientReference` column absent, proceed with warning (not error).
  2. Field Format: Data type, length (e.g., pincode length), enum membership.
  3. Business Rules: itemCount >=1, totalWeight > 0, conditional COD logic, `declaredValue` <= configurable max threshold (default 100000).
  4. Duplication (in-file): duplicate `clientReference` (when present) OR duplicate composite `(receiverName+receiverPincode+totalWeight+itemCount)` flagged. For comparison: `receiverName` and `receiverCity` normalized (trim, collapse whitespace, lowercase); original values stored.
  5. Idempotency (system):
     - If `clientReference` present → key = `(clientId, clientReference)`.
     - Else fallback key = SHA-256 `(clientId|senderName|receiverName|receiverPincode|itemCount|totalWeight|serviceType)`.
     - Existing key → mark row `SKIPPED_DUPLICATE`.
- Processing Behavior:
  - Phase 1: Synchronous parse + process; only catastrophic structural errors abort entire batch.
  - Each valid, non-duplicate row creates a new order with generated internal orderId.
  - Response object includes: `batchId`, counts (total / created / failed / skippedDuplicate), per-row outcomes (index, status, errorMessages[], idempotencyBasis = `clientReference` | `hash`), `processingDurationMs`.
- Persistence:
  - Batch metadata: `batchId`, `uploaderUserId`, `originalFilename`, `createdAt`, totals, duration, file checksum.
  - Row details: store at least failed & duplicate rows; optionally all rows (decision deferred to plan—cost analysis). Always store idempotency key used.
- Template Download Endpoint (Phase 1 optional but preferred): returns Excel with headers, example row, and notes sheet explaining recommended `clientReference` usage and hash fallback.

## 6. Constraints & Assumptions
- Throughput target: ≤15s p95 for 500 rows on baseline environment; if exceeded, async ingestion will be evaluated in Phase 2.
- Excel parsing library: must support streaming / low memory mode (Apache POI SXSSF or equivalent) though 500-row cap makes memory risk low initially.
- Multi-tenant (clientId) context available from authenticated session or provided explicitly in request.
- Ordering of rows preserved in result output for user correlation.
- No partial rollback option; each successful row commits independently.
- Retention: row-level details (failed, duplicate, optionally success) retained **180 days**; batch metadata **180 days**. Configurable via `bulk.upload.retention.rows.days` & `bulk.upload.retention.batches.days` (integers >0). Daily cleanup job (cron/off-peak) required.
- Normalization scope: Limited to `receiverName` and `receiverCity` (trim, collapse whitespace, lowercase for comparison only). Full postal address normalization out of scope Phase 1.
- Access control: Feature flag `bulk.upload.enabled` (default `true`). Optional role whitelist `bulk.upload.allowedRoles` (comma-separated; if empty: all authenticated users; if populated: user must have ≥1 listed role). Supported roles: `ROLE_OPERATIONS`, `ROLE_SUPERVISOR`, `ROLE_ADMIN`.
- Declared value limit: Configurable `bulk.upload.declaredValue.max` (default `100000`). Rows exceeding threshold fail validation.

## 7. Acceptance Criteria
- Valid 50-row file (no `clientReference` values): 50 CREATED; each row shows `idempotencyBasis=hash`; total processing <5s.
- Re-upload identical file (hash-only): 0 CREATED; all rows `SKIPPED_DUPLICATE`.
- File missing required header: request rejected; error lists missing headers.
- Mixed valid/invalid rows: valid rows CREATED; invalid rows FAILED_VALIDATION with explicit codes (e.g., `MISSING_RECEIVER_PINCODE`, `INVALID_ENUM_SERVICE_TYPE`, `DECLARED_VALUE_EXCEEDS_LIMIT`).
- Idempotency test: initial upload with half rows lacking clientReference, second upload adds clientReference only to half of previously processed hash-based rows → only those with changed basis are CREATED.
- Duplication test: File with two rows differing only in `receiverName` casing/whitespace (`"ACME Corp"` vs `"acme  corp"`) → second row flagged as duplicate; original values preserved in storage.
- Declared value test: Row with `declaredValue=150000` (exceeding default threshold 100000) → FAILED_VALIDATION with code `DECLARED_VALUE_EXCEEDS_LIMIT`.
- Authorization test: User lacking required role (when `bulk.upload.allowedRoles` populated) → HTTP 403 Forbidden. User with `ROLE_OPERATIONS` (when whitelisted) → upload proceeds.
- Feature flag test: `bulk.upload.enabled=false` → endpoint returns HTTP 503 Service Unavailable or 403 with message indicating feature disabled.
- Template (if implemented) downloadable with header definitions & idempotency guidance.
- Retention test: After simulating passage beyond configured row retention (time travel in integration test or manual SQL), cleanup job removes expired row details while preserving batch metadata until its own retention threshold.

## 8. Metrics & Observability
- Log events: bulk_upload_started, bulk_upload_row_processed (only on failure or debug mode), bulk_upload_completed.
- Capture metrics: processingDurationMs histogram, gauge for last successful batch timestamp, counter for failed rows.

## 9. Open Questions (For /clarify)
- Handling / sanitization policy for `specialInstructions` (PII or length constraints finalization; proposed max 500 chars plain text, trim whitespace, disallow control characters).

## 10. Out of Scope (Phase 1 Recap)
- CSV support, asynchronous processing, UI historical batch list (unless trivial), multi-file upload, address normalization, advanced pricing logic.

## 11. Success Metrics
- ≥80% reduction in elapsed time to create 100 orders (baseline vs after feature).
- <2% unexpected validation failure rate after 2 weeks (excluding deliberate test errors).
- Idempotent re-upload yields 0 unintended duplicates across all integration tests.

## 12. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Header mismatch confusion | User friction | Provide downloadable template + explicit header diffs |
| Duplicate order creation | Inventory / billing errors | Strong idempotency key & checksum pre-check |
| Large row latency | Poor UX | Cap rows & performance test early; consider chunk processing |
| Validation complexity creep | Delays | Phase validations (structural → business) & short-circuit structural errors |
| Future async migration rework | Re-architecture | Design batch schema with status field + process state from start |
| Retention misconfiguration (overgrowth) | Storage bloat | Config defaults + daily cleanup job + monitoring of record counts |
| Normalization scope creep | Complexity / delays | Limit to receiverName/receiverCity only; defer full postal normalization |
| Role misconfiguration (lockout) | Access denial | Default to open (empty allowedRoles list); document role setup; monitoring |
| Declared value policy drift | Business risk exposure | Make threshold configurable; document business rationale; periodic review |

## 13. Glossary
- **Batch**: Upload grouping for one file.
- **Row Outcome**: Per-row processing result including status + errors.
- **Idempotency Key**: `(clientId, clientReference)` when provided OR SHA-256 hash over canonical fields when absent.
- **Idempotency Basis**: Which mechanism was used (`clientReference` vs `hash`).

---
*Next:* Run `/clarify` to resolve open questions, then `/plan` to generate architecture tasks (entities: BulkUploadBatch, BulkUploadRow; endpoints; validation strategy; frontend component). After plan approval → `/tasks`.
