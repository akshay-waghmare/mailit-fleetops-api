# 🧪 Manual Testing Guide - Step by Step

## Prerequisites

### Required Tools
- ✅ Java 21 (for backend)
- ✅ PostgreSQL 15.4 (running via Docker)
- ✅ Python 3.x with openpyxl (for Excel generation)
- ✅ curl or Postman (for API testing)
- ✅ jq (optional, for pretty JSON output)
- ✅ psql (for database verification)

### Install Python Dependencies (if needed)
```bash
pip install openpyxl
```

---

## 🚀 Step 1: Start Backend Services

### 1.1 Start PostgreSQL (if not running)
```bash
cd backend
docker compose -f docker-compose.yml up -d postgres

# Wait for PostgreSQL to be ready
sleep 5

# Verify PostgreSQL is running
docker compose ps
```

### 1.2 Run Database Migrations
```bash
./gradlew flywayMigrate

# Expected output: "Successfully applied X migrations"
```

### 1.3 Start Spring Boot Backend
```bash
# In one terminal
./gradlew bootRun

# Wait for:
# "Started FleetopsBackendApplication in X seconds"
```

### 1.4 Verify Backend is Running
```bash
# In another terminal
curl http://localhost:8080/actuator/health

# Expected: {"status":"UP"}
```

---

## 📁 Step 2: Generate Test Excel File

### Option A: Using Python Script (Recommended)
```bash
cd backend
python3 create-test-excel.py

# Output:
# ✅ Test Excel file created: test-orders.xlsx
# 📊 Contains 3 test rows
```

### Option B: Manual Creation
1. Open Excel/Google Sheets/LibreOffice Calc
2. Copy data from `backend/src/test/resources/sample-orders.csv`
3. Paste into new spreadsheet
4. Save as `test-orders.xlsx`

### Verify File Created
```bash
ls -lh test-orders.xlsx

# Should show file size ~8-10 KB
```

---

## 🧪 Step 3: Test Upload (Happy Path)

### 3.1 Upload Excel File
```bash
curl -X POST http://localhost:8080/api/v1/bulk/orders \
  -F "file=@test-orders.xlsx" \
  -H "Accept: application/json" \
  | jq
```

### Expected Response
```json
{
  "batchId": "BU20251004-1430",
  "totalRows": 3,
  "created": 3,
  "failed": 0,
  "skippedDuplicate": 0,
  "processingDurationMs": 250,
  "rows": [
    {
      "rowIndex": 1,
      "status": "CREATED",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": 1,
      "errors": []
    },
    {
      "rowIndex": 2,
      "status": "CREATED",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": 2,
      "errors": []
    },
    {
      "rowIndex": 3,
      "status": "CREATED",
      "idempotencyBasis": "HASH",
      "orderId": 3,
      "errors": []
    }
  ]
}
```

### ✅ Success Criteria
- ✅ HTTP 200 response
- ✅ `created: 3` (all rows created)
- ✅ `failed: 0` (no failures)
- ✅ `skippedDuplicate: 0` (first upload)
- ✅ All rows have real `orderId` (not null)
- ✅ Row 1 & 2: `idempotencyBasis: "CLIENT_REFERENCE"`
- ✅ Row 3: `idempotencyBasis: "HASH"` (no clientReference)

---

## 🔄 Step 4: Test Duplicate Detection

### 4.1 Upload Same File Again
```bash
curl -X POST http://localhost:8080/api/v1/bulk/orders \
  -F "file=@test-orders.xlsx" | jq
```

### Expected Response
```json
{
  "batchId": "BU20251004-1431",
  "totalRows": 3,
  "created": 0,
  "failed": 0,
  "skippedDuplicate": 3,
  "processingDurationMs": 150,
  "rows": [
    {
      "rowIndex": 1,
      "status": "SKIPPED_DUPLICATE",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": 1,
      "errors": []
    },
    {
      "rowIndex": 2,
      "status": "SKIPPED_DUPLICATE",
      "idempotencyBasis": "CLIENT_REFERENCE",
      "orderId": 2,
      "errors": []
    },
    {
      "rowIndex": 3,
      "status": "SKIPPED_DUPLICATE",
      "idempotencyBasis": "HASH",
      "orderId": 3,
      "errors": []
    }
  ]
}
```

