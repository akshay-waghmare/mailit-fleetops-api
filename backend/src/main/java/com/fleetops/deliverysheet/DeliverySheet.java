package com.fleetops.deliverysheet;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DeliverySheet entity - Represents a batch of deliveries assigned to an agent.
 * Epic E10: Minimal RBAC (User Management)
 * Tasks T033, T034.
 */
@Entity
@Table(name = "delivery_sheets")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverySheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sheet_number", nullable = false, unique = true, length = 50)
    private String sheetNumber;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private DeliverySheetStatus status;

    @Column(name = "assigned_agent_id", nullable = false)
    private Long assignedAgentId;

    @Column(name = "assigned_agent_name", length = 255)
    private String assignedAgentName;

    @Column(name = "total_orders", nullable = false)
    @Builder.Default
    private Integer totalOrders = 0;

    @Column(name = "total_cod_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalCodAmount = BigDecimal.ZERO;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(
        mappedBy = "deliverySheet",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<DeliverySheetOrder> orders = new ArrayList<>();

    /**
     * Attach an order link to this delivery sheet.
     */
    public void addOrderLink(DeliverySheetOrder orderLink) {
        orders.add(orderLink);
        orderLink.setDeliverySheet(this);
    }

    /**
     * Remove all linked orders.
     */
    public void clearOrderLinks() {
        orders.forEach(link -> link.setDeliverySheet(null));
        orders.clear();
    }
}
