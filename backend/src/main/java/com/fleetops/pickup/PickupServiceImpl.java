package com.fleetops.pickup;

import com.fleetops.pickup.dto.CreatePickupDto;
import com.fleetops.pickup.dto.PickupDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
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
        p.setClientName(dto.clientId != null ? String.valueOf(dto.clientId) : null);
        if (dto.pickupDate != null) p.setPickupDate(LocalDate.parse(dto.pickupDate));
        p.setPickupAddress(dto.pickupAddress);
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
        return d;
    }
}
