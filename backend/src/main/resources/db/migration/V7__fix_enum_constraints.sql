-- Fix enum constraints to match Java enum case (uppercase)
-- This aligns the database constraints with the Java enum values being stored

-- Drop existing constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_status;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_service_type;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_payment_status;

-- Recreate constraints with uppercase values to match Java enums
ALTER TABLE orders ADD CONSTRAINT chk_orders_status 
    CHECK (status IN ('PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'));

ALTER TABLE orders ADD CONSTRAINT chk_orders_service_type 
    CHECK (service_type IN ('EXPRESS', 'STANDARD', 'ECONOMY'));

ALTER TABLE orders ADD CONSTRAINT chk_orders_payment_status 
    CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'));
