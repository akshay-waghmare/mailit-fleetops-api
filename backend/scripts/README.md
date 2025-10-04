# 🧪 Testing Scripts

Node.js scripts for testing bulk order upload functionality.

## Prerequisites

```bash
cd backend
npm install
```

## Scripts

### 1. Generate Test Excel File

Creates a sample Excel file with 3 test orders for testing.

```bash
npm run generate-test-excel

# Or with custom filename
npm run generate-test-excel my-orders.xlsx
```

**Output:** `backend/test-data/test-orders.xlsx` with:
- Row 1: REF-001 (CLIENT_REFERENCE idempotency)
- Row 2: REF-002 (CLIENT_REFERENCE idempotency)  
- Row 3: No reference (HASH-based idempotency)

### 2. Test Upload

Uploads Excel file to bulk order API and displays results.

```bash
npm run test-upload

# Or with custom filename
npm run test-upload my-orders.xlsx
```

**Features:**
- ✅ Validates file existence
- ✅ Shows upload progress
- ✅ Displays response summary
- ✅ Pretty-prints row details
- ✅ Color-coded status indicators

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start backend (in another terminal)
./gradlew bootRun

# 3. Generate test file
npm run generate-test-excel

# 4. Test upload (first time - creates orders)
npm run test-upload

# 5. Test duplicate detection (second time - skips duplicates)
npm run test-upload
```

## Expected Results

### First Upload
```
✅ Upload successful!
   Batch ID: BU20251004-1430
   Total Rows: 3
   Created: 3
   Failed: 0
   Skipped: 0
```

### Second Upload (Same File)
```
✅ Upload successful!
   Batch ID: BU20251004-1431
   Total Rows: 3
   Created: 0
   Failed: 0
   Skipped: 3
```

## Verify in Database

```bash
# Check orders created
psql -U fleetops -d fleetops -c \
  "SELECT id, order_id, client_name, status FROM orders ORDER BY created_at DESC LIMIT 5;"

# Check batches
psql -U fleetops -d fleetops -c \
  "SELECT batch_id, total_rows, created_count, skipped_duplicate_count FROM bulk_upload_batch ORDER BY created_at DESC LIMIT 5;"
```

## Troubleshooting

### "Cannot find module 'exceljs'"
```bash
npm install
```

### "ECONNREFUSED localhost:8080"
```bash
# Start backend
./gradlew bootRun
```

### "File not found"
```bash
# Generate test file first
npm run generate-test-excel
```

## Script Details

- **generate-test-excel.js**: Creates Excel with 27 columns, proper headers, sample data
- **test-upload.js**: Uses axios + FormData for multipart upload, displays formatted results

## Dependencies

- `exceljs`: ^4.4.0 - Excel file generation
- `axios`: ^1.6.0 - HTTP client for API testing
