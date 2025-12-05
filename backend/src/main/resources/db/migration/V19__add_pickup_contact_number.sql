-- Add contact_number column to pickups table (for backward compatibility with existing data)
-- This stores the client's contact number for communication during pickup

ALTER TABLE pickups ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);

-- Add foreign key constraint to client_id (if not already exists)
-- Note: Existing client_id column already exists, just adding FK constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pickup_client' 
        AND table_name = 'pickups'
    ) THEN
        ALTER TABLE pickups 
        ADD CONSTRAINT fk_pickup_client 
        FOREIGN KEY (client_id) REFERENCES clients(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for faster client lookups
CREATE INDEX IF NOT EXISTS idx_pickups_client_id ON pickups(client_id);
CREATE INDEX IF NOT EXISTS idx_pickups_contact_number ON pickups(contact_number);
