# Bulk Upload Testing Guide

## 📋 Overview
This guide provides step-by-step instructions for manually testing the bulk order upload feature.

## ✅ Current Implementation Status (Phase 1)

### Completed:
- ✅ Excel parser with validation
- ✅ Idempotency service (CLIENT_REFERENCE and HASH-based)
- ✅ Batch and Row persistence
- ✅ Duplicate detection
- ✅ REST API endpoint: `POST /api/v1/bulk/orders`
- ✅ Response DTOs with detailed outcomes

### Not Yet Implemented (Phase 2):
- ⏳ Actual Order entity creation (currently rows marked as CREATED without real orders)
- ⏳ Bean validation on DTOs
- ⏳ Advanced error handling
- ⏳ Async processing for large files

---

## 📁 Excel File Format

### Required Columns (19 columns)

| # | Column Name | Required | Example | Validation |
|---|------------|----------|---------|------------|
| 1 | clientReference | Optional (but recommended) | `REF-001` | Max 100 chars |
| 2 | clientName | **Yes** | `ABC Corp` | Max 255 chars |
| 3 | clientCompany | Optional | `ABC Industries` | Max 255 chars |
| 4 | contactNumber | Optional | `+91-9876543210` | Max 20 chars |
| 5 | senderName | **Yes** | `John Doe` | Max 255 chars |
| 6 | senderAddress | **Yes** | `123 Main St, Mumbai` | Max 1000 chars |
| 7 | senderContact | **Yes** | `+91-9876543210` | Max 20 chars |
| 8 | senderEmail | Optional | `john@example.com` | Valid email |
| 9 | receiverName | **Yes** | `Jane Smith` | Max 255 chars |
| 10 | receiverAddress | **Yes** | `456 Park Ave, Delhi` | Max 1000 chars |
| 11 | receiverContact | **Yes** | `+91-9123456789` | Max 20 chars |
| 12 | receiverEmail | Optional | `jane@example.com` | Valid email |
| 13 | receiverPincode | **Yes** | `110001` | 6 digits |
| 14 | receiverCity | **Yes** | `Delhi` | Max 100 chars |
| 15 | receiverState | Optional | `Delhi` | Max 100 chars |
| 16 | itemCount | **Yes** | `1` | Integer ≥ 1 |
| 17 | totalWeight | **Yes** | `2.5` | 0.01-999.99 kg |
| 18 | lengthCm | Optional | `30` | 0.1-999.9 cm |
| 19 | widthCm | Optional | `20` | 0.1-999.9 cm |
| 20 | heightCm | Optional | `15` | 0.1-999.9 cm |
| 21 | itemDescription | Optional | `Electronics` | Max 500 chars |
| 22 | declaredValue | Optional | `25000` | 0-100000 |
| 23 | serviceType | **Yes** | `express` | express/standard/economy |
| 24 | carrierName | **Yes** | `Blue Dart` | Max 100 chars |
| 25 | carrierId | Optional | `BD001` | Max 64 chars |
| 26 | codAmount | Optional | `0` | 0-50000 |
| 27 | specialInstructions | Optional | `Handle with care` | Max 1000 chars |

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path (2 rows, unique client references)
**Excel Content:**
```
Row 1: clientReference=REF-001, senderName=Sender A, receiverName=Receiver A, receiverPincode=400001, receiverCity=Mumbai, ...
Row 2: clientReference=REF-002, senderName=Sender B, receiverName=Receiver B, receiverPincode=560001, receiverCity=Bangalore, ...
```

**Expected Result:**
- HTTP 200
- batchId: `BU20251004-HHMM`
- totalRows: 2
- created: 2
- failed: 0
- skippedDuplicate: 0
- Each row has: status=CREATED, idempotencyBasis=CLIENT_REFERENCE

---

### Scenario 2: Duplicate Detection (same clientReference)
**Excel Content:**
```
Row 1: clientReference=REF-001, ...
Row 2: clientReference=REF-001, ... (same reference)
```

**Expected Result:**
- HTTP 200
- created: 1
- skippedDuplicate: 1
- Row 2 has: status=SKIPPED_DUPLICATE, idempotencyBasis=CLIENT_REFERENCE

---

### Scenario 3: Hash-based Idempotency (no clientReference)
**Excel Content:**
```
Row 1: clientReference=(blank), senderName=Sender A, receiverName=Receiver A, ...
Row 2: clientReference=(blank), senderName=Sender A, receiverName=Receiver A, ... (same data)
```

**Expected Result:**
- created: 1
- skippedDuplicate: 1
- Row 1 has: status=CREATED, idempotencyBasis=HASH
- Row 2 has: status=SKIPPED_DUPLICATE, idempotencyBasis=HASH

