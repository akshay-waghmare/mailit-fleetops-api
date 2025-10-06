package com.fleetops.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateOrderStatusDto {
    
    @NotNull(message = "Status is required")
    @NotBlank(message = "Status cannot be blank")
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("reason")
    private String reason;
    
    @JsonProperty("notes")
    private String notes;
    
    @JsonProperty("updated_by")
    private String updatedBy;
    
    @JsonProperty("latitude")
    private Double latitude;
    
    @JsonProperty("longitude")
    private Double longitude;
    
    // Constructors
    public UpdateOrderStatusDto() {}
    
    public UpdateOrderStatusDto(String status) {
        this.status = status;
    }
    
    public UpdateOrderStatusDto(String status, String reason, String updatedBy) {
        this.status = status;
        this.reason = reason;
        this.updatedBy = updatedBy;
    }
    
    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
