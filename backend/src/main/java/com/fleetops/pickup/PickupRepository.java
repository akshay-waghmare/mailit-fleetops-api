package com.fleetops.pickup;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface PickupRepository extends JpaRepository<Pickup, Long>, JpaSpecificationExecutor<Pickup> {
    Optional<Pickup> findByPickupId(String pickupId);
}
