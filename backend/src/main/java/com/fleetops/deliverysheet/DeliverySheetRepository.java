package com.fleetops.deliverysheet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * DeliverySheetRepository - Data access for delivery sheets.
 */
public interface DeliverySheetRepository extends JpaRepository<DeliverySheet, Long> {

    @Query("SELECT ds FROM DeliverySheet ds " +
           "WHERE (:status IS NULL OR ds.status = :status) " +
           "AND (:assignedAgentId IS NULL OR ds.assignedAgentId = :assignedAgentId)")
    Page<DeliverySheet> findAllFiltered(
        @Param("status") DeliverySheetStatus status,
        @Param("assignedAgentId") Long assignedAgentId,
        Pageable pageable
    );

    @Query("SELECT ds FROM DeliverySheet ds " +
           "WHERE ds.assignedAgentId = :agentId " +
           "AND (:status IS NULL OR ds.status = :status)")
    Page<DeliverySheet> findByAssignedAgentIdAndStatus(
        @Param("agentId") Long agentId,
        @Param("status") DeliverySheetStatus status,
        Pageable pageable
    );

    boolean existsBySheetNumber(String sheetNumber);
}
