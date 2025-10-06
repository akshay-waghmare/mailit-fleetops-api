# 🔨 Backend Implementation Guide - Validators & APIs

**Status**: Frontend UI Complete ✅ | Backend Core Complete ✅  
**Next**: Validators + Batch Management APIs  
**Time Estimate**: 2-3 hours

---

## 📋 Overview

The frontend is now complete and ready to use. The backend needs:
1. **Validation Layers** (4 validators) - PRIORITY
2. **Batch Management APIs** (2 endpoints) - User features
3. **Configuration** - Fine-tuning

---

## 🎯 Task Breakdown

### **Priority 1: Validation Layers** (2 hours)

#### Task 1.1: StructuralValidator (30 mins)
**File**: `backend/src/main/java/com/fleetops/bulkupload/validation/StructuralValidator.java`

```java
package com.fleetops.bulkupload.validation;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.dto.ValidationErrorDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class StructuralValidator {
    
    public List<ValidationErrorDto> validate(CreateOrderDto dto) {
        List<ValidationErrorDto> errors = new ArrayList<>();
        
        // Check required fields
        if (dto.getSenderName() == null || dto.getSenderName().isBlank()) {
            errors.add(new ValidationErrorDto(
                "MISSING_SENDER_NAME", 
                "senderName", 
                "Sender name is required"
            ));
        }
        
        if (dto.getReceiverName() == null || dto.getReceiverName().isBlank()) {
            errors.add(new ValidationErrorDto(
                "MISSING_RECEIVER_NAME", 
                "receiverName", 
                "Receiver name is required"
            ));
        }
        
        if (dto.getReceiverPincode() == null || dto.getReceiverPincode().isBlank()) {
            errors.add(new ValidationErrorDto(
                "MISSING_RECEIVER_PINCODE", 
                "receiverPincode", 
                "Receiver pincode is required"
            ));
        }
        
        if (dto.getServiceType() == null || dto.getServiceType().isBlank()) {
            errors.add(new ValidationErrorDto(
                "MISSING_SERVICE_TYPE", 
                "serviceType", 
                "Service type is required"
            ));
        }
        
        if (dto.getItemCount() == null) {
            errors.add(new ValidationErrorDto(
                "MISSING_ITEM_COUNT", 
                "itemCount", 
                "Item count is required"
            ));
        }
        
        if (dto.getTotalWeight() == null) {
            errors.add(new ValidationErrorDto(
                "MISSING_TOTAL_WEIGHT", 
                "totalWeight", 
                "Total weight is required"
            ));
        }
        
        return errors;
    }
}
```

---

#### Task 1.2: FormatValidator (30 mins)
**File**: `backend/src/main/java/com/fleetops/bulkupload/validation/FormatValidator.java`

```java
package com.fleetops.bulkupload.validation;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.dto.ValidationErrorDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class FormatValidator {
    
    private static final Set<String> VALID_SERVICE_TYPES = Set.of("express", "standard", "economy");
    private static final int PINCODE_LENGTH = 6;
    
    public List<ValidationErrorDto> validate(CreateOrderDto dto) {
        List<ValidationErrorDto> errors = new ArrayList<>();
        
        // Validate pincode length (if present)
        if (dto.getReceiverPincode() != null && 
            !dto.getReceiverPincode().isBlank() && 
            dto.getReceiverPincode().length() != PINCODE_LENGTH) {
            errors.add(new ValidationErrorDto(
                "INVALID_PINCODE_LENGTH", 
                "receiverPincode", 
                String.format("Pincode must be exactly %d digits", PINCODE_LENGTH)
            ));
        }
        
        // Validate service type (if present)
        if (dto.getServiceType() != null && 
            !dto.getServiceType().isBlank() && 
            !VALID_SERVICE_TYPES.contains(dto.getServiceType().toLowerCase())) {
            errors.add(new ValidationErrorDto(
                "INVALID_SERVICE_TYPE", 
                "serviceType", 
                String.format("Service type must be one of: %s", String.join(", ", VALID_SERVICE_TYPES))
            ));
        }
        
        // Validate weight (if present)
        if (dto.getTotalWeight() != null && 
            dto.getTotalWeight().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add(new ValidationErrorDto(
                "INVALID_WEIGHT", 
                "totalWeight", 
                "Total weight must be greater than 0"
            ));
        }
        
        return errors;
    }
}
```

