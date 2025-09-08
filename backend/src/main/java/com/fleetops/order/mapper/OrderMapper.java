package com.fleetops.order.mapper;

import com.fleetops.order.Order;
import com.fleetops.order.dto.CreateOrderDto;
import com.fleetops.order.dto.OrderDto;
import org.mapstruct.*;

import java.time.Instant;
import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderId", expression = "java(generateOrderId())")
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paymentStatus", constant = "PENDING")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "statusUpdatedAt", expression = "java(java.time.Instant.now())")
    @Mapping(target = "statusHistory", ignore = true)
    @Mapping(source = "serviceType", target = "serviceType", qualifiedByName = "mapServiceTypeToEntity")
    Order toEntity(CreateOrderDto dto);
    
    @Mapping(source = "serviceType", target = "serviceType", qualifiedByName = "mapServiceTypeToString")
    @Mapping(source = "status", target = "status", qualifiedByName = "mapStatusToString")
    @Mapping(source = "paymentStatus", target = "paymentStatus", qualifiedByName = "mapPaymentStatusToString")
    OrderDto toDto(Order entity);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "statusHistory", ignore = true)
    @Mapping(source = "serviceType", target = "serviceType", qualifiedByName = "mapServiceTypeToEntity")
    void updateEntityFromDto(CreateOrderDto dto, @MappingTarget Order entity);
    
    // Custom mapping methods
    default String generateOrderId() {
        return "ORD" + String.format("%06d", Math.abs(UUID.randomUUID().hashCode() % 1000000));
    }
    
    @Named("mapServiceTypeToEntity")
    default Order.ServiceType mapServiceTypeToEntity(CreateOrderDto.ServiceType serviceType) {
        if (serviceType == null) return null;
        return switch (serviceType) {
            case EXPRESS -> Order.ServiceType.EXPRESS;
            case STANDARD -> Order.ServiceType.STANDARD;
            case ECONOMY -> Order.ServiceType.ECONOMY;
        };
    }
    
    @Named("mapServiceTypeToString")
    default String mapServiceTypeToString(Order.ServiceType serviceType) {
        return serviceType != null ? serviceType.name() : null;
    }
    
    @Named("mapStatusToString")
    default String mapStatusToString(Order.OrderStatus status) {
        return status != null ? status.name() : null;
    }
    
    @Named("mapPaymentStatusToString")
    default String mapPaymentStatusToString(Order.PaymentStatus paymentStatus) {
        return paymentStatus != null ? paymentStatus.name() : null;
    }
    
    @Named("mapStringToStatus")
    default Order.OrderStatus mapStringToStatus(String status) {
        if (status == null) return null;
        try {
            return Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    @Named("mapStringToPaymentStatus")
    default Order.PaymentStatus mapStringToPaymentStatus(String paymentStatus) {
        if (paymentStatus == null) return null;
        try {
            return Order.PaymentStatus.valueOf(paymentStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    @Named("mapStringToServiceType")
    default Order.ServiceType mapStringToServiceType(String serviceType) {
        if (serviceType == null) return null;
        try {
            return Order.ServiceType.valueOf(serviceType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
