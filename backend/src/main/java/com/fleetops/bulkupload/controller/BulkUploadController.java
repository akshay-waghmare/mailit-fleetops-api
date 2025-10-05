package com.fleetops.bulkupload.controller;

import com.fleetops.bulkupload.dto.BulkUploadResponseDto;
import com.fleetops.bulkupload.entity.BulkUploadBatch;
import com.fleetops.bulkupload.service.BulkUploadService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/bulk")
public class BulkUploadController {

    private final BulkUploadService service;

    public BulkUploadController(BulkUploadService service) {
        this.service = service;
    }

    @PostMapping(value = "/orders", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulkUploadResponseDto> uploadOrders(@RequestPart("file") MultipartFile file) {
        BulkUploadResponseDto response = service.process(file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = service.generateTemplate();
        
        String filename = "bulk-orders-template-" + 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".xlsx";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(template);
    }

    @GetMapping("/orders/batches")
    public ResponseEntity<Page<BulkUploadBatch>> listBatches(
            @PageableDefault(size = 20, sort = "uploadedAt") Pageable pageable) {
        Page<BulkUploadBatch> batches = service.listBatches(pageable);
        return ResponseEntity.ok(batches);
    }
}