---

#### Task 1.3: BusinessRulesValidator (30 mins)
**File**: `backend/src/main/java/com/fleetops/bulkupload/validation/BusinessRulesValidator.java`

```java
package com.fleetops.bulkupload.validation;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.dto.ValidationErrorDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class BusinessRulesValidator {
    
    @Value("${bulk.upload.declaredValue.max:100000}")
    private BigDecimal maxDeclaredValue;
    
    public List<ValidationErrorDto> validate(CreateOrderDto dto) {
        List<ValidationErrorDto> errors = new ArrayList<>();
        
        // Validate item count
        if (dto.getItemCount() != null && dto.getItemCount() < 1) {
            errors.add(new ValidationErrorDto(
                "INVALID_ITEM_COUNT", 
                "itemCount", 
                "Item count must be at least 1"
            ));
        }
        
        // Validate declared value
        if (dto.getDeclaredValue() != null && 
            dto.getDeclaredValue().compareTo(maxDeclaredValue) > 0) {
            errors.add(new ValidationErrorDto(
                "DECLARED_VALUE_EXCEEDS_LIMIT", 
                "declaredValue", 
                String.format("Declared value cannot exceed %s", maxDeclaredValue)
            ));
        }
        
        // Validate COD amount (if applicable)
        if (dto.getCodAmount() != null && 
            dto.getCodAmount().compareTo(BigDecimal.ZERO) < 0) {
            errors.add(new ValidationErrorDto(
                "INVALID_COD_AMOUNT", 
                "codAmount", 
                "COD amount cannot be negative"
            ));
        }
        
        return errors;
    }
}
```

---

#### Task 1.4: DuplicationValidator (30 mins)
**File**: `backend/src/main/java/com/fleetops/bulkupload/validation/DuplicationValidator.java`

```java
package com.fleetops.bulkupload.validation;

import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.dto.ValidationErrorDto;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class DuplicationValidator {
    
    /**
     * Validate entire batch for in-file duplicates
     */
    public List<ValidationErrorDto> validateBatch(List<CreateOrderDto> dtos) {
        List<ValidationErrorDto> errors = new ArrayList<>();
        Map<String, List<Integer>> keyToIndexes = new HashMap<>();
        
        // Group by normalized key
        for (int i = 0; i < dtos.size(); i++) {
            CreateOrderDto dto = dtos.get(i);
            String key = normalizeKey(dto);
            
            keyToIndexes.computeIfAbsent(key, k -> new ArrayList<>()).add(i + 2); // +2 for Excel row (1-indexed, skip header)
        }
        
        // Find duplicates
        for (Map.Entry<String, List<Integer>> entry : keyToIndexes.entrySet()) {
            if (entry.getValue().size() > 1) {
                String rowNumbers = entry.getValue().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(", "));
                
                errors.add(new ValidationErrorDto(
                    "DUPLICATE_IN_FILE",
                    "receiverName,receiverCity",
                    String.format("Duplicate entries found in rows: %s", rowNumbers)
                ));
            }
        }
        
        return errors;
    }
    
    /**
     * Normalize receiver name and city for comparison
     */
    private String normalizeKey(CreateOrderDto dto) {
        String name = normalize(dto.getReceiverName());
        String city = normalize(dto.getReceiverCity());
        return name + "|" + city;
    }
    
    /**
     * Normalize string: trim, collapse whitespace, lowercase
     */
    private String normalize(String value) {
        if (value == null) return "";
        return value.trim()
            .replaceAll("\\s+", " ")
            .toLowerCase();
    }
}
```

