package com.fleetops.pickup;

import com.fleetops.pickup.dto.CreatePickupDto;
import com.fleetops.pickup.dto.PickupDto;
import com.fleetops.pickup.dto.UpdatePickupStatusDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PickupServiceImpl implements PickupService {

    @Autowired
    private PickupRepository repository;

    @Override
    public PickupDto createPickup(CreatePickupDto dto, String idempotencyKey) {
        Pickup p = new Pickup();
        p.setPickupId("PU" + UUID.randomUUID().toString().substring(0,8).toUpperCase());
        p.setClientId(dto.clientId);
        p.setClientName(dto.clientName); // Fix: Use actual client name from DTO
        if (dto.pickupDate != null) p.setPickupDate(LocalDate.parse(dto.pickupDate));
        if (dto.pickupTime != null && !dto.pickupTime.isEmpty()) {
            p.setPickupTime(parseTime(dto.pickupTime));
        }
        p.setPickupAddress(dto.pickupAddress);
        p.setPickupType(dto.pickupType); // Fix: Map pickup type from DTO
        if (dto.assignedStaffId != null) p.setAssignedStaffId(dto.assignedStaffId);
        if (dto.assignedStaffName != null) p.setAssignedStaffName(dto.assignedStaffName);
        p.setStatus("scheduled");
        p.setCreatedAt(Instant.now());
        p.setUpdatedAt(Instant.now());
        repository.save(p);
        return toDto(p);
    }

    @Override
    public Page<PickupDto> listPickups(Pageable pageable) {
        List<PickupDto> dtos = repository.findAll(pageable).stream().map(this::toDto).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, repository.count());
    }

    @Override
    public PickupDto updatePickup(Long id, CreatePickupDto dto) {
        Pickup existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pickup not found with id: " + id));
        
        // Update fields from DTO
        if (dto.clientName != null) existing.setClientName(dto.clientName);
        if (dto.pickupAddress != null) existing.setPickupAddress(dto.pickupAddress);
        if (dto.pickupDate != null) existing.setPickupDate(LocalDate.parse(dto.pickupDate));
        if (dto.pickupTime != null && !dto.pickupTime.isEmpty()) {
            existing.setPickupTime(parseTime(dto.pickupTime));
        }
        if (dto.pickupType != null) existing.setPickupType(dto.pickupType);
        if (dto.status != null) existing.setStatus(dto.status);
        if (dto.assignedStaffName != null) existing.setAssignedStaffName(dto.assignedStaffName);
        if (dto.assignedStaffId != null) existing.setAssignedStaffId(dto.assignedStaffId);
        if (dto.itemsCount != null) existing.setItemsCount(dto.itemsCount);
        if (dto.totalWeight != null) existing.setTotalWeight(dto.totalWeight);
        if (dto.estimatedCost != null) existing.setEstimatedCost(dto.estimatedCost);
        if (dto.carrierId != null) existing.setCarrierId(dto.carrierId);
        
        existing.setUpdatedAt(Instant.now());
        repository.save(existing);
        return toDto(existing);
    }

    @Override
    public PickupDto updatePickupStatus(Long id, UpdatePickupStatusDto dto) {
        Pickup existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pickup not found with id: " + id));
        
        if (dto.status != null) {
            existing.setStatus(dto.status);
        }
        
        // If completing the pickup, record completion details
        if ("completed".equalsIgnoreCase(dto.status)) {
            existing.setItemsReceived(dto.itemsReceived);
            existing.setCompletionNotes(dto.completionNotes);
            existing.setCompletedAt(Instant.now());
            existing.setCompletedBy(dto.completedBy != null ? dto.completedBy : "System");
        }
        
        existing.setUpdatedAt(Instant.now());
        repository.save(existing);
        return toDto(existing);
    }

    private PickupDto toDto(Pickup p) {
        PickupDto d = new PickupDto();
        d.id = p.getId();
        d.pickupId = p.getPickupId();
        d.status = p.getStatus();
        d.createdAt = p.getCreatedAt();
        d.updatedAt = p.getUpdatedAt();
        d.clientName = p.getClientName();
        d.pickupAddress = p.getPickupAddress();
        d.pickupDate = p.getPickupDate() != null ? p.getPickupDate().toString() : null;
        d.pickupTime = p.getPickupTime() != null ? p.getPickupTime().toString() : null;
        d.assignedStaff = p.getAssignedStaffName();
        d.pickupType = p.getPickupType();
        d.itemsCount = p.getItemsCount();
        d.totalWeight = p.getTotalWeight();
        d.carrierId = p.getCarrierId();
        d.estimatedCost = p.getEstimatedCost();
        // Completion tracking fields
        d.itemsReceived = p.getItemsReceived();
        d.completionNotes = p.getCompletionNotes();
        d.completedAt = p.getCompletedAt();
        d.completedBy = p.getCompletedBy();
        return d;
    }

    /**
     * Parse time string that can be in either HH:mm (24-hour) or h:mm a (12-hour AM/PM) format
     */
    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            return null;
        }
        
        // First try 24-hour format (HH:mm)
        try {
            return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e1) {
            // If that fails, try 12-hour format with AM/PM
            try {
                return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("h:mm a"));
            } catch (DateTimeParseException e2) {
                // If both fail, try other common formats
                try {
                    return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("hh:mm a"));
                } catch (DateTimeParseException e3) {
                    throw new IllegalArgumentException("Unable to parse time: " + timeStr + 
                        ". Expected formats: HH:mm, h:mm a, or hh:mm a");
                }
            }
        }
    }
}
