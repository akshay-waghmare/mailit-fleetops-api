package com.fleetops.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find by order ID (business key)
    Optional<Order> findByOrderId(String orderId);
    
    // Find by tracking number
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    // Find orders by status
    Page<Order> findByStatusIn(List<Order.OrderStatus> statuses, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    
    // Find orders by client
    Page<Order> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
    Page<Order> findByClientNameContainingIgnoreCaseOrderByCreatedAtDesc(String clientName, Pageable pageable);
    
    // Find orders by assigned staff
    Page<Order> findByAssignedStaffIdOrderByCreatedAtDesc(Long staffId, Pageable pageable);
    Page<Order> findByAssignedStaffNameContainingIgnoreCaseOrderByCreatedAtDesc(String staffName, Pageable pageable);
    
    // Find orders by carrier
    Page<Order> findByCarrierNameContainingIgnoreCaseOrderByCreatedAtDesc(String carrierName, Pageable pageable);
    
    // Find orders by receiver city
    Page<Order> findByReceiverCityContainingIgnoreCaseOrderByCreatedAtDesc(String city, Pageable pageable);
    
    // Find orders by service type
    Page<Order> findByServiceTypeOrderByCreatedAtDesc(Order.ServiceType serviceType, Pageable pageable);
    
    // Find orders by payment status
    Page<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus, Pageable pageable);
    
    // Date range queries
    Page<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(Instant startDate, Instant endDate, Pageable pageable);
    Page<Order> findByEstimatedDeliveryDateBetweenOrderByEstimatedDeliveryDateAsc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Order> findByActualDeliveryDateBetweenOrderByActualDeliveryDateDesc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Complex queries with multiple filters
    // Simplified JPQL query to avoid type inference issues with nullable parameters
    @Query("SELECT o FROM Order o WHERE " +
           "(:#{#status} IS NULL OR o.status = :#{#status}) AND " +
           "(:#{#serviceType} IS NULL OR o.serviceType = :#{#serviceType}) AND " +
           "(:#{#paymentStatus} IS NULL OR o.paymentStatus = :#{#paymentStatus}) AND " +
           "(:#{#clientId} IS NULL OR o.clientId = :#{#clientId}) AND " +
           "(:#{#assignedStaffId} IS NULL OR o.assignedStaffId = :#{#assignedStaffId}) AND " +
           "(:#{#carrierName} IS NULL OR :#{#carrierName} = '' OR LOWER(o.carrierName) LIKE LOWER(CONCAT('%', :#{#carrierName}, '%'))) AND " +
           "(:#{#receiverCity} IS NULL OR :#{#receiverCity} = '' OR LOWER(o.receiverCity) LIKE LOWER(CONCAT('%', :#{#receiverCity}, '%'))) AND " +
           "(:#{#startDate} IS NULL OR o.createdAt >= :#{#startDate}) AND " +
           "(:#{#endDate} IS NULL OR o.createdAt <= :#{#endDate}) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findOrdersWithFilters(
           @Param("status") Order.OrderStatus status,
           @Param("serviceType") Order.ServiceType serviceType,
           @Param("paymentStatus") Order.PaymentStatus paymentStatus,
           @Param("clientId") Long clientId,
           @Param("assignedStaffId") Long assignedStaffId,
           @Param("carrierName") String carrierName,
           @Param("receiverCity") String receiverCity,
           @Param("startDate") Instant startDate,
           @Param("endDate") Instant endDate,
           Pageable pageable);
    
    // Complex queries with multiple filters for agent-scoped orders (via delivery sheets)
    @Query("SELECT o FROM Order o WHERE o.id IN (" +
           "SELECT dso.orderId FROM DeliverySheetOrder dso " +
           "JOIN dso.deliverySheet ds " +
           "WHERE ds.assignedAgentId = :userId) AND " +
           "(:#{#status} IS NULL OR o.status = :#{#status}) AND " +
           "(:#{#serviceType} IS NULL OR o.serviceType = :#{#serviceType}) AND " +
           "(:#{#paymentStatus} IS NULL OR o.paymentStatus = :#{#paymentStatus}) AND " +
           "(:#{#carrierName} IS NULL OR :#{#carrierName} = '' OR LOWER(o.carrierName) LIKE LOWER(CONCAT('%', :#{#carrierName}, '%'))) AND " +
           "(:#{#receiverCity} IS NULL OR :#{#receiverCity} = '' OR LOWER(o.receiverCity) LIKE LOWER(CONCAT('%', :#{#receiverCity}, '%'))) AND " +
           "(:#{#startDate} IS NULL OR o.createdAt >= :#{#startDate}) AND " +
           "(:#{#endDate} IS NULL OR o.createdAt <= :#{#endDate}) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findOrdersForUser(
           @Param("userId") Long userId,
           @Param("status") Order.OrderStatus status,
           @Param("serviceType") Order.ServiceType serviceType,
           @Param("paymentStatus") Order.PaymentStatus paymentStatus,
           @Param("carrierName") String carrierName,
           @Param("receiverCity") String receiverCity,
           @Param("startDate") Instant startDate,
           @Param("endDate") Instant endDate,
           Pageable pageable);
    
    // Search queries
    @Query("SELECT o FROM Order o WHERE " +
           "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.clientName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.receiverCity) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.carrierName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> searchOrders(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Search queries for specific user (agent-scoped)
    // Join through delivery_sheet_orders to find orders in delivery sheets assigned to the agent
    @Query("SELECT o FROM Order o WHERE o.id IN (" +
           "SELECT dso.orderId FROM DeliverySheetOrder dso " +
           "JOIN dso.deliverySheet ds " +
           "WHERE ds.assignedAgentId = :userId) AND (" +
           "LOWER(o.orderId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.clientName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.receiverCity) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.carrierName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> searchOrdersForUser(@Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Full-text search (PostgreSQL specific)
    @Query(value = "SELECT * FROM orders WHERE " +
                   "to_tsvector('english', " +
                   "COALESCE(order_id, '') || ' ' || " +
                   "COALESCE(client_name, '') || ' ' || " +
                   "COALESCE(sender_name, '') || ' ' || " +
                   "COALESCE(receiver_name, '') || ' ' || " +
                   "COALESCE(receiver_city, '') || ' ' || " +
                   "COALESCE(carrier_name, '') || ' ' || " +
                   "COALESCE(tracking_number, '') || ' ' || " +
                   "COALESCE(item_description, '')) " +
                   "@@ plainto_tsquery('english', :searchTerm)",
           nativeQuery = true)
    Page<Order> fullTextSearch(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Full-text search for specific user (agent-scoped)
    // Join through delivery_sheet_orders to find orders in delivery sheets assigned to the agent
    @Query(value = "SELECT o.* FROM orders o " +
                   "WHERE o.id IN (" +
                   "  SELECT dso.order_id FROM delivery_sheet_orders dso " +
                   "  JOIN delivery_sheets ds ON ds.id = dso.delivery_sheet_id " +
                   "  WHERE ds.assigned_agent_id = :userId" +
                   ") AND " +
                   "to_tsvector('english', " +
                   "COALESCE(o.order_id, '') || ' ' || " +
                   "COALESCE(o.client_name, '') || ' ' || " +
                   "COALESCE(o.sender_name, '') || ' ' || " +
                   "COALESCE(o.receiver_name, '') || ' ' || " +
                   "COALESCE(o.receiver_city, '') || ' ' || " +
                   "COALESCE(o.carrier_name, '') || ' ' || " +
                   "COALESCE(o.tracking_number, '') || ' ' || " +
                   "COALESCE(o.item_description, '')) " +
                   "@@ plainto_tsquery('english', :searchTerm) " +
                   "ORDER BY o.created_at DESC",
           nativeQuery = true)
    Page<Order> fullTextSearchForUser(@Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Analytics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrderCountByStatus();
    
    @Query("SELECT o.serviceType, COUNT(o) FROM Order o GROUP BY o.serviceType")
    List<Object[]> getOrderCountByServiceType();
    
    @Query("SELECT o.paymentStatus, COUNT(o) FROM Order o GROUP BY o.paymentStatus")
    List<Object[]> getOrderCountByPaymentStatus();
    
    @Query("SELECT o.receiverCity, COUNT(o) FROM Order o GROUP BY o.receiverCity ORDER BY COUNT(o) DESC")
    List<Object[]> getTopDestinationCities(Pageable pageable);
    
    @Query("SELECT o.carrierName, COUNT(o) FROM Order o GROUP BY o.carrierName ORDER BY COUNT(o) DESC")
    List<Object[]> getTopCarriers(Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    long countOrdersInDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND o.paymentStatus = 'PAID'")
    Double getTotalRevenueInDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT AVG(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Double getAverageOrderValueInDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    // Performance queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.actualDeliveryDate <= o.estimatedDeliveryDate AND o.status = 'DELIVERED'")
    long countOnTimeDeliveries();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.actualDeliveryDate > o.estimatedDeliveryDate AND o.status = 'DELIVERED'")
    long countLateDeliveries();
    
    @Query("SELECT AVG(o.rating) FROM Order o WHERE o.rating IS NOT NULL")
    Double getAverageRating();
    
    // Recent orders for dashboard
    List<Order> findTop10ByOrderByCreatedAtDesc();
    
    // Orders requiring attention
    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDING', 'CONFIRMED') AND o.createdAt < :cutoffTime ORDER BY o.createdAt ASC")
    List<Order> findOrdersRequiringAttention(@Param("cutoffTime") Instant cutoffTime);
    
    @Query("SELECT o FROM Order o WHERE o.status = 'IN_TRANSIT' AND o.estimatedDeliveryDate < :today ORDER BY o.estimatedDeliveryDate ASC")
    List<Order> findOverdueOrders(@Param("today") LocalDate today);
}
