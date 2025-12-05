-- Create clients table with legacy fields
-- Replaces previous assumption that table existed

CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    
    -- Legacy fields
    contract_no VARCHAR(50),
    sub_contract_name VARCHAR(255),
    sub_contract_code VARCHAR(50),
    v_address TEXT,
    v_pincode VARCHAR(20),
    v_city VARCHAR(100),
    v_state VARCHAR(100),
    v_country VARCHAR(100),
    v_contact_person VARCHAR(255),
    v_contact_mobile VARCHAR(50),
    v_contact_email VARCHAR(255),
    v_bill_gst_no VARCHAR(50),
    v_billing_name VARCHAR(255),
    v_dept_name VARCHAR(255),
    v_bill_address1 TEXT,
    v_bill_address2 TEXT,
    v_bill_pincode VARCHAR(20),
    v_bill_state VARCHAR(100),
    v_bill_city VARCHAR(100),
    v_cc_name VARCHAR(255),
    v_bill_country VARCHAR(100),
    v_bill_stae_code VARCHAR(50), -- Legacy typo preserved
    v_bill_kind_attn VARCHAR(255),
    v_bill_email VARCHAR(255),
    v_bill_mobile VARCHAR(50),
    v_intimation_emailids TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint on composite key
CREATE UNIQUE INDEX idx_clients_contract_subcontract ON clients(contract_no, sub_contract_code);
