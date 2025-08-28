package com.fleetops.pickup.dto;

import java.math.BigDecimal;

public class CreatePickupDto {
    public Long clientId;
    public String pickupAddress;
    public String pickupDate; // ISO yyyy-MM-dd
    public String pickupTime;
    public String pickupType;
    public Integer itemCount;
    public BigDecimal totalWeight;
    public String itemsDescription;
    public String carrierId;
    public Long assignedStaffId;
    public String assignedStaffName;
    // getters/setters omitted for brevity
}
