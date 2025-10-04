package com.fleetops.bulkupload.mapper;

import org.springframework.stereotype.Component;

/**
 * Maps bulk upload CreateOrderDto to order module CreateOrderDto
 * Handles field transformation between bulk upload and order creation
 */
@Component
public class BulkOrderMapper {
    
    /**
     * Convert bulk upload DTO to order creation DTO
     */
    public com.fleetops.order.dto.CreateOrderDto toOrderCreateDto(
            com.fleetops.bulkupload.dto.CreateOrderDto bulkDto) {
        if (bulkDto == null) {
            return null;
        }
        
        com.fleetops.order.dto.CreateOrderDto orderDto = new com.fleetops.order.dto.CreateOrderDto();
        
        // Client Information
        orderDto.setClientId(bulkDto.getClientId());
        orderDto.setClientName(bulkDto.getClientName());
        orderDto.setClientCompany(bulkDto.getClientCompany());
        orderDto.setContactNumber(bulkDto.getContactNumber());
        
        // Sender Information
        orderDto.setSenderName(bulkDto.getSenderName());
        orderDto.setSenderAddress(bulkDto.getSenderAddress());
        orderDto.setSenderContact(bulkDto.getSenderContact());
        orderDto.setSenderEmail(bulkDto.getSenderEmail());
        // Note: Bulk upload doesn't have sender pincode/city/state
        
        // Receiver Information
        orderDto.setReceiverName(bulkDto.getReceiverName());
        orderDto.setReceiverAddress(bulkDto.getReceiverAddress());
        orderDto.setReceiverContact(bulkDto.getReceiverContact());
        orderDto.setReceiverEmail(bulkDto.getReceiverEmail());
        orderDto.setReceiverPincode(bulkDto.getReceiverPincode());
        orderDto.setReceiverCity(bulkDto.getReceiverCity());
        orderDto.setReceiverState(bulkDto.getReceiverState());
        
        // Package Details
        orderDto.setItemCount(bulkDto.getItemCount());
        orderDto.setTotalWeight(bulkDto.getTotalWeight());
        orderDto.setLengthCm(bulkDto.getLengthCm());
        orderDto.setWidthCm(bulkDto.getWidthCm());
        orderDto.setHeightCm(bulkDto.getHeightCm());
        orderDto.setItemDescription(bulkDto.getItemDescription());
        orderDto.setDeclaredValue(bulkDto.getDeclaredValue());
        
        // Service Details
        orderDto.setServiceType(mapServiceType(bulkDto.getServiceType()));
        orderDto.setCarrierName(bulkDto.getCarrierName());
        orderDto.setCarrierId(bulkDto.getCarrierId());
        
        // Financial Information
        orderDto.setCodAmount(bulkDto.getCodAmount());
        
        // Additional Fields
        orderDto.setSpecialInstructions(bulkDto.getSpecialInstructions());
        
        return orderDto;
    }
    
    /**
     * Map service type string to enum
     */
    private com.fleetops.order.dto.CreateOrderDto.ServiceType mapServiceType(String serviceType) {
        if (serviceType == null || serviceType.isBlank()) {
            return null;
        }
        
        try {
            return com.fleetops.order.dto.CreateOrderDto.ServiceType.valueOf(serviceType.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Default to STANDARD if invalid
            return com.fleetops.order.dto.CreateOrderDto.ServiceType.STANDARD;
        }
    }
}
