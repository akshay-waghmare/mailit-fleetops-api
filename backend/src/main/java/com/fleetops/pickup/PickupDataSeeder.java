package com.fleetops.pickup;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Component
@Profile({"dev", "local-h2"})
public class PickupDataSeeder implements CommandLineRunner {

    private final PickupRepository repository;

    public PickupDataSeeder(PickupRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            Pickup p = new Pickup();
            p.setPickupId("PU000123");
            p.setClientId(12L);
            p.setClientName("Acme");
            p.setPickupAddress("123 Main");
            p.setPickupType("vendor");
            p.setPickupDate(LocalDate.now());
            p.setPickupTime(null);
            p.setStatus("scheduled");
            p.setItemsCount(2);
            p.setTotalWeight(new BigDecimal("12.5"));
            p.setEstimatedCost(new BigDecimal("150.0"));
            p.setCreatedAt(Instant.now());
            p.setUpdatedAt(Instant.now());
            repository.save(p);
            System.out.println("[PickupDataSeeder] seeded one pickup: PU000123");
        } else {
            System.out.println("[PickupDataSeeder] pickups already present, skipping seed");
        }
    }
}
