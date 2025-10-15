package com.fleetops.deliverysheet.service;

import com.fleetops.deliverysheet.DeliverySheet;
import com.fleetops.deliverysheet.DeliverySheetOrder;
import com.fleetops.deliverysheet.DeliverySheetRepository;
import com.fleetops.deliverysheet.DeliverySheetStatus;
import com.fleetops.deliverysheet.dto.CreateDeliverySheetRequest;
import com.fleetops.deliverysheet.dto.DeliverySheetResponse;
import com.fleetops.deliverysheet.mapper.DeliverySheetMapper;
import com.fleetops.order.Order;
import com.fleetops.order.OrderRepository;
import com.fleetops.user.entity.User;
import com.fleetops.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * DeliverySheetService - Business logic for delivery sheet management.
 */
@Service
@Transactional
public class DeliverySheetService {

    private static final Logger logger = LoggerFactory.getLogger(DeliverySheetService.class);

    private final DeliverySheetRepository deliverySheetRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final DeliverySheetMapper deliverySheetMapper;

    public DeliverySheetService(
        DeliverySheetRepository deliverySheetRepository,
        UserRepository userRepository,
        OrderRepository orderRepository,
        DeliverySheetMapper deliverySheetMapper
    ) {
        this.deliverySheetRepository = deliverySheetRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.deliverySheetMapper = deliverySheetMapper;
    }

