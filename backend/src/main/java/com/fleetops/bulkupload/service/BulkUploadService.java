package com.fleetops.bulkupload.service;

import com.fleetops.bulkupload.dto.BulkUploadResponseDto;
import com.fleetops.bulkupload.dto.CreateOrderDto;
import com.fleetops.bulkupload.dto.RowOutcomeDto;
import com.fleetops.bulkupload.dto.ValidationErrorDto;
import com.fleetops.bulkupload.entity.*;
import com.fleetops.bulkupload.mapper.BulkOrderMapper;
import com.fleetops.bulkupload.parser.ExcelParserService;
import com.fleetops.bulkupload.repository.BulkUploadBatchRepository;
import com.fleetops.bulkupload.repository.BulkUploadRowRepository;
import com.fleetops.bulkupload.util.HashUtil;
import com.fleetops.order.dto.OrderDto;
import com.fleetops.order.service.OrderService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class BulkUploadService {
    
    private static final Logger logger = LoggerFactory.getLogger(BulkUploadService.class);

    private final ExcelParserService excelParserService;
    private final IdempotencyService idempotencyService;
    private final BulkUploadBatchRepository batchRepository;
    private final BulkUploadRowRepository rowRepository;
    private final OrderService orderService;
    private final BulkOrderMapper bulkOrderMapper;

    public BulkUploadService(
            ExcelParserService excelParserService,
            IdempotencyService idempotencyService,
            BulkUploadBatchRepository batchRepository,
            BulkUploadRowRepository rowRepository,
            OrderService orderService,
            BulkOrderMapper bulkOrderMapper) {
        this.excelParserService = excelParserService;
        this.idempotencyService = idempotencyService;
        this.batchRepository = batchRepository;
        this.rowRepository = rowRepository;
        this.orderService = orderService;
        this.bulkOrderMapper = bulkOrderMapper;
    }

    @Transactional
    public BulkUploadResponseDto process(MultipartFile file) {
        long startTime = System.currentTimeMillis();
        
        // 1. Parse Excel file
        List<CreateOrderDto> rows = excelParserService.parseExcel(file);
        
        // 2. Create batch record
        BulkUploadBatch batch = createBatchRecord(file, rows.size(), startTime);
        batch = batchRepository.save(batch);
        
        // 3. Process rows and persist outcomes
        List<RowOutcomeDto> outcomes = new ArrayList<>();
        int created = 0;
        int failed = 0;
        int skipped = 0;
        
        for (int i = 0; i < rows.size(); i++) {
            CreateOrderDto dto = rows.get(i);
            IdempotencyService.IdempotencyResult idem = idempotencyService.computeIdempotencyKey(dto);
            
            // Check for duplicates
            Optional<BulkUploadRow> existing = rowRepository.findByIdempotencyKey(idem.getIdempotencyKey());
            RowStatus status;
            Long orderId = null;
            
            if (existing.isPresent()) {
                // Duplicate found - don't create a new row, just count it
                status = RowStatus.SKIPPED_DUPLICATE;
                orderId = existing.get().getOrderId();
                skipped++;
                logger.debug("Row {} skipped - duplicate idempotency key: {}", i + 1, idem.getIdempotencyKey());
                
                // Build response DTO from existing row (no new DB entry)
                RowOutcomeDto outcome = new RowOutcomeDto(
                        i + 1,
                        status.name(),
                        idem.getBasis().name(),
                        orderId,
                        Collections.<ValidationErrorDto>emptyList()
                );
                outcomes.add(outcome);
                continue; // Skip to next row
            }
            
            // Not a duplicate - create new order
            try {
                com.fleetops.order.dto.CreateOrderDto orderDto = bulkOrderMapper.toOrderCreateDto(dto);
                com.fleetops.order.dto.OrderDto createdOrder = orderService.createOrder(orderDto);
                
                status = RowStatus.CREATED;
                orderId = createdOrder.getId();
                created++;
                logger.info("Row {} created order successfully - orderId: {}", i + 1, orderId);
            } catch (Exception e) {
                // If order creation fails, mark row as failed
                status = RowStatus.FAILED_VALIDATION;
                failed++;
                logger.error("Row {} failed to create order: {}", i + 1, e.getMessage(), e);
            }
            
            // Persist row outcome (only for non-duplicates)
            BulkUploadRow rowEntity = new BulkUploadRow();
            rowEntity.setBatch(batch);
            rowEntity.setRowIndex(i + 1);
            rowEntity.setIdempotencyKey(idem.getIdempotencyKey());
            rowEntity.setIdempotencyBasis(idem.getBasis());
            rowEntity.setStatus(status);
            rowEntity.setOrderId(orderId);
            rowEntity.setErrorMessages(new ArrayList<>()); // No validation errors in minimal impl
            rowEntity.setRawData(new HashMap<>()); // TODO: Populate with row data if needed
            rowRepository.save(rowEntity);
            
            // Build response DTO
            RowOutcomeDto outcome = new RowOutcomeDto(
                    i + 1,
                    status.name(),
                    idem.getBasis().name(),
                    orderId,
                    Collections.<ValidationErrorDto>emptyList()
            );
            outcomes.add(outcome);
        }
        
        // 4. Update batch with final counts and mark completed
        long duration = System.currentTimeMillis() - startTime;
        batch.setTotalRows(rows.size()); // Set total rows to satisfy constraint
        batch.setCreatedCount(created);
        batch.setFailedCount(failed);
        batch.setSkippedDuplicateCount(skipped);
        batch.setStatus(BulkUploadStatus.COMPLETED);
        batch.setProcessingCompletedAt(LocalDateTime.now());
        batch.setProcessingDurationMs(duration);
        batchRepository.save(batch);
        
        // 5. Return response
        return new BulkUploadResponseDto(
                batch.getBatchId(),
                rows.size(),
                created,
                failed,
                skipped,
                duration,
                outcomes
        );
    }
    
    private BulkUploadBatch createBatchRecord(MultipartFile file, int totalRows, long startTimeMs) {
        BulkUploadBatch batch = new BulkUploadBatch();
        batch.setBatchId(generateBatchId());
        batch.setUploaderUserId(1L); // Hardcoded for Phase 1 (no auth yet)
        batch.setUploaderName("system"); // Hardcoded for Phase 1
        batch.setFileName(file.getOriginalFilename());
        batch.setFileSizeBytes(file.getSize());
        
        try {
            String checksum = HashUtil.sha256Hex(file.getBytes());
            batch.setFileChecksum(checksum);
        } catch (IOException e) {
            throw new RuntimeException("Failed to compute file checksum", e);
        }
        
        batch.setStatus(BulkUploadStatus.PROCESSING);
        batch.setTotalRows(0); // Set to 0 initially to satisfy constraint; updated at end
        batch.setUploadedAt(LocalDateTime.now());
        batch.setProcessingStartedAt(LocalDateTime.now());
        
        return batch;
    }
    
    private String generateBatchId() {
        // Format: BU{YYYYMMDDHHmmss} + 2-digit random suffix for uniqueness
        // e.g., BU2025100414302547 (16 characters total: BU + 14 digits)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randomSuffix = (int) (Math.random() * 100); // 00-99
        return String.format("BU%s%02d", timestamp, randomSuffix);
    }

    /**
     * Generates an Excel template with headers and example row.
     */
    public byte[] generateTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Orders");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Create header row (exact column names that ExcelParserService expects)
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "clientReference", "clientId", "clientName", "clientCompany",
                "contactNumber", "senderName", "senderAddress", "senderContact",
                "senderEmail", "receiverName", "receiverAddress", "receiverContact",
                "receiverEmail", "receiverPincode", "receiverCity", "receiverState",
                "itemCount", "totalWeight", "lengthCm", "widthCm",
                "heightCm", "itemDescription", "declaredValue", "serviceType",
                "carrierName", "carrierId", "codAmount", "specialInstructions"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }
            
            // Create example row
            Row exampleRow = sheet.createRow(1);
            String[] exampleData = {
                "REF-12345", "1001", "ACME Corp", "ACME Corporation Ltd",
                "9876543210", "John Sender", "123 Main St, Mumbai", "9876543210",
                "john@example.com", "Jane Receiver", "456 Park Ave, Delhi", "9876543211",
                "jane@example.com", "110001", "Delhi", "Delhi",
                "2", "5.5", "30", "20",
                "10", "Electronics - Laptop", "50000", "express",
                "BlueDart", "BD001", "0", "Handle with care"
            };
            
            for (int i = 0; i < exampleData.length; i++) {
                exampleRow.createCell(i).setCellValue(exampleData[i]);
            }
            
            // Create notes sheet
            Sheet notesSheet = workbook.createSheet("Instructions");
            Row notesRow0 = notesSheet.createRow(0);
            notesRow0.createCell(0).setCellValue("BULK ORDER UPLOAD - INSTRUCTIONS");
            
            Row notesRow1 = notesSheet.createRow(2);
            notesRow1.createCell(0).setCellValue("Required Fields (minimum):");
            
            Row notesRow2 = notesSheet.createRow(3);
            notesRow2.createCell(0).setCellValue("  • senderName, receiverName");
            
            Row notesRow3 = notesSheet.createRow(5);
            notesRow3.createCell(0).setCellValue("Validation Rules:");
            
            Row notesRow4 = notesSheet.createRow(6);
            notesRow4.createCell(0).setCellValue("  • serviceType must be: express, standard, or economy");
            
            Row notesRow5 = notesSheet.createRow(7);
            notesRow5.createCell(0).setCellValue("  • receiverPincode should be 6 digits");
            
            Row notesRow6 = notesSheet.createRow(8);
            notesRow6.createCell(0).setCellValue("  • totalWeight must be greater than 0");
            
            Row notesRow7 = notesSheet.createRow(10);
            notesRow7.createCell(0).setCellValue("Note: Column names are case-sensitive. Do not modify header row.");
            
            notesSheet.setColumnWidth(0, 15000);
            
            workbook.write(out);
            return out.toByteArray();
            
        } catch (IOException e) {
            logger.error("Failed to generate Excel template", e);
            throw new RuntimeException("Failed to generate template", e);
        }
    }

    /**
     * Lists bulk upload batches with pagination.
     */
    public Page<BulkUploadBatch> listBatches(Pageable pageable) {
        return batchRepository.findAll(pageable);
    }
}
