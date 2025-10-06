package com.fleetops.deliverysheet.mapper;

import com.fleetops.deliverysheet.DeliverySheet;
import com.fleetops.deliverysheet.DeliverySheetOrder;
import com.fleetops.deliverysheet.dto.DeliverySheetResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DeliverySheetMapper - Converts DeliverySheet entities to DTOs.
 */
@Component
public class DeliverySheetMapper {

    public DeliverySheetResponse toResponse(DeliverySheet entity) {
        if (entity == null) {
            return null;
        }

        DeliverySheetResponse response = new DeliverySheetResponse();
        response.setId(entity.getId());
        response.setSheetNumber(entity.getSheetNumber());
        response.setTitle(entity.getTitle());
        response.setStatus(entity.getStatus());
        response.setAssignedAgentId(entity.getAssignedAgentId());
        response.setAssignedAgentName(entity.getAssignedAgentName());
        response.setTotalOrders(entity.getTotalOrders());
        response.setTotalCodAmount(entity.getTotalCodAmount());
        response.setScheduledDate(entity.getScheduledDate());
        response.setDeliveryDate(entity.getDeliveryDate());
        response.setNotes(entity.getNotes());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        List<Long> orderIds = entity.getOrders().stream()
            .map(DeliverySheetOrder::getOrderId)
            .collect(Collectors.toList());
        response.setOrderIds(orderIds);

        return response;
    }
}
