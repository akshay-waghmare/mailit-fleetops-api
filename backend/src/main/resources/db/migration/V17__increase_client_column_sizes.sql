-- Increase column sizes for clients table to accommodate longer values

-- Increase contract_no and sub_contract_code to 100 characters
ALTER TABLE clients ALTER COLUMN contract_no TYPE VARCHAR(100);
ALTER TABLE clients ALTER COLUMN sub_contract_code TYPE VARCHAR(100);

-- Increase GST number to 100 characters (some can be long)
ALTER TABLE clients ALTER COLUMN v_bill_gst_no TYPE VARCHAR(100);

-- Increase state code to 100 characters
ALTER TABLE clients ALTER COLUMN v_bill_stae_code TYPE VARCHAR(100);

-- Increase mobile numbers to 100 characters (could have extensions, multiple numbers)
ALTER TABLE clients ALTER COLUMN v_contact_mobile TYPE VARCHAR(100);
ALTER TABLE clients ALTER COLUMN v_bill_mobile TYPE VARCHAR(100);
