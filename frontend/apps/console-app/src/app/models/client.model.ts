export interface Client {
    id?: number;
    name: string;
    address?: string;
    contactPerson?: string;
    
    // Component-specific fields (for UI compatibility)
    clientName?: string;
    accountNo?: string;
    city?: string;
    pincode?: string;
    active?: boolean;
    date?: string;
    
    // Legacy fields
    contractNo?: string;
    subContractName?: string;
    subContractCode?: string;
    vaddress?: string;
    vpincode?: string;
    vcity?: string;
    vstate?: string;
    vcountry?: string;
    vcontactPerson?: string;
    vcontactMobile?: string;
    vcontactEmail?: string;
    vbillGstNo?: string;
    vbillingName?: string;
    vdeptName?: string;
    vbillAddress1?: string;
    vbillAddress2?: string;
    vbillPincode?: string;
    vbillState?: string;
    vbillCity?: string;
    vccName?: string;
    vbillCountry?: string;
    vbillStaeCode?: string;
    vbillKindAttn?: string;
    vbillEmail?: string;
    vbillMobile?: string;
    vintimationEmailIds?: string;
    
    createdAt?: string;
    updatedAt?: string;
}
