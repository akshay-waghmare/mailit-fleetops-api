package com.fleetops.bulkupload.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for creating orders from Excel bulk upload
 * Maps to 19 Excel columns with comprehensive validation
 * Used for parsing Excel rows and validating before order creation
 */
@Data
@NoArgsConstructor
public class CreateOrderDto {

    // Client Information
    @Size(max = 100, message = "Client reference must not exceed 100 characters")
    private String clientReference; // Optional - preferred for idempotency

    private Long clientId; // Optional - can be derived from other fields

    @NotBlank(message = "Client name is required")
    @Size(max = 255, message = "Client name must not exceed 255 characters")
    private String clientName;

    @Size(max = 255, message = "Client company must not exceed 255 characters")
    private String clientCompany;

    @Size(max = 20, message = "Contact number must not exceed 20 characters")
    private String contactNumber;

    // Sender Information
    @NotBlank(message = "Sender name is required")
    @Size(max = 255, message = "Sender name must not exceed 255 characters")
    private String senderName;

    @NotBlank(message = "Sender address is required")
    @Size(max = 1000, message = "Sender address must not exceed 1000 characters")
    private String senderAddress;

    @NotBlank(message = "Sender contact is required")
    @Size(max = 20, message = "Sender contact must not exceed 20 characters")
    private String senderContact;

    @Email(message = "Sender email must be valid")
    @Size(max = 255, message = "Sender email must not exceed 255 characters")
    private String senderEmail;

    // Receiver Information
    @NotBlank(message = "Receiver name is required")
    @Size(max = 255, message = "Receiver name must not exceed 255 characters")
    private String receiverName;

    @NotBlank(message = "Receiver address is required")
    @Size(max = 1000, message = "Receiver address must not exceed 1000 characters")
    private String receiverAddress;

    @NotBlank(message = "Receiver contact is required")
    @Size(max = 20, message = "Receiver contact must not exceed 20 characters")
    private String receiverContact;

    @Email(message = "Receiver email must be valid")
    @Size(max = 255, message = "Receiver email must not exceed 255 characters")
    private String receiverEmail;

    @NotBlank(message = "Receiver pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Receiver pincode must be exactly 6 digits")
    private String receiverPincode;

    @NotBlank(message = "Receiver city is required")
    @Size(max = 100, message = "Receiver city must not exceed 100 characters")
    private String receiverCity;

    @Size(max = 100, message = "Receiver state must not exceed 100 characters")
    private String receiverState;

    // Package Details
    @NotNull(message = "Item count is required")
    @Min(value = 1, message = "Item count must be at least 1")
    private Integer itemCount;

    @NotNull(message = "Total weight is required")
    @DecimalMin(value = "0.01", message = "Total weight must be greater than 0")
    @DecimalMax(value = "999.99", message = "Total weight must not exceed 999.99 kg")
    private BigDecimal totalWeight;

    @DecimalMin(value = "0.1", message = "Length must be greater than 0")
    @DecimalMax(value = "999.9", message = "Length must not exceed 999.9 cm")
    private BigDecimal lengthCm;

    @DecimalMin(value = "0.1", message = "Width must be greater than 0")
    @DecimalMax(value = "999.9", message = "Width must not exceed 999.9 cm")
    private BigDecimal widthCm;

    @DecimalMin(value = "0.1", message = "Height must be greater than 0")
    @DecimalMax(value = "999.9", message = "Height must not exceed 999.9 cm")
    private BigDecimal heightCm;

    @Size(max = 500, message = "Item description must not exceed 500 characters")
    private String itemDescription;

    @DecimalMin(value = "0.00", message = "Declared value must not be negative")
    @DecimalMax(value = "100000.00", message = "Declared value must not exceed 100,000")
    private BigDecimal declaredValue;

    // Service Details
    @NotBlank(message = "Service type is required")
    @Pattern(regexp = "^(express|standard|economy)$", message = "Service type must be express, standard, or economy")
    private String serviceType;

    @NotBlank(message = "Carrier name is required")
    @Size(max = 100, message = "Carrier name must not exceed 100 characters")
    private String carrierName;

    @Size(max = 64, message = "Carrier ID must not exceed 64 characters")
    private String carrierId;

    // Financial Information
    @DecimalMin(value = "0.00", message = "COD amount must not be negative")
    @DecimalMax(value = "50000.00", message = "COD amount must not exceed 50,000")
    private BigDecimal codAmount;

    // Additional Fields
    @Size(max = 1000, message = "Special instructions must not exceed 1000 characters")
    private String specialInstructions;
}