---

#### Task 1.5: Wire Validators into BulkUploadService (30 mins)

**Update**: `backend/src/main/java/com/fleetops/bulkupload/service/BulkUploadService.java`

Add to constructor injection:
```java
private final StructuralValidator structuralValidator;
private final FormatValidator formatValidator;
private final BusinessRulesValidator businessRulesValidator;
private final DuplicationValidator duplicationValidator;
```

Update `processBulkUpload()` method - add validation before order creation:

```java
// After parsing Excel, before processing rows:

// 1. Check for in-file duplicates first
List<ValidationErrorDto> batchErrors = duplicationValidator.validateBatch(orders);
if (!batchErrors.isEmpty()) {
    logger.warn("Batch validation failed with {} duplicates", batchErrors.size());
    // Mark entire batch as failed or handle appropriately
}

// 2. For each row, run validators
for (int i = 0; i < orders.size(); i++) {
    CreateOrderDto orderDto = orders.get(i);
    List<ValidationErrorDto> rowErrors = new ArrayList<>();
    
    // Run all validators
    rowErrors.addAll(structuralValidator.validate(orderDto));
    rowErrors.addAll(formatValidator.validate(orderDto));
    rowErrors.addAll(businessRulesValidator.validate(orderDto));
    
    if (!rowErrors.isEmpty()) {
        // Create BulkUploadRow with status=FAILED_VALIDATION
        BulkUploadRow failedRow = new BulkUploadRow();
        failedRow.setBatch(batch);
        failedRow.setRowIndex(i + 1);
        failedRow.setStatus(RowStatus.FAILED_VALIDATION);
        failedRow.setErrorMessages(rowErrors.stream()
            .map(e -> String.format("%s: %s", e.getCode(), e.getMessage()))
            .toList());
        rowRepository.save(failedRow);
        
        failedCount++;
        continue; // Skip order creation
    }
    
    // ... existing idempotency and order creation logic
}
```

---

### **Priority 2: Batch Management APIs** (1 hour)

#### Task 2.1: List Batches Endpoint (30 mins)

**Update**: `backend/src/main/java/com/fleetops/bulkupload/service/BulkUploadService.java`

Add method:
```java
public Page<BatchSummaryDto> listBatches(Pageable pageable, Long uploaderUserId) {
    Page<BulkUploadBatch> batches;
    
    if (uploaderUserId != null) {
        // Filter by uploader (when User entity is implemented)
        batches = batchRepository.findByUploaderUserId(uploaderUserId, pageable);
    } else {
        batches = batchRepository.findAll(pageable);
    }
    
    return batches.map(this::toBatchSummaryDto);
}

private BatchSummaryDto toBatchSummaryDto(BulkUploadBatch batch) {
    BatchSummaryDto dto = new BatchSummaryDto();
    dto.setId(batch.getId());
    dto.setBatchId(batch.getBatchId());
    dto.setStatus(batch.getStatus().name());
    dto.setTotalRows(batch.getTotalRows());
    dto.setCreatedCount(batch.getCreatedCount());
    dto.setFailedCount(batch.getFailedCount());
    dto.setSkippedDuplicateCount(batch.getSkippedDuplicateCount());
    dto.setUploadedAt(batch.getCreatedAt().toString());
    dto.setUploaderUserId(batch.getUploaderUserId());
    dto.setFileName(batch.getFileName());
    dto.setFileSizeBytes(batch.getFileSizeBytes());
    return dto;
}
```

**Update**: `backend/src/main/java/com/fleetops/bulkupload/controller/BulkUploadController.java`

Add endpoint:
```java
@GetMapping("/batches")
public ResponseEntity<Page<BatchSummaryDto>> listBatches(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) Long uploaderUserId
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<BatchSummaryDto> batches = bulkUploadService.listBatches(pageable, uploaderUserId);
    return ResponseEntity.ok(batches);
}
```

