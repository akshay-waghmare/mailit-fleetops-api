package com.fleetops.pickup.dto;

/**
 * DTO for updating pickup status.
 * When completing a pickup, allows specifying items received (which may differ from items_count).
 */
public class UpdatePickupStatusDto {
    public String status;
    public Integer itemsReceived;
    public String completionNotes;
    public String completedBy;
    
    // Default constructor
    public UpdatePickupStatusDto() {}
    
    // Convenience constructor
    public UpdatePickupStatusDto(String status) {
        this.status = status;
    }
}
