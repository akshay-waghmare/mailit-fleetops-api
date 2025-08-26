package com.fleetops.pickup;

import com.fleetops.pickup.dto.CreatePickupDto;
import com.fleetops.pickup.dto.PickupDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PickupService {
    PickupDto createPickup(CreatePickupDto dto, String idempotencyKey);
    Page<PickupDto> listPickups(Pageable pageable);
}