**Create DTO**: `backend/src/main/java/com/fleetops/bulkupload/dto/BatchSummaryDto.java`

```java
package com.fleetops.bulkupload.dto;

import lombok.Data;

@Data
public class BatchSummaryDto {
    private Long id;
    private String batchId;
    private String status;
    private Integer totalRows;
    private Integer createdCount;
    private Integer failedCount;
    private Integer skippedDuplicateCount;
    private String uploadedAt;
    private Long uploaderUserId;
    private String fileName;
    private Long fileSizeBytes;
}
```

---

#### Task 2.2: Generate Template Endpoint (30 mins)

**Update**: `backend/src/main/java/com/fleetops/bulkupload/service/BulkUploadService.java`

Add method:
```java
public byte[] generateTemplate() throws IOException {
    try (XSSFWorkbook workbook = new XSSFWorkbook()) {
        // Sheet 1: Orders
        Sheet orderSheet = workbook.createSheet("Orders");
        
        // Create header row
        Row headerRow = orderSheet.createRow(0);
        String[] headers = {
            "clientReference", "clientId", "clientName", "clientCompany",
            "senderName", "senderAddress", "senderContact", "senderEmail",
            "receiverName", "receiverAddress", "receiverContact", "receiverEmail",
            "receiverPincode", "receiverCity", "receiverState",
            "itemCount", "totalWeight", "lengthCm", "widthCm", "heightCm",
            "itemDescription", "declaredValue", "serviceType",
            "carrierName", "carrierId", "codAmount", "specialInstructions"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        // Create example row
        Row exampleRow = orderSheet.createRow(1);
        String[] exampleData = {
            "REF-001", "1", "Acme Corp", "Acme Industries",
            "John Sender", "123 Sender St, Mumbai", "9876543210", "sender@example.com",
            "Jane Receiver", "456 Receiver Rd, Delhi", "9123456780", "receiver@example.com",
            "110001", "Delhi", "Delhi",
            "2", "5.5", "30", "20", "15",
            "Electronics - Laptop", "50000", "express",
            "BlueDart", "BD123", "0", "Handle with care"
        };
        
        for (int i = 0; i < exampleData.length; i++) {
            Cell cell = exampleRow.createCell(i);
            cell.setCellValue(exampleData[i]);
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            orderSheet.autoSizeColumn(i);
        }
        
        // Sheet 2: Notes
        Sheet notesSheet = workbook.createSheet("Notes");
        Row note1 = notesSheet.createRow(0);
        note1.createCell(0).setCellValue("Bulk Upload Guidelines");
        
        Row note2 = notesSheet.createRow(2);
        note2.createCell(0).setCellValue("1. Maximum 500 orders per file");
        
        Row note3 = notesSheet.createRow(3);
        note3.createCell(0).setCellValue("2. File size limit: 2 MB");
        
        Row note4 = notesSheet.createRow(4);
        note4.createCell(0).setCellValue("3. Use clientReference for idempotency (prevents duplicates)");
        
        Row note5 = notesSheet.createRow(5);
        note5.createCell(0).setCellValue("4. Service types: express, standard, economy");
        
        Row note6 = notesSheet.createRow(6);
        note6.createCell(0).setCellValue("5. Pincode must be 6 digits");
        
        // Write to byte array
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
```

**Update**: `backend/src/main/java/com/fleetops/bulkupload/controller/BulkUploadController.java`

Add endpoint:
```java
@GetMapping("/template")
public ResponseEntity<byte[]> downloadTemplate() {
    try {
        byte[] template = bulkUploadService.generateTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment()
            .filename("bulk_upload_template.xlsx")
            .build());
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(template);
    } catch (IOException e) {
        return ResponseEntity.internalServerError().build();
    }
}
```

