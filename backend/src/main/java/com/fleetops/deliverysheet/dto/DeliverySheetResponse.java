package com.fleetops.deliverysheet.dto;

import com.fleetops.deliverysheet.DeliverySheetStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * DeliverySheetResponse - Response payload for delivery sheet endpoints.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeliverySheetResponse {

    private Long id;
    private String sheetNumber;
    private String title;
    private DeliverySheetStatus status;
    private Long assignedAgentId;
    private String assignedAgentName;
    private Integer totalOrders;
    private BigDecimal totalCodAmount;
    private LocalDate scheduledDate;
    private LocalDate deliveryDate;
    private String notes;
    private List<Long> orderIds = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public DeliverySheetResponse() {
        // Default constructor
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSheetNumber() {
        return sheetNumber;
    }

    public void setSheetNumber(String sheetNumber) {
        this.sheetNumber = sheetNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public DeliverySheetStatus getStatus() {
        return status;
    }

    public void setStatus(DeliverySheetStatus status) {
        this.status = status;
    }

    public Long getAssignedAgentId() {
        return assignedAgentId;
    }

    public void setAssignedAgentId(Long assignedAgentId) {
        this.assignedAgentId = assignedAgentId;
    }

    public String getAssignedAgentName() {
        return assignedAgentName;
    }

    public void setAssignedAgentName(String assignedAgentName) {
        this.assignedAgentName = assignedAgentName;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalCodAmount() {
        return totalCodAmount;
    }

    public void setTotalCodAmount(BigDecimal totalCodAmount) {
        this.totalCodAmount = totalCodAmount;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<Long> getOrderIds() {
        return orderIds;
    }

    public void setOrderIds(List<Long> orderIds) {
        this.orderIds = orderIds != null ? new ArrayList<>(orderIds) : new ArrayList<>();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
