package com.fleetops.pickup;

import com.fleetops.pickup.dto.CreatePickupDto;
import com.fleetops.pickup.dto.PickupDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pickups")
public class PickupController {

    @Autowired
    private PickupService pickupService;

    @PostMapping
    public ResponseEntity<PickupDto> create(@RequestBody CreatePickupDto dto, @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        PickupDto created = pickupService.createPickup(dto, idempotencyKey);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public Page<PickupDto> list(Pageable pageable) {
        return pickupService.listPickups(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PickupDto> get(@PathVariable Long id) {
        return pickupService.listPickups(Pageable.unpaged()).stream().filter(p->p.id.equals(id)).findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
