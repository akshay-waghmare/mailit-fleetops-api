package com.fleetops.order.controller;

import com.fleetops.order.dto.CreateOrderDto;
import com.fleetops.order.dto.OrderDto;
import com.fleetops.order.dto.UpdateOrderStatusDto;
import com.fleetops.order.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    private final OrderService orderService;
    
    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    // CRUD Endpoints
    
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderDto createOrderDto) {
        logger.info("Creating order for client: {}", createOrderDto.getClientName());
        OrderDto createdOrder = orderService.createOrder(createOrderDto);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable Long id) {
        logger.debug("Getting order with id: {}", id);
        OrderDto order = orderService.getOrder(id);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/by-order-id/{orderId}")
    public ResponseEntity<OrderDto> getOrderByOrderId(@PathVariable String orderId) {
        logger.debug("Getting order with orderId: {}", orderId);
        OrderDto order = orderService.getOrderByOrderId(orderId);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/by-tracking-number/{trackingNumber}")
    public ResponseEntity<OrderDto> getOrderByTrackingNumber(@PathVariable String trackingNumber) {
        logger.debug("Getting order with tracking number: {}", trackingNumber);
        OrderDto order = orderService.getOrderByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping
    public ResponseEntity<Page<OrderDto>> getAllOrders(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long assignedStaffId,
            @RequestParam(required = false) String carrierName,
            @RequestParam(required = false) String receiverCity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean fullTextSearch) {
        
        logger.debug("Getting orders with filters - status: {}, serviceType: {}, search: {}", 
                    status, serviceType, search);
        
        Page<OrderDto> orders;
        
        if (search != null && !search.trim().isEmpty()) {
            orders = orderService.searchOrders(search.trim(), fullTextSearch, pageable);
        } else {
            orders = orderService.getOrdersWithFilters(
                    status, serviceType, paymentStatus, clientId, assignedStaffId,
                    carrierName, receiverCity, startDate, endDate, pageable);
        }
        
        return ResponseEntity.ok(orders);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> updateOrder(@PathVariable Long id, 
                                               @Valid @RequestBody CreateOrderDto updateOrderDto) {
        logger.info("Updating order with id: {}", id);
        OrderDto updatedOrder = orderService.updateOrder(id, updateOrderDto);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, 
                                                     @Valid @RequestBody UpdateOrderStatusDto statusDto) {
        logger.info("Updating status for order with id: {} to status: {}", id, statusDto.getStatus());
        OrderDto updatedOrder = orderService.updateOrderStatus(id, statusDto);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        logger.info("Deleting order with id: {}", id);
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
    
    // Analytics Endpoints
    
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getOrderAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        
        logger.debug("Getting order analytics for period: {} to {}", startDate, endDate);
        
        Map<String, Object> analytics;
        if (startDate != null && endDate != null) {
            analytics = orderService.getOrderAnalytics(startDate, endDate);
        } else {
            analytics = orderService.getOrderAnalytics();
        }
        
        return ResponseEntity.ok(analytics);
    }
    
    // Dashboard Endpoints
    
    @GetMapping("/recent")
    public ResponseEntity<List<OrderDto>> getRecentOrders() {
        logger.debug("Getting recent orders");
        List<OrderDto> recentOrders = orderService.getRecentOrders();
        return ResponseEntity.ok(recentOrders);
    }
    
    @GetMapping("/attention-required")
    public ResponseEntity<List<OrderDto>> getOrdersRequiringAttention() {
        logger.debug("Getting orders requiring attention");
        List<OrderDto> ordersRequiringAttention = orderService.getOrdersRequiringAttention();
        return ResponseEntity.ok(ordersRequiringAttention);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<OrderDto>> getOverdueOrders() {
        logger.debug("Getting overdue orders");
        List<OrderDto> overdueOrders = orderService.getOverdueOrders();
        return ResponseEntity.ok(overdueOrders);
    }
    
    // Real-time Updates
    
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToOrderUpdates(
            @RequestParam(required = false) String clientId) {
        
        String actualClientId = clientId != null ? clientId : UUID.randomUUID().toString();
        logger.info("Client {} subscribing to order updates", actualClientId);
        
        return orderService.subscribeToOrderUpdates(actualClientId);
    }
    
    // Utility Endpoints
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "OrderService",
                "timestamp", Instant.now().toString()
        ));
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getOrderCounts() {
        Map<String, Object> analytics = orderService.getOrderAnalytics();
        @SuppressWarnings("unchecked")
        Map<String, Long> statusCounts = (Map<String, Long>) analytics.get("statusCounts");
        
        long totalCount = statusCounts.values().stream().mapToLong(Long::longValue).sum();
        
        Map<String, Long> counts = Map.of(
                "total", totalCount,
                "pending", statusCounts.getOrDefault("PENDING", 0L),
                "confirmed", statusCounts.getOrDefault("CONFIRMED", 0L),
                "in_transit", statusCounts.getOrDefault("IN_TRANSIT", 0L),
                "delivered", statusCounts.getOrDefault("DELIVERED", 0L),
                "cancelled", statusCounts.getOrDefault("CANCELLED", 0L)
        );
        
        return ResponseEntity.ok(counts);
    }
}
