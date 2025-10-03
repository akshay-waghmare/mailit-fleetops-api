# 🚀 Bulk Upload - Next Steps

## ✅ Phase 1 Complete

- [x] Excel parser with header validation
- [x] Idempotency service (CLIENT_REFERENCE + HASH)
- [x] Batch and row persistence
- [x] REST API endpoint
- [x] Duplicate detection
- [x] Unit tests for parser and idempotency
- [x] Build passing
- [x] Documentation complete

## ✅ Phase 2 Complete

- [x] **Order Creation Integration** ← JUST COMPLETED!
- [x] BulkOrderMapper (DTO conversion)
- [x] OrderService integration
- [x] Real order IDs in response
- [x] Error handling for failed order creation
- [x] Logging for tracking
- [x] Build and tests passing

---

## 🎯 Phase 3 - Priority Tasks

### 🔴 Critical (Week 1)
- [ ] **Manual End-to-End Testing**
  - [ ] Create sample Excel file with 2-3 rows
  - [ ] Test happy path (all rows create orders)
  - [ ] Verify orders in database with real IDs
  - [ ] Test duplicate detection (same file twice)
  - [ ] Verify batch and row records
  - [ ] Test with Postman/cURL

- [ ] **Bean Validation**
  - [ ] Enable `@Valid` on CreateOrderDto in service
  - [ ] Add validation exception handler
  - [ ] Return validation errors in RowOutcomeDto.errors
  - [ ] Test with invalid data (missing fields, bad formats)

### 🟡 Important (Week 2)
- [ ] **Error Handling**
  - [ ] Global exception handler for ExcelParserException
  - [ ] Handle IOException, validation errors
  - [ ] Return proper HTTP status codes (400, 500)
  - [ ] Add error messages to batch when processing fails
  
- [ ] **Integration Tests**
  - [ ] Re-enable BulkUploadBatchRepositoryTest
  - [ ] Re-enable BulkUploadRowRepositoryTest
  - [ ] Add BulkUploadServiceTest (with mocked dependencies)
  - [ ] Add BulkUploadControllerTest (MockMvc)
  
- [ ] **Performance**
  - [ ] Test with 500+ row file
  - [ ] Add batch insert optimization if needed
  - [ ] Add file size validation (reject > 10MB)
  - [ ] Add row limit validation (reject > 1000 rows)

### 🟢 Nice to Have (Week 3)
- [ ] **Batch Retrieval APIs**
  - [ ] GET /api/v1/bulk/orders (list all batches)
  - [ ] GET /api/v1/bulk/orders/{batchId} (get batch details)
  - [ ] GET /api/v1/bulk/orders/{batchId}/rows (get row outcomes)
  
- [ ] **Async Processing**
  - [ ] Add @Async annotation for large files
  - [ ] Return 202 Accepted with batch ID immediately
  - [ ] Process in background thread
  - [ ] Add progress tracking (WebSocket/SSE)
  
- [ ] **Excel Template**
  - [ ] GET /api/v1/bulk/orders/template (download sample .xlsx)
  - [ ] Include header row with instructions
  - [ ] Add sample data rows

### ⚪ Future Enhancements (Week 4+)
- [ ] **Authentication**
  - [ ] Extract uploader user from security context
  - [ ] Replace hardcoded userId=1
  - [ ] Add permission checks
  
- [ ] **Audit Logging**
  - [ ] Log all bulk uploads with user info
  - [ ] Track who accessed batch/row data
  
- [ ] **Cleanup Job**
  - [ ] @Scheduled job to delete old batches (> 180 days)
  - [ ] @Scheduled job to delete old rows (> 30 days)
  - [ ] Configurable retention periods
  
- [ ] **Advanced Features**
  - [ ] CSV support (in addition to Excel)
  - [ ] Partial updates (PATCH existing orders)
  - [ ] Rollback/undo batch
  - [ ] Export batch results to Excel

---

## 🧪 Immediate Next Action

### Option A: Manual Testing (Recommended)
1. Start backend: `cd backend && ./gradlew bootRun`
2. Create `test-orders.xlsx` with 2 sample rows
3. Test upload: `curl -X POST http://localhost:8080/api/v1/bulk/orders -F "file=@test-orders.xlsx"`
4. Verify response and database records
5. Test duplicate detection by uploading same file again

### Option B: Continue Implementation
1. Create OrderService with minimal createOrder method
2. Wire into BulkUploadService
3. Update tests
4. Rebuild and test

### Option C: Add Validation
1. Create @ControllerAdvice exception handler
2. Add validation in BulkUploadService
3. Return detailed errors in response
4. Test with invalid data

---

## 📋 Testing Checklist (Before Phase 2 Merge)

- [ ] All unit tests pass
- [ ] Manual testing completed (happy path)
- [ ] Manual testing completed (duplicate detection)
- [ ] Manual testing completed (validation errors)
- [ ] Database schema verified
- [ ] API documented (Swagger/OpenAPI)
- [ ] Code reviewed
- [ ] Performance acceptable (< 5s for 500 rows)
- [ ] No memory leaks (tested with large files)
- [ ] Error handling tested (invalid files, missing headers)

---

## 📚 Reference Documents

- **Implementation Summary**: `BULK-UPLOAD-PHASE1-COMPLETE.md`
- **Testing Guide**: `BULK-UPLOAD-TEST-GUIDE.md`
- **Database Schema**: `src/main/resources/db/migration/V4__create_bulk_upload_tables.sql`
- **API Endpoint**: `POST /api/v1/bulk/orders`

---

## 🤔 Open Questions

1. **Order Service Integration**: Should we create a new OrderService or reuse existing one from order management module?
2. **Validation Strategy**: Should validation happen in parser (fail fast) or in service (allow partial success)?
3. **Async Threshold**: At what row count should we switch to async processing? (500? 1000?)
4. **File Retention**: How long should we keep uploaded Excel files? (Currently only checksum stored)
5. **Error Recovery**: Should failed batches be retryable? Or manual re-upload only?

---

**Status**: Phase 1 ✅ Complete | Phase 2 🟡 Ready to Start  
**Recommendation**: Start with **Manual Testing** to validate Phase 1, then proceed with **Order Creation**  
**Date**: October 4, 2025
