package com.fleetops.pickup.dto;

import java.math.BigDecimal;

public class CreatePickupDto {
    public Long clientId;
    public String clientName; // Add client name field
    public String pickupAddress;
    public String contactNumber; // Client contact number
    public String pickupDate; // ISO yyyy-MM-dd
    public String pickupTime;
    public String pickupType;
    public String status; // Add status field for updates
    public Integer itemsCount;
    public BigDecimal totalWeight;
    public String itemsDescription;
    public String carrierId;
    public Long assignedStaffId;
    public String assignedStaffName;
    public BigDecimal estimatedCost; // Add estimated cost field
    // getters/setters omitted for brevity
}
