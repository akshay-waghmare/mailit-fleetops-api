package com.fleetops.deliverysheet.controller;

import com.fleetops.deliverysheet.DeliverySheetStatus;
import com.fleetops.deliverysheet.dto.CreateDeliverySheetRequest;
import com.fleetops.deliverysheet.dto.DeliverySheetResponse;
import com.fleetops.deliverysheet.service.DeliverySheetService;
import com.fleetops.user.entity.User;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * DeliverySheetController - REST endpoints for delivery sheet operations.
 */
@RestController
@RequestMapping("/api/v1/delivery-sheets")
public class DeliverySheetController {

    private static final Logger logger = LoggerFactory.getLogger(DeliverySheetController.class);

    private final DeliverySheetService deliverySheetService;

    public DeliverySheetController(DeliverySheetService deliverySheetService) {
        this.deliverySheetService = deliverySheetService;
    }

    /**
     * POST /api/v1/delivery-sheets
     * Create a delivery sheet (ADMIN/STAFF only).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> createDeliverySheet(
        @Valid @RequestBody CreateDeliverySheetRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        try {
            DeliverySheetResponse response = deliverySheetService.createDeliverySheet(request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            logger.warn("Failed to create delivery sheet: {}", ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "VALIDATION_ERROR");
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PUT /api/v1/delivery-sheets/{id}
     * Update an existing delivery sheet (ADMIN/STAFF only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> updateDeliverySheet(
        @PathVariable Long id,
        @Valid @RequestBody CreateDeliverySheetRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        try {
            DeliverySheetResponse response = deliverySheetService.updateDeliverySheet(id, request, currentUser);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            logger.warn("Failed to update delivery sheet {}: {}", id, ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "VALIDATION_ERROR");
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception ex) {
            logger.error("Error updating delivery sheet {}: {}", id, ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "INTERNAL_ERROR");
            error.put("message", "Failed to update delivery sheet");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/v1/delivery-sheets
     * List delivery sheets (ADMIN/STAFF).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getDeliverySheets(
        @RequestParam(value = "assignedAgentId", required = false) Long assignedAgentId,
        @RequestParam(value = "status", required = false) String status,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        try {
            DeliverySheetStatus parsedStatus = parseStatus(status);
            Page<DeliverySheetResponse> response = deliverySheetService.getDeliverySheets(assignedAgentId, parsedStatus, pageable);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            logger.warn("Invalid delivery sheet filter: {}", ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "INVALID_FILTER");
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /api/v1/delivery-sheets/my
     * List delivery sheets scoped to authenticated user.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'AGENT')")
    public ResponseEntity<?> getMyDeliverySheets(
        @RequestParam(value = "status", required = false) String status,
        @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
        @AuthenticationPrincipal User currentUser
    ) {
        try {
            DeliverySheetStatus parsedStatus = parseStatus(status);
            Page<DeliverySheetResponse> response = deliverySheetService.getDeliverySheetsForUser(currentUser, parsedStatus, pageable);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            logger.warn("Failed to fetch delivery sheets for user {}: {}", currentUser != null ? currentUser.getUsername() : "unknown", ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "INVALID_FILTER");
            error.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private DeliverySheetStatus parseStatus(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("ALL")) {
            return null;
        }

        try {
            return DeliverySheetStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status value: " + value);
        }
    }
}
