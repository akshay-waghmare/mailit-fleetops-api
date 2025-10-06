package com.fleetops.order;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id", unique = true, nullable = false)
    private String orderId;
    
    // Client Information
    @Column(name = "client_id")
    private Long clientId;
    
    @Column(name = "client_name", nullable = false)
    private String clientName;
    
    @Column(name = "client_company")
    private String clientCompany;
    
    @Column(name = "contact_number")
    private String contactNumber;
    
    // Sender Information
    @Column(name = "sender_name", nullable = false)
    private String senderName;
    
    @Column(name = "sender_address", nullable = false, columnDefinition = "TEXT")
    private String senderAddress;
    
    @Column(name = "sender_contact", nullable = false)
    private String senderContact;
    
    @Column(name = "sender_email")
    private String senderEmail;
    
    @Column(name = "sender_pincode")
    private String senderPincode;
    
    @Column(name = "sender_city")
    private String senderCity;
    
    @Column(name = "sender_state")
    private String senderState;
    
    // Receiver Information
    @Column(name = "receiver_name", nullable = false)
    private String receiverName;
    
    @Column(name = "receiver_address", nullable = false, columnDefinition = "TEXT")
    private String receiverAddress;
    
    @Column(name = "receiver_contact", nullable = false)
    private String receiverContact;
    
    @Column(name = "receiver_email")
    private String receiverEmail;
    
    @Column(name = "receiver_pincode", nullable = false)
    private String receiverPincode;
    
    @Column(name = "receiver_city", nullable = false)
    private String receiverCity;
    
    @Column(name = "receiver_state")
    private String receiverState;
    
    // Package Details
    @Column(name = "item_count")
    private Integer itemCount = 1;
    
    @Column(name = "total_weight", precision = 10, scale = 2)
    private BigDecimal totalWeight;
    
    @Column(name = "length_cm", precision = 8, scale = 2)
    private BigDecimal lengthCm;
    
    @Column(name = "width_cm", precision = 8, scale = 2)
    private BigDecimal widthCm;
    
    @Column(name = "height_cm", precision = 8, scale = 2)
    private BigDecimal heightCm;
    
    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;
    
    @Column(name = "declared_value", precision = 12, scale = 2)
    private BigDecimal declaredValue;
    
    // Service Details
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;
    
    @Column(name = "carrier_name", nullable = false)
    private String carrierName;
    
    @Column(name = "carrier_id")
    private String carrierId;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    // Status Management
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "status_updated_at")
    private Instant statusUpdatedAt;
    
    @Column(name = "status_updated_by")
    private String statusUpdatedBy;
    
    // Staff Assignment
    @Column(name = "assigned_staff_id")
    private Long assignedStaffId;
    
    @Column(name = "assigned_staff_name")
    private String assignedStaffName;
    
    @Column(name = "staff_department")
    private String staffDepartment;
    
    // Delivery Information
    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;
    
    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;
    
    @Column(name = "delivery_time")
    private LocalTime deliveryTime;
    
    @Column(name = "delivery_instructions", columnDefinition = "TEXT")
    private String deliveryInstructions;
    
    // Financial Information
    @Column(name = "cod_amount", precision = 12, scale = 2)
    private BigDecimal codAmount = BigDecimal.ZERO;
    
    @Column(name = "shipping_cost", precision = 10, scale = 2)
    private BigDecimal shippingCost;
    
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;
    
    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    // Additional Fields
    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;
    
    @Column(name = "rating", precision = 2, scale = 1)
    private BigDecimal rating;
    
    @Column(name = "customer_feedback", columnDefinition = "TEXT")
    private String customerFeedback;
    
    // Audit Fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    // Metadata
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();
    
    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();
    
    // Enums
    public enum ServiceType {
        EXPRESS, STANDARD, ECONOMY
    }
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED
    }
    
    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }
    
    // Constructors
    public Order() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    
    public String getClientCompany() { return clientCompany; }
    public void setClientCompany(String clientCompany) { this.clientCompany = clientCompany; }
    
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    
    public String getSenderAddress() { return senderAddress; }
    public void setSenderAddress(String senderAddress) { this.senderAddress = senderAddress; }
    
    public String getSenderContact() { return senderContact; }
    public void setSenderContact(String senderContact) { this.senderContact = senderContact; }
    
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    
    public String getSenderPincode() { return senderPincode; }
    public void setSenderPincode(String senderPincode) { this.senderPincode = senderPincode; }
    
    public String getSenderCity() { return senderCity; }
    public void setSenderCity(String senderCity) { this.senderCity = senderCity; }
    
    public String getSenderState() { return senderState; }
    public void setSenderState(String senderState) { this.senderState = senderState; }
    
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
    
    public String getReceiverContact() { return receiverContact; }
    public void setReceiverContact(String receiverContact) { this.receiverContact = receiverContact; }
    
    public String getReceiverEmail() { return receiverEmail; }
    public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }
    
    public String getReceiverPincode() { return receiverPincode; }
    public void setReceiverPincode(String receiverPincode) { this.receiverPincode = receiverPincode; }
    
    public String getReceiverCity() { return receiverCity; }
    public void setReceiverCity(String receiverCity) { this.receiverCity = receiverCity; }
    
    public String getReceiverState() { return receiverState; }
    public void setReceiverState(String receiverState) { this.receiverState = receiverState; }
    
    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }
    
    public BigDecimal getTotalWeight() { return totalWeight; }
    public void setTotalWeight(BigDecimal totalWeight) { this.totalWeight = totalWeight; }
    
    public BigDecimal getLengthCm() { return lengthCm; }
    public void setLengthCm(BigDecimal lengthCm) { this.lengthCm = lengthCm; }
    
    public BigDecimal getWidthCm() { return widthCm; }
    public void setWidthCm(BigDecimal widthCm) { this.widthCm = widthCm; }
    
    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }
    
    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }
    
    public BigDecimal getDeclaredValue() { return declaredValue; }
    public void setDeclaredValue(BigDecimal declaredValue) { this.declaredValue = declaredValue; }
    
    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    
    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }
    
    public String getCarrierId() { return carrierId; }
    public void setCarrierId(String carrierId) { this.carrierId = carrierId; }
    
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    
    public Instant getStatusUpdatedAt() { return statusUpdatedAt; }
    public void setStatusUpdatedAt(Instant statusUpdatedAt) { this.statusUpdatedAt = statusUpdatedAt; }
    
    public String getStatusUpdatedBy() { return statusUpdatedBy; }
    public void setStatusUpdatedBy(String statusUpdatedBy) { this.statusUpdatedBy = statusUpdatedBy; }
    
    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }
    
    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
    
    public String getStaffDepartment() { return staffDepartment; }
    public void setStaffDepartment(String staffDepartment) { this.staffDepartment = staffDepartment; }
    
    public LocalDate getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
    
    public LocalDate getActualDeliveryDate() { return actualDeliveryDate; }
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) { this.actualDeliveryDate = actualDeliveryDate; }
    
    public LocalTime getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(LocalTime deliveryTime) { this.deliveryTime = deliveryTime; }
    
    public String getDeliveryInstructions() { return deliveryInstructions; }
    public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }
    
    public BigDecimal getCodAmount() { return codAmount; }
    public void setCodAmount(BigDecimal codAmount) { this.codAmount = codAmount; }
    
    public BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public String getCustomerFeedback() { return customerFeedback; }
    public void setCustomerFeedback(String customerFeedback) { this.customerFeedback = customerFeedback; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
    public List<OrderStatusHistory> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<OrderStatusHistory> statusHistory) { this.statusHistory = statusHistory; }
    
    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", orderId='" + orderId + '\'' +
                ", clientName='" + clientName + '\'' +
                ", status=" + status +
                ", receiverName='" + receiverName + '\'' +
                ", receiverCity='" + receiverCity + '\'' +
                ", serviceType=" + serviceType +
                ", carrierName='" + carrierName + '\'' +
                '}';
    }
}
