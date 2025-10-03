package com.fleetops.bulkupload.controller;

import com.fleetops.bulkupload.dto.BulkUploadResponseDto;
import com.fleetops.bulkupload.service.BulkUploadService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}