    /**
     * Create a new delivery sheet assigned to an agent.
     */
    public DeliverySheetResponse createDeliverySheet(CreateDeliverySheetRequest request, User createdBy) {
        Objects.requireNonNull(request, "CreateDeliverySheetRequest is required");

        User agent = userRepository.findById(request.getAssignedAgentId())
            .orElseThrow(() -> new IllegalArgumentException("Assigned agent not found"));

        if (!Boolean.TRUE.equals(agent.getIsActive())) {
            throw new IllegalArgumentException("Assigned agent is inactive");
        }

        if (!agent.hasRole("AGENT")) {
            throw new IllegalArgumentException("Assigned user is not an agent");
        }

        List<Long> orderIds = request.getOrderIds() != null
            ? request.getOrderIds()
            : List.of();

        List<Order> orders = orderIds.isEmpty()
            ? List.of()
            : orderRepository.findAllById(orderIds);

        if (!orderIds.isEmpty() && orders.size() != orderIds.size()) {
            throw new IllegalArgumentException("One or more orders were not found for this delivery sheet");
        }

        BigDecimal totalCodAmount = orders.stream()
            .map(order -> order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        DeliverySheet deliverySheet = DeliverySheet.builder()
            .sheetNumber(generateSheetNumber())
            .title(request.getTitle())
            .status(DeliverySheetStatus.OPEN)
            .assignedAgentId(agent.getId())
            .assignedAgentName(agent.getFullName())
            .totalOrders(orders.size())
            .totalCodAmount(totalCodAmount)
            .scheduledDate(request.getScheduledDate())
            .notes(request.getNotes())
            .metadata(buildMetadata(createdBy, orderIds))
            .build();

        if (!orders.isEmpty()) {
            orders.forEach(order -> deliverySheet.addOrderLink(
                DeliverySheetOrder.builder()
                    .orderId(order.getId())
                    .build()
            ));
        }

        DeliverySheet saved = deliverySheetRepository.save(deliverySheet);
        logger.info("Delivery sheet {} created for agent {}", saved.getSheetNumber(), agent.getUsername());
        return deliverySheetMapper.toResponse(saved);
    }

    /**
     * Update an existing delivery sheet.
     */
    public DeliverySheetResponse updateDeliverySheet(Long id, CreateDeliverySheetRequest request, User updatedBy) {
        Objects.requireNonNull(id, "Delivery sheet ID is required");
        Objects.requireNonNull(request, "UpdateDeliverySheetRequest is required");

        DeliverySheet deliverySheet = deliverySheetRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Delivery sheet not found with ID: " + id));

        // Validate agent
        User agent = userRepository.findById(request.getAssignedAgentId())
            .orElseThrow(() -> new IllegalArgumentException("Assigned agent not found"));

        if (!Boolean.TRUE.equals(agent.getIsActive())) {
            throw new IllegalArgumentException("Assigned agent is inactive");
        }

        if (!agent.hasRole("AGENT")) {
            throw new IllegalArgumentException("Assigned user is not an agent");
        }

        // Process order IDs
        List<Long> orderIds = request.getOrderIds() != null
            ? request.getOrderIds()
            : List.of();

        List<Order> orders = orderIds.isEmpty()
            ? List.of()
            : orderRepository.findAllById(orderIds);

        if (!orderIds.isEmpty() && orders.size() != orderIds.size()) {
            throw new IllegalArgumentException("One or more orders were not found for this delivery sheet");
        }

        BigDecimal totalCodAmount = orders.stream()
            .map(order -> order.getCodAmount() != null ? order.getCodAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Update delivery sheet fields
        deliverySheet.setTitle(request.getTitle());
        deliverySheet.setAssignedAgentId(agent.getId());
        deliverySheet.setAssignedAgentName(agent.getFullName());
        deliverySheet.setScheduledDate(request.getScheduledDate());
        deliverySheet.setNotes(request.getNotes());
        deliverySheet.setTotalOrders(orders.size());
        deliverySheet.setTotalCodAmount(totalCodAmount);

        // Clear existing order links and add new ones
        deliverySheet.clearOrderLinks();
        if (!orders.isEmpty()) {
            orders.forEach(order -> deliverySheet.addOrderLink(
                DeliverySheetOrder.builder()
                    .orderId(order.getId())
                    .build()
            ));
        }

        // Update metadata
        Map<String, Object> metadata = deliverySheet.getMetadata() != null 
            ? new HashMap<>(deliverySheet.getMetadata()) 
            : new HashMap<>();
        if (updatedBy != null) {
            metadata.put("updatedBy", updatedBy.getUsername());
        }
        metadata.put("updatedAt", LocalDate.now().toString());
        if (orderIds != null && !orderIds.isEmpty()) {
            metadata.put("orderIds", orderIds);
        }
        deliverySheet.setMetadata(metadata);

        DeliverySheet saved = deliverySheetRepository.save(deliverySheet);
        logger.info("Delivery sheet {} updated by {}", saved.getSheetNumber(), updatedBy != null ? updatedBy.getUsername() : "system");
        return deliverySheetMapper.toResponse(saved);
    }

    /**
     * Retrieve delivery sheets for staff/admin with optional filters.
     */
    @Transactional(readOnly = true)
    public Page<DeliverySheetResponse> getDeliverySheets(
        Long assignedAgentId,
        DeliverySheetStatus status,
        Pageable pageable
    ) {
        Page<DeliverySheet> result = deliverySheetRepository.findAllFiltered(status, assignedAgentId, pageable);
        return result.map(deliverySheetMapper::toResponse);
    }

    /**
     * Retrieve delivery sheets scoped to the authenticated user.
     */
    @Transactional(readOnly = true)
    public Page<DeliverySheetResponse> getDeliverySheetsForUser(
        User currentUser,
        DeliverySheetStatus status,
        Pageable pageable
    ) {
        Objects.requireNonNull(currentUser, "Authenticated user is required");

        if (currentUser.hasRole("AGENT")) {
            Page<DeliverySheet> result = deliverySheetRepository.findByAssignedAgentIdAndStatus(
                currentUser.getId(),
                status,
                pageable
            );
            return result.map(deliverySheetMapper::toResponse);
        }

        // ADMIN and STAFF default to full list
        return getDeliverySheets(null, status, pageable);
    }

    private Map<String, Object> buildMetadata(User createdBy, List<Long> orderIds) {
        Map<String, Object> metadata = new HashMap<>();
        if (createdBy != null) {
            metadata.put("createdBy", createdBy.getUsername());
        }
        metadata.put("createdAt", LocalDate.now().toString());
        if (orderIds != null && !orderIds.isEmpty()) {
            metadata.put("orderIds", orderIds);
        }
        return metadata;
    }

    private String generateSheetNumber() {
        String candidate = "DS" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        // Ensure uniqueness by regenerating if necessary (unlikely)
        while (deliverySheetRepository.existsBySheetNumber(candidate)) {
            candidate = "DS" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        return candidate;
    }
}
