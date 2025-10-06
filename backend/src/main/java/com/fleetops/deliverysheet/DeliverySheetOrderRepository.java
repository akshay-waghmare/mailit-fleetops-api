package com.fleetops.deliverysheet;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * DeliverySheetOrderRepository - Data access for delivery sheet order links.
 */
public interface DeliverySheetOrderRepository extends JpaRepository<DeliverySheetOrder, Long> {

    List<DeliverySheetOrder> findByDeliverySheetId(Long deliverySheetId);
}
