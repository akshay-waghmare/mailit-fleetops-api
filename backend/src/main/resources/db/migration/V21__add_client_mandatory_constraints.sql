-- Add NOT NULL constraints for mandatory client fields

-- Set default values for existing NULL records (if any)
UPDATE clients 
SET contract_no = 'UNKNOWN-' || id::text 
WHERE contract_no IS NULL OR contract_no = '';

UPDATE clients 
SET sub_contract_code = 'UNKNOWN-' || id::text 
WHERE sub_contract_code IS NULL OR sub_contract_code = '';

UPDATE clients 
SET sub_contract_name = 'Unknown Client' 
WHERE sub_contract_name IS NULL OR sub_contract_name = '';

-- Add NOT NULL constraints for mandatory unique fields
ALTER TABLE clients 
ALTER COLUMN contract_no SET NOT NULL,
ALTER COLUMN sub_contract_code SET NOT NULL,
ALTER COLUMN sub_contract_name SET NOT NULL;

-- Also ensure the core 'name' field is set
UPDATE clients 
SET name = sub_contract_name 
WHERE name IS NULL OR name = '';

ALTER TABLE clients 
ALTER COLUMN name SET NOT NULL;

-- Set default values for address and contact_person if NULL
UPDATE clients 
SET address = COALESCE(v_address, 'Unknown Address') 
WHERE address IS NULL OR address = '';

UPDATE clients 
SET contact_person = COALESCE(v_contact_person, 'Unknown Contact') 
WHERE contact_person IS NULL OR contact_person = '';

-- Add NOT NULL constraints for address and contact_person
ALTER TABLE clients 
ALTER COLUMN address SET NOT NULL,
ALTER COLUMN contact_person SET NOT NULL;
