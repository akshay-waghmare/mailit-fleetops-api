package com.fleetops.pickup.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class PickupDto {
    public Long id;
    public String pickupId;
    public String status;
    public Instant createdAt;
    public Instant updatedAt;
    
    // Client information (from relationship)
    public Long clientId;
    public String clientName;
    public String clientCompany;  // From client.name or subContractName
    public String contactNumber;  // From client.vContactMobile
    public String contactPerson;  // From client.vContactPerson
    public String contactEmail;   // From client.vContactEmail
    
    public String pickupAddress;
    public String pickupDate;
    public String pickupTime;
    public String assignedStaff;
    public String assignedStaffName;
    public String pickupType;
    public Integer itemsCount;
    public BigDecimal totalWeight;
    public String carrierId;
    public BigDecimal estimatedCost;
    
    // Completion tracking fields
    public Integer itemsReceived;
    public String completionNotes;
    public Instant completedAt;
    public String completedBy;
    // getters/setters omitted for brevity
}