---

### **Priority 3: Configuration** (15 mins)

**Update**: `backend/src/main/resources/application.yml`

Add complete configuration:
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
    # Future: allowedRoles when User/Role implemented

spring:
  servlet:
    multipart:
      max-file-size: 2MB
      max-request-size: 2MB
```

---

## 🧪 Testing Strategy

### Quick Manual Test After Each Task

**After Validators (Task 1)**:
1. Create test Excel with invalid data (missing fields, wrong pincode length, etc.)
2. Upload via frontend
3. Verify validation errors appear in results table
4. Check database: `SELECT * FROM bulk_upload_row WHERE status = 'FAILED_VALIDATION'`

**After Batch List API (Task 2.1)**:
1. Open browser: `http://localhost:4200/bulk-upload`
2. Click "Upload History" button
3. Should see paginated list of batches (or 404 if not implemented yet)

**After Template API (Task 2.2)**:
1. Open frontend: `http://localhost:4200/bulk-upload`
2. Click "Download Template" button
3. Verify Excel file downloads
4. Open Excel, verify headers and example row

---

## ✅ Completion Checklist

- [ ] Task 1.1: StructuralValidator created and tested
- [ ] Task 1.2: FormatValidator created and tested
- [ ] Task 1.3: BusinessRulesValidator created and tested
- [ ] Task 1.4: DuplicationValidator created and tested
- [ ] Task 1.5: Validators wired into BulkUploadService
- [ ] Task 2.1: List batches endpoint working
- [ ] Task 2.2: Generate template endpoint working
- [ ] Task 3: Configuration updated
- [ ] Manual testing: Upload with validation errors
- [ ] Manual testing: Download template
- [ ] Manual testing: View batch history (when implemented)
- [ ] Commit all backend changes

---

## 📦 Commit Message Template

```bash
git add backend/
git commit -m "feat: Add validators and batch management APIs

Complete validation layers and batch management endpoints for bulk upload.

## Validators Added (4 classes)
- StructuralValidator: Check required fields
- FormatValidator: Validate pincode, service type, weight
- BusinessRulesValidator: Item count, declared value, COD rules
- DuplicationValidator: In-file duplicate detection

## APIs Added (2 endpoints)
- GET /api/v1/bulk/orders/batches - Paginated batch list
- GET /api/v1/bulk/orders/template - Excel template download

## DTOs Created
- BatchSummaryDto - Batch metadata for list view

## Integration
- Wired validators into BulkUploadService
- Validation runs before order creation
- Failed validation creates FAILED_VALIDATION rows
- Error messages stored in database

## Configuration
- Added bulk.upload.declaredValue.max property
- Configured retention periods
- Feature flag support

## Testing
- Manual testing with invalid data
- Template generation verified
- Batch list endpoint working

Related: #001-bulk-order-upload
Part of: Phase 3 parallel implementation"
```

---

## 🚀 Next Steps After Completion

1. **Test End-to-End**:
   - Upload valid file → All orders created ✅
   - Upload invalid file → Validation errors displayed ✅
   - Download template → Excel opens correctly ✅
   - View history → Batches listed (if time permits) ✅

2. **Optional Enhancements** (if time allows):
   - Retention job (Quartz scheduler)
   - Logging and metrics
   - Unit tests for validators

3. **Merge to Main**:
   - Review all changes
   - Run full manual test suite
   - Create PR
   - Merge feature branch

---

**Estimated Total Time**: 2-3 hours for complete implementation

**Priority Order**:
1. Validators (MUST HAVE) - 2 hours
2. Template API (NICE TO HAVE) - 30 mins
3. Batch List API (NICE TO HAVE) - 30 mins

**Questions?** Check existing code patterns in:
- `OrderService` for similar validation
- `ExcelParserService` for Apache POI usage
- `BulkUploadController` for endpoint patterns

Good luck! 🎉
