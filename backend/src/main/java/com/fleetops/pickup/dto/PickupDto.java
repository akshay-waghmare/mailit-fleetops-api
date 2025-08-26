package com.fleetops.pickup.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class PickupDto {
    public Long id;
    public String pickupId;
    public String status;
    public Instant createdAt;
    public Instant updatedAt;
    public String clientName;
    public String pickupAddress;
    public String pickupDate;
    public String pickupTime;
    public String assignedStaff;
    public BigDecimal estimatedCost;
    // getters/setters omitted for brevity
}
