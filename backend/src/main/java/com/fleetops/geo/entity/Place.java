package com.fleetops.geo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.locationtech.jts.geom.Point;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "places")
@Data
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @NotNull
    @Column(columnDefinition = "BLOB", nullable = false)
    private Point location;

    private String address;

    @Column(name = "address_line_1")
    private String addressLine1;

    @Column(name = "address_line_2")
    private String addressLine2;

    private String city;

    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    private String country;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "contact_person")
    private String contactPerson;

    @Enumerated(EnumType.STRING)
    private PlaceType type;

    @Column(name = "organization_id")
    private UUID organizationId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PlaceType {
        DEPOT, WAREHOUSE, CUSTOMER, PICKUP_POINT, DELIVERY_POINT, SERVICE_CENTER
    }
}
