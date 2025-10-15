package com.fleetops.order.service;

import com.fleetops.order.Order;
import com.fleetops.order.OrderRepository;
import com.fleetops.order.OrderStatusHistory;
import com.fleetops.order.OrderStatusHistoryRepository;
import com.fleetops.order.dto.CreateOrderDto;
import com.fleetops.order.dto.OrderDto;
import com.fleetops.order.dto.UpdateOrderDto;
import com.fleetops.order.dto.UpdateOrderStatusDto;
import com.fleetops.order.mapper.OrderMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final OrderMapper orderMapper;
    
    // Real-time SSE connections
    private final Map<String, SseEmitter> sseConnections = new ConcurrentHashMap<>();
    
    @Autowired
    public OrderService(OrderRepository orderRepository, 
                       OrderStatusHistoryRepository statusHistoryRepository,
                       OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.orderMapper = orderMapper;
    }
    
    // CRUD Operations
    
    public OrderDto createOrder(CreateOrderDto createOrderDto) {
        logger.info("Creating new order for client: {}", createOrderDto.getClientName());
        
        Order order = orderMapper.toEntity(createOrderDto);
        
        // Calculate total amount if not provided
        if (order.getTotalAmount() == null) {
            order.setTotalAmount(calculateTotalAmount(order));
        }
        
        // Set estimated delivery date if not provided
        if (order.getEstimatedDeliveryDate() == null) {
            order.setEstimatedDeliveryDate(calculateEstimatedDeliveryDate(order.getServiceType()));
        }
        
        // Generate tracking number
        if (order.getTrackingNumber() == null) {
            order.setTrackingNumber(generateTrackingNumber(order.getCarrierName()));
        }
        
        Order savedOrder = orderRepository.save(order);
        
    // Create initial status history (use DB primary key id)
    createStatusHistory(savedOrder.getId(), null, savedOrder.getStatus().name(), 
              "System", "Order created");
        
        // Send real-time update
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        sendRealTimeUpdate("ORDER_CREATED", orderDto);
        
        logger.info("Order created successfully with ID: {}", savedOrder.getOrderId());
        return orderDto;
    }
    
    public OrderDto getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        return orderMapper.toDto(order);
    }
    
    public OrderDto getOrderByOrderId(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with orderId: " + orderId));
        return orderMapper.toDto(order);
    }
    
    public OrderDto getOrderByTrackingNumber(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with tracking number: " + trackingNumber));
        return orderMapper.toDto(order);
    }
    
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::toDto);
    }
    
    public Page<OrderDto> getOrdersWithFilters(
            String status,
            String serviceType,
            String paymentStatus,
            Long clientId,
            Long assignedStaffId,
            String carrierName,
            String receiverCity,
            Instant startDate,
            Instant endDate,
            Pageable pageable) {
        
        // Convert string parameters to enums where needed
        Order.OrderStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status value: {}", status);
            }
        }
        
        Order.ServiceType serviceTypeEnum = null;
        if (serviceType != null && !serviceType.trim().isEmpty()) {
            try {
                serviceTypeEnum = Order.ServiceType.valueOf(serviceType.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid service type value: {}", serviceType);
            }
        }
        
        Order.PaymentStatus paymentStatusEnum = null;
        if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
            try {
                paymentStatusEnum = Order.PaymentStatus.valueOf(paymentStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid payment status value: {}", paymentStatus);
            }
        }
        
        // Convert null strings to empty strings to avoid type inference issues
        String safeCarrierName = (carrierName != null && !carrierName.trim().isEmpty()) ? carrierName.trim() : "";
        String safeReceiverCity = (receiverCity != null && !receiverCity.trim().isEmpty()) ? receiverCity.trim() : "";
        
        return orderRepository.findOrdersWithFilters(
            statusEnum, serviceTypeEnum, paymentStatusEnum, clientId, assignedStaffId,
            safeCarrierName, safeReceiverCity, startDate, endDate, pageable)
            .map(orderMapper::toDto);
    }
    
    public Page<OrderDto> searchOrders(String searchTerm, boolean useFullTextSearch, Pageable pageable) {
        if (useFullTextSearch) {
            return orderRepository.fullTextSearch(searchTerm, pageable).map(orderMapper::toDto);
        } else {
            return orderRepository.searchOrders(searchTerm, pageable).map(orderMapper::toDto);
        }
    }
    
    /**
     * Get orders assigned to a specific user (agent-scoped)
     * Orders are retrieved through delivery sheets assigned to the agent
     */
    public Page<OrderDto> getOrdersForUser(
            Long userId,
            String status,
            String serviceType,
            String paymentStatus,
            String carrierName,
            String receiverCity,
            Instant startDate,
            Instant endDate,
            Pageable pageable) {
        
        logger.debug("Getting orders for user ID: {} with filters", userId);
        
        // Convert string parameters to enums where needed
        Order.OrderStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = Order.OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status value: {}", status);
            }
        }
        
        Order.ServiceType serviceTypeEnum = null;
        if (serviceType != null && !serviceType.trim().isEmpty()) {
            try {
                serviceTypeEnum = Order.ServiceType.valueOf(serviceType.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid service type value: {}", serviceType);
            }
        }
        
        Order.PaymentStatus paymentStatusEnum = null;
        if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
            try {
                paymentStatusEnum = Order.PaymentStatus.valueOf(paymentStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid payment status value: {}", paymentStatus);
            }
        }
        
        String safeCarrierName = (carrierName != null && !carrierName.trim().isEmpty()) ? carrierName.trim() : "";
        String safeReceiverCity = (receiverCity != null && !receiverCity.trim().isEmpty()) ? receiverCity.trim() : "";
        
        // Use the agent-scoped repository method that joins through delivery sheets
        return orderRepository.findOrdersForUser(
            userId, statusEnum, serviceTypeEnum, paymentStatusEnum,
            safeCarrierName, safeReceiverCity, startDate, endDate, pageable)
            .map(orderMapper::toDto);
    }
    
    /**
     * Search orders assigned to a specific user (agent-scoped)
     */
    public Page<OrderDto> searchOrdersForUser(Long userId, String searchTerm, boolean useFullTextSearch, Pageable pageable) {
        logger.debug("Searching orders for user ID: {} with term: {}", userId, searchTerm);
        
        if (useFullTextSearch) {
            return orderRepository.fullTextSearchForUser(userId, searchTerm, pageable).map(orderMapper::toDto);
        } else {
            return orderRepository.searchOrdersForUser(userId, searchTerm, pageable).map(orderMapper::toDto);
        }
    }
    
    public OrderDto updateOrder(Long id, CreateOrderDto updateOrderDto) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        
        logger.info("Updating order: {}", existingOrder.getOrderId());
        
        orderMapper.updateEntityFromDto(updateOrderDto, existingOrder);
        
        // Recalculate total amount if relevant fields changed
        if (updateOrderDto.getShippingCost() != null || updateOrderDto.getTaxAmount() != null || updateOrderDto.getCodAmount() != null) {
            existingOrder.setTotalAmount(calculateTotalAmount(existingOrder));
        }
        
        Order savedOrder = orderRepository.save(existingOrder);
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        
        // Send real-time update
        sendRealTimeUpdate("ORDER_UPDATED", orderDto);
        
        logger.info("Order updated successfully: {}", savedOrder.getOrderId());
        return orderDto;
    }
    
    /**
     * Partially update an order using UpdateOrderDto.
     * Only provided fields will be updated, null/empty fields are ignored.
     */
    public OrderDto patchOrder(Long id, UpdateOrderDto updateOrderDto) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        
        logger.info("Partially updating order: {}", existingOrder.getOrderId());
        
        orderMapper.updateEntityFromUpdateDto(updateOrderDto, existingOrder);
        
        // Recalculate total amount if relevant fields changed
        if (updateOrderDto.getShippingCost() != null || updateOrderDto.getTaxAmount() != null || updateOrderDto.getCodAmount() != null) {
            existingOrder.setTotalAmount(calculateTotalAmount(existingOrder));
        }
        
        Order savedOrder = orderRepository.save(existingOrder);
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        
        // Send real-time update
        sendRealTimeUpdate("ORDER_UPDATED", orderDto);
        
        logger.info("Order partially updated successfully: {}", savedOrder.getOrderId());
        return orderDto;
    }
    
    public OrderDto updateOrderStatus(Long id, UpdateOrderStatusDto statusDto) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        
        String oldStatus = order.getStatus().name();
        Order.OrderStatus newStatus;
        
        try {
            newStatus = Order.OrderStatus.valueOf(statusDto.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusDto.getStatus());
        }
        
        logger.info("Updating order status from {} to {} for order: {}", oldStatus, newStatus, order.getOrderId());
        
        // Validate status transition
        if (!isValidStatusTransition(order.getStatus(), newStatus)) {
            throw new IllegalStateException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }
        
        order.setStatus(newStatus);
        order.setStatusUpdatedAt(Instant.now());
        order.setStatusUpdatedBy(statusDto.getUpdatedBy());
        
        // Set actual delivery date if status is DELIVERED
        if (newStatus == Order.OrderStatus.DELIVERED && order.getActualDeliveryDate() == null) {
            order.setActualDeliveryDate(LocalDate.now());
        }
        
        Order savedOrder = orderRepository.save(order);
        
    // Create status history (use DB primary key id)
    createStatusHistory(order.getId(), oldStatus, newStatus.name(), 
              statusDto.getUpdatedBy(), statusDto.getReason(), statusDto.getNotes(),
              statusDto.getLatitude(), statusDto.getLongitude());
        
        OrderDto orderDto = orderMapper.toDto(savedOrder);
        
        // Send real-time update
        sendRealTimeUpdate("ORDER_STATUS_UPDATED", orderDto);
        
        logger.info("Order status updated successfully: {} -> {}", oldStatus, newStatus);
        return orderDto;
    }
    
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        
        logger.info("Deleting order: {}", order.getOrderId());
        
        // Soft delete by updating status to CANCELLED
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        
    // Create status history (use DB primary key id)
    createStatusHistory(order.getId(), order.getStatus().name(), "CANCELLED", 
              "System", "Order cancelled/deleted");
        
        OrderDto orderDto = orderMapper.toDto(order);
        sendRealTimeUpdate("ORDER_DELETED", orderDto);
        
        logger.info("Order deleted successfully: {}", order.getOrderId());
    }
    
    // Analytics Methods
    
    public Map<String, Object> getOrderAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Status counts
        List<Object[]> statusCounts = orderRepository.getOrderCountByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] row : statusCounts) {
            statusMap.put(((Order.OrderStatus) row[0]).name(), (Long) row[1]);
        }
        analytics.put("statusCounts", statusMap);
        
        // Service type counts
        List<Object[]> serviceTypeCounts = orderRepository.getOrderCountByServiceType();
        Map<String, Long> serviceTypeMap = new HashMap<>();
        for (Object[] row : serviceTypeCounts) {
            serviceTypeMap.put(((Order.ServiceType) row[0]).name(), (Long) row[1]);
        }
        analytics.put("serviceTypeCounts", serviceTypeMap);
        
        // Payment status counts
        List<Object[]> paymentStatusCounts = orderRepository.getOrderCountByPaymentStatus();
        Map<String, Long> paymentStatusMap = new HashMap<>();
        for (Object[] row : paymentStatusCounts) {
            paymentStatusMap.put(((Order.PaymentStatus) row[0]).name(), (Long) row[1]);
        }
        analytics.put("paymentStatusCounts", paymentStatusMap);
        
        // Performance metrics
        long onTimeDeliveries = orderRepository.countOnTimeDeliveries();
        long lateDeliveries = orderRepository.countLateDeliveries();
        long totalDeliveries = onTimeDeliveries + lateDeliveries;
        
        analytics.put("onTimeDeliveries", onTimeDeliveries);
        analytics.put("lateDeliveries", lateDeliveries);
        analytics.put("onTimePercentage", totalDeliveries > 0 ? (double) onTimeDeliveries / totalDeliveries * 100 : 0);
        
        // Average rating
        Double avgRating = orderRepository.getAverageRating();
        analytics.put("averageRating", avgRating != null ? avgRating : 0.0);
        
        return analytics;
    }
    
    public Map<String, Object> getOrderAnalytics(Instant startDate, Instant endDate) {
        Map<String, Object> analytics = new HashMap<>();
        
        long orderCount = orderRepository.countOrdersInDateRange(startDate, endDate);
        Double totalRevenue = orderRepository.getTotalRevenueInDateRange(startDate, endDate);
        Double avgOrderValue = orderRepository.getAverageOrderValueInDateRange(startDate, endDate);
        
        analytics.put("orderCount", orderCount);
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        analytics.put("averageOrderValue", avgOrderValue != null ? avgOrderValue : 0.0);
        
        return analytics;
    }
    
    // Dashboard Methods
    
    public List<OrderDto> getRecentOrders() {
        return orderRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }
    
    public List<OrderDto> getOrdersRequiringAttention() {
        Instant cutoffTime = Instant.now().minus(24, ChronoUnit.HOURS);
        return orderRepository.findOrdersRequiringAttention(cutoffTime)
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }
    
    public List<OrderDto> getOverdueOrders() {
        return orderRepository.findOverdueOrders(LocalDate.now())
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }
    
    // Real-time Updates
    
    public SseEmitter subscribeToOrderUpdates(String clientId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        sseConnections.put(clientId, emitter);
        
        emitter.onCompletion(() -> sseConnections.remove(clientId));
        emitter.onTimeout(() -> sseConnections.remove(clientId));
        emitter.onError((ex) -> sseConnections.remove(clientId));
        
        logger.info("Client {} subscribed to order updates", clientId);
        return emitter;
    }
    
    private void sendRealTimeUpdate(String eventType, OrderDto orderDto) {
        Map<String, Object> update = new HashMap<>();
        update.put("type", eventType);
        update.put("data", orderDto);
        update.put("timestamp", Instant.now());
        
        sseConnections.entrySet().removeIf(entry -> {
            try {
                entry.getValue().send(SseEmitter.event()
                        .name("order-update")
                        .data(update));
                return false;
            } catch (Exception e) {
                logger.debug("Failed to send SSE update to client {}", entry.getKey());
                return true;
            }
        });
    }
    
    // Helper Methods
    
    private void createStatusHistory(Long orderId, String fromStatus, String toStatus, 
                                   String changedBy, String reason) {
        createStatusHistory(orderId, fromStatus, toStatus, changedBy, reason, null, null, null);
    }

    private void createStatusHistory(Long orderId, String fromStatus, String toStatus, 
                                   String changedBy, String reason, String notes,
                                   Double latitude, Double longitude) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(changedBy);
        history.setReason(reason);
        history.setNotes(notes);
        history.setLatitude(latitude != null ? BigDecimal.valueOf(latitude) : null);
        history.setLongitude(longitude != null ? BigDecimal.valueOf(longitude) : null);
        
        statusHistoryRepository.save(history);
    }
    
    private BigDecimal calculateTotalAmount(Order order) {
        BigDecimal total = BigDecimal.ZERO;
        
        if (order.getShippingCost() != null) {
            total = total.add(order.getShippingCost());
        }
        
        if (order.getTaxAmount() != null) {
            total = total.add(order.getTaxAmount());
        }
        
        if (order.getCodAmount() != null) {
            total = total.add(order.getCodAmount());
        }
        
        return total;
    }
    
    private LocalDate calculateEstimatedDeliveryDate(Order.ServiceType serviceType) {
        LocalDate now = LocalDate.now();
        return switch (serviceType) {
            case EXPRESS -> now.plusDays(1);
            case STANDARD -> now.plusDays(3);
            case ECONOMY -> now.plusDays(7);
        };
    }
    
    private String generateTrackingNumber(String carrierName) {
        String prefix = carrierName.substring(0, Math.min(3, carrierName.length())).toUpperCase();
        String suffix = String.format("%08d", Math.abs(UUID.randomUUID().hashCode() % 100000000));
        return prefix + suffix;
    }
    
    private boolean isValidStatusTransition(Order.OrderStatus from, Order.OrderStatus to) {
        return switch (from) {
            case PENDING -> to == Order.OrderStatus.CONFIRMED || to == Order.OrderStatus.CANCELLED;
            case CONFIRMED -> to == Order.OrderStatus.PICKED_UP || to == Order.OrderStatus.CANCELLED;
            case PICKED_UP -> to == Order.OrderStatus.IN_TRANSIT || to == Order.OrderStatus.RETURNED;
            case IN_TRANSIT -> to == Order.OrderStatus.DELIVERED || to == Order.OrderStatus.RETURNED;
            case DELIVERED, CANCELLED, RETURNED -> false; // Terminal states
        };
    }
}