### ✅ Success Criteria
- ✅ HTTP 200 response
- ✅ `created: 0` (nothing new created)
- ✅ `skippedDuplicate: 3` (all duplicates)
- ✅ All rows have status `"SKIPPED_DUPLICATE"`
- ✅ Order IDs match first upload (1, 2, 3)

---

## 🗄️ Step 5: Verify Database Records

### 5.1 Check Bulk Upload Batches
```bash
psql -U fleetops -d fleetops -c \
  "SELECT batch_id, total_rows, created_count, failed_count, skipped_duplicate_count, status, file_name 
   FROM bulk_upload_batch 
   ORDER BY created_at DESC 
   LIMIT 5;"
```

### Expected Output
```
 batch_id       | total_rows | created | failed | skipped | status    | file_name
----------------+------------+---------+--------+---------+-----------+------------------
 BU20251004-1431|     3      |    0    |   0    |    3    | COMPLETED | test-orders.xlsx
 BU20251004-1430|     3      |    3    |   0    |    0    | COMPLETED | test-orders.xlsx
```

### 5.2 Check Bulk Upload Rows
```bash
psql -U fleetops -d fleetops -c \
  "SELECT b.batch_id, r.row_index, r.status, r.idempotency_basis, r.order_id
   FROM bulk_upload_row r
   JOIN bulk_upload_batch b ON r.batch_id = b.id
   WHERE b.batch_id LIKE 'BU20251004%'
   ORDER BY b.created_at DESC, r.row_index;"
```

### Expected Output
```
 batch_id       | row_index | status             | idempotency_basis | order_id
----------------+-----------+--------------------+-------------------+----------
 BU20251004-1431|     1     | SKIPPED_DUPLICATE  | CLIENT_REFERENCE  |    1
 BU20251004-1431|     2     | SKIPPED_DUPLICATE  | CLIENT_REFERENCE  |    2
 BU20251004-1431|     3     | SKIPPED_DUPLICATE  | HASH              |    3
 BU20251004-1430|     1     | CREATED            | CLIENT_REFERENCE  |    1
 BU20251004-1430|     2     | CREATED            | CLIENT_REFERENCE  |    2
 BU20251004-1430|     3     | CREATED            | HASH              |    3
```

### 5.3 Check Created Orders
```bash
psql -U fleetops -d fleetops -c \
  "SELECT id, order_id, client_name, receiver_name, receiver_city, status, service_type, carrier_name, tracking_number
   FROM orders 
   WHERE id IN (1, 2, 3) 
   ORDER BY id;"
```

### Expected Output
```
 id | order_id  | client_name  | receiver_name | receiver_city | status  | service_type | carrier_name | tracking_number
----+-----------+--------------+---------------+---------------+---------+--------------+--------------+------------------
  1 | ORD000001 | ABC Corp     | Jane Smith    | Delhi         | PENDING | EXPRESS      | Blue Dart    | BD1234567890
  2 | ORD000002 | XYZ Ltd      | Bob Green     | Bangalore     | PENDING | STANDARD     | DTDC         | DT1234567890
  3 | ORD000003 | LMN Pvt Ltd  | Diana Prince  | Hyderabad     | PENDING | ECONOMY      | India Post   | IP1234567890
```

### 5.4 Check Order Status History
```bash
psql -U fleetops -d fleetops -c \
  "SELECT h.order_id, o.order_id as order_num, h.from_status, h.to_status, h.changed_by, h.reason
   FROM order_status_history h
   JOIN orders o ON h.order_id = o.id
   WHERE o.id IN (1, 2, 3)
   ORDER BY h.order_id, h.changed_at;"
```

### Expected Output
```
 order_id | order_num | from_status | to_status | changed_by | reason
----------+-----------+-------------+-----------+------------+------------------
    1     | ORD000001 | null        | PENDING   | System     | Order created
    2     | ORD000002 | null        | PENDING   | System     | Order created
    3     | ORD000003 | null        | PENDING   | System     | Order created
```

---

