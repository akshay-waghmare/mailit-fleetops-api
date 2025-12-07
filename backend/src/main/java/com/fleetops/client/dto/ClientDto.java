package com.fleetops.client.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientDto {
    private Long id;
    
    @NotBlank(message = "Client name is required")
    private String name;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "Contact person is required")
    private String contactPerson;
    
    @NotBlank(message = "Contract number is required")
    private String contractNo;
    
    @NotBlank(message = "Sub-contract name is required")
    private String subContractName;
    
    @NotBlank(message = "Sub-contract code is required")
    private String subContractCode;
    private String vAddress;
    private String vPincode;
    private String vCity;
    private String vState;
    private String vCountry;
    private String vContactPerson;
    private String vContactMobile;
    private String vContactEmail;
    private String vBillGstNo;
    private String vBillingName;
    private String vDeptName;
    private String vBillAddress1;
    private String vBillAddress2;
    private String vBillPincode;
    private String vBillState;
    private String vBillCity;
    private String vCcName;
    private String vBillCountry;
    private String vBillStaeCode;
    private String vBillKindAttn;
    private String vBillEmail;
    private String vBillMobile;
    private String vIntimationEmailIds;
    private Instant createdAt;
    private Instant updatedAt;
}
