package com.fleetops.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for partial order updates via PATCH requests.
 * All fields are optional - only provided fields will be updated.
 * No validation annotations to allow partial updates.
 */
public class UpdateOrderDto {
    
    // Client Information
    @JsonProperty("client_name")
    private String clientName;
    
    @JsonProperty("client_company")
    private String clientCompany;
    
    @JsonProperty("contact_number")
    private String contactNumber;
    
    // Sender Information
    @JsonProperty("sender_name")
    private String senderName;
    
    @JsonProperty("sender_address")
    private String senderAddress;
    
    @JsonProperty("sender_contact")
    private String senderContact;
    
    @JsonProperty("sender_email")
    private String senderEmail;
    
    @JsonProperty("sender_pincode")
    private String senderPincode;
    
    @JsonProperty("sender_city")
    private String senderCity;
    
    @JsonProperty("sender_state")
    private String senderState;
    
    // Receiver Information
    @JsonProperty("receiver_name")
    private String receiverName;
    
    @JsonProperty("receiver_address")
    private String receiverAddress;
    
    @JsonProperty("receiver_contact")
    private String receiverContact;
    
    @JsonProperty("receiver_email")
    private String receiverEmail;
    
    @JsonProperty("receiver_pincode")
    private String receiverPincode;
    
    @JsonProperty("receiver_city")
    private String receiverCity;
    
    @JsonProperty("receiver_state")
    private String receiverState;
    
    // Package Details
    @JsonProperty("item_count")
    private Integer itemCount;
    
    @JsonProperty("total_weight")
    private BigDecimal totalWeight;
    
    @JsonProperty("length_cm")
    private BigDecimal lengthCm;
    
    @JsonProperty("width_cm")
    private BigDecimal widthCm;
    
    @JsonProperty("height_cm")
    private BigDecimal heightCm;
    
    @JsonProperty("item_description")
    private String itemDescription;
    
    @JsonProperty("declared_value")
    private BigDecimal declaredValue;
    
    // Service Details
    @JsonProperty("service_type")
    private CreateOrderDto.ServiceType serviceType;
    
    @JsonProperty("carrier_name")
    private String carrierName;
    
    @JsonProperty("carrier_id")
    private String carrierId;
    
    // Status and Delivery
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;
    
    @JsonProperty("actual_delivery_date")
    private LocalDate actualDeliveryDate;
    
    @JsonProperty("delivery_time")
    private String deliveryTime;
    
    @JsonProperty("delivery_instructions")
    private String deliveryInstructions;
    
    // Financial Details
    @JsonProperty("cod_amount")
    private BigDecimal codAmount;
    
    @JsonProperty("shipping_cost")
    private BigDecimal shippingCost;
    
    @JsonProperty("tax_amount")
    private BigDecimal taxAmount;
    
    @JsonProperty("total_amount")
    private BigDecimal totalAmount;
    
    @JsonProperty("payment_status")
    private String paymentStatus;
    
    // Staff Assignment
    @JsonProperty("assigned_staff_id")
    private Long assignedStaffId;
    
    @JsonProperty("assigned_staff_name")
    private String assignedStaffName;
    
    @JsonProperty("staff_department")
    private String staffDepartment;
    
    // Additional Fields
    @JsonProperty("special_instructions")
    private String specialInstructions;
    
    @JsonProperty("rating")
    private Integer rating;
    
    @JsonProperty("customer_feedback")
    private String customerFeedback;
    
    // Default constructor
    public UpdateOrderDto() {}
    
    // Getters and Setters
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
    
    public CreateOrderDto.ServiceType getServiceType() { return serviceType; }
    public void setServiceType(CreateOrderDto.ServiceType serviceType) { this.serviceType = serviceType; }
    
    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }
    
    public String getCarrierId() { return carrierId; }
    public void setCarrierId(String carrierId) { this.carrierId = carrierId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDate getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
    
    public LocalDate getActualDeliveryDate() { return actualDeliveryDate; }
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) { this.actualDeliveryDate = actualDeliveryDate; }
    
    public String getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; }
    
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
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }
    
    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
    
    public String getStaffDepartment() { return staffDepartment; }
    public void setStaffDepartment(String staffDepartment) { this.staffDepartment = staffDepartment; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getCustomerFeedback() { return customerFeedback; }
    public void setCustomerFeedback(String customerFeedback) { this.customerFeedback = customerFeedback; }
}