## 🎯 Step 6: Verify Idempotency Keys

### 6.1 Check CLIENT_REFERENCE Idempotency
```bash
psql -U fleetops -d fleetops -c \
  "SELECT idempotency_key, idempotency_basis, COUNT(*) as usage_count
   FROM bulk_upload_row
   WHERE idempotency_key IN ('REF-001', 'REF-002')
   GROUP BY idempotency_key, idempotency_basis;"
```

### Expected Output
```
 idempotency_key | idempotency_basis | usage_count
-----------------+-------------------+-------------
 REF-001         | CLIENT_REFERENCE  |      2
 REF-002         | CLIENT_REFERENCE  |      2
```

### 6.2 Check HASH Idempotency
```bash
psql -U fleetops -d fleetops -c \
  "SELECT LEFT(idempotency_key, 20) as key_prefix, idempotency_basis, COUNT(*) as usage_count
   FROM bulk_upload_row
   WHERE idempotency_basis = 'HASH'
   GROUP BY idempotency_key, idempotency_basis;"
```

### Expected Output
```
 key_prefix           | idempotency_basis | usage_count
----------------------+-------------------+-------------
 <64-char-sha256-hash>| HASH              |      2
```

---

## 📊 Step 7: Test with Postman (Optional)

### 7.1 Create Postman Request
1. **Method**: POST
2. **URL**: `http://localhost:8080/api/v1/bulk/orders`
3. **Body**: form-data
   - Key: `file` (type: File)
   - Value: Select `test-orders.xlsx`
4. **Send** → Verify JSON response

### 7.2 Save Collection
Export Postman collection for future testing

---

## 🐛 Troubleshooting

### Issue: "Connection refused" on port 8080
**Solution**: 
```bash
# Check if backend is running
ps aux | grep java

# Restart backend
./gradlew bootRun
```

### Issue: "File not found"
**Solution**:
```bash
# Verify file exists
ls -lh test-orders.xlsx

# Use absolute path
curl -X POST http://localhost:8080/api/v1/bulk/orders \
  -F "file=@$(pwd)/test-orders.xlsx"
```

### Issue: Database connection error
**Solution**:
```bash
# Check PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# Run migrations
./gradlew flywayMigrate
```

### Issue: "Required header missing"
**Solution**: Excel file must have all 27 column headers in the first row. Regenerate file with Python script.

---

## ✅ Testing Checklist

- [ ] Backend started successfully
- [ ] PostgreSQL running and migrations applied
- [ ] Test Excel file generated (3 rows)
- [ ] First upload: 3 orders created (HTTP 200)
- [ ] Response shows real order IDs (not null)
- [ ] Orders exist in `orders` table
- [ ] Order status history created
- [ ] Second upload: 3 duplicates skipped (HTTP 200)
- [ ] No new orders created on duplicate upload
- [ ] Batch records show correct counts
- [ ] Row records show idempotency keys
- [ ] CLIENT_REFERENCE rows use reference as key
- [ ] HASH row uses SHA-256 hash as key

---

## 📸 Expected Results Summary

| Test Case | Expected Result |
|-----------|----------------|
| First Upload (3 rows) | ✅ 3 orders created, orderId 1-3 |
| Second Upload (same file) | ✅ 0 created, 3 skipped |
| Database - orders table | ✅ 3 order records with PENDING status |
| Database - bulk_upload_batch | ✅ 2 batch records (COMPLETED) |
| Database - bulk_upload_row | ✅ 6 row records (3 CREATED, 3 SKIPPED) |
| Idempotency - REF-001 | ✅ Used 2 times (both batches) |
| Idempotency - Row 3 (no ref) | ✅ HASH basis, same hash both times |

---

## 🎊 Success!

If all checks pass, you have successfully validated:
- ✅ Excel parsing
- ✅ Order creation
- ✅ Idempotency (CLIENT_REFERENCE + HASH)
- ✅ Duplicate detection
- ✅ Database persistence
- ✅ Status tracking
- ✅ Error handling

**Your bulk upload feature is production-ready!** 🚀

---

**Document Version**: 1.0  
**Test Date**: October 4, 2025  
**Status**: Ready for Execution
