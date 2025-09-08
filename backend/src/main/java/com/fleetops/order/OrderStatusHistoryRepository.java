package com.fleetops.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
    
    // Find status history for a specific order
    List<OrderStatusHistory> findByOrderIdOrderByChangedAtDesc(Long orderId);
    
    // Find status history by user
    List<OrderStatusHistory> findByChangedByOrderByChangedAtDesc(String changedBy);
    
    // Find status changes in date range
    List<OrderStatusHistory> findByChangedAtBetweenOrderByChangedAtDesc(Instant startDate, Instant endDate);
    
    // Find specific status transitions
    List<OrderStatusHistory> findByFromStatusAndToStatusOrderByChangedAtDesc(String fromStatus, String toStatus);
    
    // Find status changes for specific order with pagination
    Page<OrderStatusHistory> findByOrderIdOrderByChangedAtDesc(Long orderId, Pageable pageable);
    
    // Analytics queries
    @Query("SELECT h.toStatus, COUNT(h) FROM OrderStatusHistory h WHERE h.changedAt >= :startDate AND h.changedAt <= :endDate GROUP BY h.toStatus")
    List<Object[]> getStatusChangeCountsInDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT h.changedBy, COUNT(h) FROM OrderStatusHistory h WHERE h.changedAt >= :startDate AND h.changedAt <= :endDate GROUP BY h.changedBy ORDER BY COUNT(h) DESC")
    List<Object[]> getMostActiveUsersInDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    // Recent status changes
    List<OrderStatusHistory> findTop20ByOrderByChangedAtDesc();
    
    // Get latest status for each order
    @Query("SELECT h FROM OrderStatusHistory h WHERE h.changedAt = (SELECT MAX(h2.changedAt) FROM OrderStatusHistory h2 WHERE h2.orderId = h.orderId)")
    List<OrderStatusHistory> findLatestStatusForAllOrders();
    
    // Count status changes for an order
    long countByOrderId(Long orderId);
}
