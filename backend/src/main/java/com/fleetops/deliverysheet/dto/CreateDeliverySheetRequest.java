package com.fleetops.deliverysheet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * CreateDeliverySheetRequest - Request payload for creating delivery sheets.
 */
public class CreateDeliverySheetRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Assigned agent ID is required")
    private Long assignedAgentId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduledDate;

    private List<Long> orderIds;

    @Size(max = 5000, message = "Notes must be 5000 characters or less")
    private String notes;

    public CreateDeliverySheetRequest() {
        // Default constructor for deserialization
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getAssignedAgentId() {
        return assignedAgentId;
    }

    public void setAssignedAgentId(Long assignedAgentId) {
        this.assignedAgentId = assignedAgentId;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public List<Long> getOrderIds() {
        return orderIds;
    }

    public void setOrderIds(List<Long> orderIds) {
        if (orderIds == null) {
            this.orderIds = null;
            return;
        }

        this.orderIds = orderIds.stream()
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        if (notes != null && notes.isBlank()) {
            this.notes = null;
            return;
        }
        this.notes = notes;
    }
}
