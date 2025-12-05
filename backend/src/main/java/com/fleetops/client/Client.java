package com.fleetops.client;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Existing fields (inferred from usage/migrations)
    private String name;
    
    @Column(columnDefinition = "text")
    private String address;
    
    @Column(name = "contact_person")
    private String contactPerson;

    // Legacy fields (V16)
    @Column(name = "contract_no")
    private String contractNo;

    @Column(name = "sub_contract_name")
    private String subContractName;

    @Column(name = "sub_contract_code")
    private String subContractCode;

    @Column(name = "v_address", columnDefinition = "text")
    private String vAddress;

    @Column(name = "v_pincode")
    private String vPincode;

    @Column(name = "v_city")
    private String vCity;

    @Column(name = "v_state")
    private String vState;

    @Column(name = "v_country")
    private String vCountry;

    @Column(name = "v_contact_person")
    private String vContactPerson;

    @Column(name = "v_contact_mobile")
    private String vContactMobile;

    @Column(name = "v_contact_email")
    private String vContactEmail;

    @Column(name = "v_bill_gst_no")
    private String vBillGstNo;

    @Column(name = "v_billing_name")
    private String vBillingName;

    @Column(name = "v_dept_name")
    private String vDeptName;

    @Column(name = "v_bill_address1", columnDefinition = "text")
    private String vBillAddress1;

    @Column(name = "v_bill_address2", columnDefinition = "text")
    private String vBillAddress2;

    @Column(name = "v_bill_pincode")
    private String vBillPincode;

    @Column(name = "v_bill_state")
    private String vBillState;

    @Column(name = "v_bill_city")
    private String vBillCity;

    @Column(name = "v_cc_name")
    private String vCcName;

    @Column(name = "v_bill_country")
    private String vBillCountry;

    @Column(name = "v_bill_stae_code") // Legacy typo preserved
    private String vBillStaeCode;

    @Column(name = "v_bill_kind_attn")
    private String vBillKindAttn;

    @Column(name = "v_bill_email")
    private String vBillEmail;

    @Column(name = "v_bill_mobile")
    private String vBillMobile;

    @Column(name = "v_intimation_emailids", columnDefinition = "text")
    private String vIntimationEmailIds;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