---

### Scenario 4: Missing Required Headers
**Excel Content:**
```
(Header row missing "receiverCity" column)
```

**Expected Result:**
- HTTP 400 or parser exception
- Error message indicating missing required header

---

### Scenario 5: Large File (500 rows)
**Excel Content:**
```
500 valid rows
```

**Expected Result:**
- HTTP 200
- totalRows: 500
- created: 500
- Processing time < 5 seconds

---

## 🧰 Testing Steps

### Step 1: Start Backend
```bash
cd backend
docker compose up -d postgres
./gradlew bootRun
```

### Step 2: Create Test Excel File
Create `test-orders.xlsx` with at least the required columns and 2-3 sample rows.

**Minimal Sample Row:**
```
REF-001 | ABC Corp | | | John Doe | 123 Main St | +919876543210 | | Jane Smith | 456 Park Ave | +919123456789 | | 110001 | Delhi | | 1 | 2.5 | | | | Electronics | 25000 | express | Blue Dart | | 0 |
```

### Step 3: Test with cURL
```bash
# Test 1: Upload file
curl -X POST http://localhost:8080/api/v1/bulk/orders \
  -F "file=@test-orders.xlsx" \
  -H "Content-Type: multipart/form-data" \
  | jq

# Expected Response:
# {
#   "batchId": "BU20251004-1430",
#   "totalRows": 2,
#   "created": 2,
#   "failed": 0,
#   "skippedDuplicate": 0,
#   "processingDurationMs": 250,
#   "rows": [
#     {
#       "rowIndex": 1,
#       "status": "CREATED",
#       "idempotencyBasis": "CLIENT_REFERENCE",
#       "orderId": null,
#       "errors": []
#     },
#     ...
#   ]
# }

# Test 2: Upload same file again (test duplicate detection)
curl -X POST http://localhost:8080/api/v1/bulk/orders \
  -F "file=@test-orders.xlsx" \
  | jq

# Expected: All rows should be SKIPPED_DUPLICATE
```

### Step 4: Test with Postman
1. **Create new request**: POST `http://localhost:8080/api/v1/bulk/orders`
2. **Body**: form-data
3. **Key**: `file` (type: File)
4. **Value**: Select `test-orders.xlsx`
5. **Send** and verify response

---

## 🔍 Verification Queries

### Check Batch Records
```sql
SELECT * FROM bulk_upload_batch 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Row Records
```sql
SELECT 
    r.row_index,
    r.status,
    r.idempotency_basis,
    r.idempotency_key,
    r.order_id
FROM bulk_upload_row r
JOIN bulk_upload_batch b ON r.batch_id = b.id
WHERE b.batch_id = 'BU20251004-1430'
ORDER BY r.row_index;
```

### Check Duplicate Detection
```sql
SELECT 
    idempotency_key,
    COUNT(*) as occurrence_count,
    STRING_AGG(CAST(row_index AS TEXT), ', ') as row_indexes
FROM bulk_upload_row
GROUP BY idempotency_key
HAVING COUNT(*) > 1;
```

---

## 📊 Performance Benchmarks

| File Size | Rows | Expected Time | Memory |
|-----------|------|---------------|--------|
| < 100KB | 10 | < 500ms | < 50MB |
| ~ 1MB | 100 | < 1s | < 100MB |
| ~ 5MB | 500 | < 5s | < 200MB |

---

## 🐛 Troubleshooting

### Issue: "Required header 'XXX' is missing"
**Solution**: Ensure Excel file has all required column headers in the first row.

### Issue: "No suitable JDK found"
**Solution**: Set `JAVA_HOME` to JDK 21 installation path.

### Issue: Database connection refused
**Solution**: 
```bash
docker compose up -d postgres
# Wait 5 seconds for PostgreSQL to start
./gradlew flywayMigrate
```

### Issue: "Failed to compute file checksum"
**Solution**: Ensure file is a valid Excel file (.xlsx) and not corrupted.

---

## 📝 Next Steps (Phase 2)

1. **Add actual Order creation**: Currently rows are marked as CREATED but no Order entity is persisted
2. **Add validation**: Integrate Jakarta Bean Validation on DTOs
3. **Add error handling**: Return detailed validation errors for failed rows
4. **Add async processing**: For files > 1000 rows
5. **Add progress tracking**: WebSocket/SSE for real-time upload status
6. **Add file size limits**: Reject files > 10MB
7. **Add authentication**: Capture real uploader user info

---

**Version**: 1.0  
**Last Updated**: October 4, 2025  
**Status**: Phase 1 Complete - Ready for Manual Testing
