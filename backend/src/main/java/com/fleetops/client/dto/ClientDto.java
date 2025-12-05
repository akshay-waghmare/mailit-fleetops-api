package com.fleetops.client.dto;

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
    private String name;
    private String address;
    private String contactPerson;
    private String contractNo;
    private String subContractName;
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
