package com.fleetops.order.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public class CreateOrderDto {
    
    // Client Information
    @JsonProperty("client_id")
    private Long clientId;
    
    @NotBlank(message = "Client name is required")
    @Size(max = 255, message = "Client name must not exceed 255 characters")
    @JsonProperty("client_name")
    private String clientName;
    
    @Size(max = 255, message = "Client company must not exceed 255 characters")
    @JsonProperty("client_company")
    private String clientCompany;
    
    @Size(max = 20, message = "Contact number must not exceed 20 characters")
    @JsonProperty("contact_number")
    private String contactNumber;
    
    // Sender Information
    @NotBlank(message = "Sender name is required")
    @Size(max = 255, message = "Sender name must not exceed 255 characters")
    @JsonProperty("sender_name")
    private String senderName;
    
    @NotBlank(message = "Sender address is required")
    @JsonProperty("sender_address")
    private String senderAddress;
    
    @NotBlank(message = "Sender contact is required")
    @Size(max = 20, message = "Sender contact must not exceed 20 characters")
    @JsonProperty("sender_contact")
    private String senderContact;
    
    @Email(message = "Sender email must be valid")
    @JsonProperty("sender_email")
    private String senderEmail;
    
    @Size(max = 10, message = "Sender pincode must not exceed 10 characters")
    @JsonProperty("sender_pincode")
    private String senderPincode;
    
    @Size(max = 100, message = "Sender city must not exceed 100 characters")
    @JsonProperty("sender_city")
    private String senderCity;
    
    @Size(max = 100, message = "Sender state must not exceed 100 characters")
    @JsonProperty("sender_state")
    private String senderState;
    
    // Receiver Information
    @NotBlank(message = "Receiver name is required")
    @Size(max = 255, message = "Receiver name must not exceed 255 characters")
    @JsonProperty("receiver_name")
    private String receiverName;
    
    @NotBlank(message = "Receiver address is required")
    @JsonProperty("receiver_address")
    private String receiverAddress;
    
    @NotBlank(message = "Receiver contact is required")
    @Size(max = 20, message = "Receiver contact must not exceed 20 characters")
    @JsonProperty("receiver_contact")
    private String receiverContact;
    
    @Email(message = "Receiver email must be valid")
    @JsonProperty("receiver_email")
    private String receiverEmail;
    
    @NotBlank(message = "Receiver pincode is required")
    @Size(max = 10, message = "Receiver pincode must not exceed 10 characters")
    @JsonProperty("receiver_pincode")
    private String receiverPincode;
    
    @NotBlank(message = "Receiver city is required")
    @Size(max = 100, message = "Receiver city must not exceed 100 characters")
    @JsonProperty("receiver_city")
    private String receiverCity;
    
    @Size(max = 100, message = "Receiver state must not exceed 100 characters")
    @JsonProperty("receiver_state")
    private String receiverState;
    
    // Package Details
    @Min(value = 1, message = "Item count must be at least 1")
    @JsonProperty("item_count")
    private Integer itemCount = 1;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Total weight must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid weight format")
    @JsonProperty("total_weight")
    private BigDecimal totalWeight;
    
    @DecimalMin(value = "0.0", message = "Length must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Invalid length format")
    @JsonProperty("length_cm")
    private BigDecimal lengthCm;
    
    @DecimalMin(value = "0.0", message = "Width must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Invalid width format")
    @JsonProperty("width_cm")
    private BigDecimal widthCm;
    
    @DecimalMin(value = "0.0", message = "Height must be non-negative")
    @Digits(integer = 6, fraction = 2, message = "Invalid height format")
    @JsonProperty("height_cm")
    private BigDecimal heightCm;
    
    @JsonProperty("item_description")
    private String itemDescription;
    
    @DecimalMin(value = "0.0", message = "Declared value must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Invalid declared value format")
    @JsonProperty("declared_value")
    private BigDecimal declaredValue;
    
    // Service Details
    @NotNull(message = "Service type is required")
    @JsonProperty("service_type")
    private ServiceType serviceType;
    
    @NotBlank(message = "Carrier name is required")
    @Size(max = 100, message = "Carrier name must not exceed 100 characters")
    @JsonProperty("carrier_name")
    private String carrierName;
    
    @JsonProperty("carrier_id")
    private String carrierId;
    
    // Staff Assignment
    @JsonProperty("assigned_staff_id")
    private Long assignedStaffId;
    
    @Size(max = 255, message = "Assigned staff name must not exceed 255 characters")
    @JsonProperty("assigned_staff_name")
    private String assignedStaffName;
    
    @Size(max = 100, message = "Staff department must not exceed 100 characters")
    @JsonProperty("staff_department")
    private String staffDepartment;
    
    // Delivery Information
    @JsonProperty("estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;
    
    @JsonProperty("delivery_instructions")
    private String deliveryInstructions;
    
    // Financial Information
    @DecimalMin(value = "0.0", message = "COD amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Invalid COD amount format")
    @JsonProperty("cod_amount")
    private BigDecimal codAmount = BigDecimal.ZERO;
    
    @DecimalMin(value = "0.0", message = "Shipping cost must be non-negative")
    @Digits(integer = 8, fraction = 2, message = "Invalid shipping cost format")
    @JsonProperty("shipping_cost")
    private BigDecimal shippingCost;
    
    @DecimalMin(value = "0.0", message = "Tax amount must be non-negative")
    @Digits(integer = 8, fraction = 2, message = "Invalid tax amount format")
    @JsonProperty("tax_amount")
    private BigDecimal taxAmount;
    
    // Additional Fields
    @JsonProperty("special_instructions")
    private String specialInstructions;
    
    // Metadata
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    // Enums
    public enum ServiceType {
        EXPRESS, STANDARD, ECONOMY;
        
        @JsonCreator
        public static ServiceType fromString(String value) {
            if (value == null) return null;
            try {
                return valueOf(value.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Handle case where the value doesn't match any enum
                throw new IllegalArgumentException("Invalid service type: " + value + ". Valid values are: EXPRESS, STANDARD, ECONOMY");
            }
        }
        
        @JsonValue
        public String toValue() {
            return name().toLowerCase();
        }
    }
    
    // Constructors
    public CreateOrderDto() {}
    
    // Getters and Setters
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
    
    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }
    
    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
    
    public String getStaffDepartment() { return staffDepartment; }
    public void setStaffDepartment(String staffDepartment) { this.staffDepartment = staffDepartment; }
    
    public LocalDate getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDate estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }
    
    public String getDeliveryInstructions() { return deliveryInstructions; }
    public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }
    
    public BigDecimal getCodAmount() { return codAmount; }
    public void setCodAmount(BigDecimal codAmount) { this.codAmount = codAmount; }
    
    public BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
