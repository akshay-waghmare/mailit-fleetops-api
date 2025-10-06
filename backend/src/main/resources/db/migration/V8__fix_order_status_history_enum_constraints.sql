-- Fix enum constraints for order_status_history table to match Java enum case (uppercase)

-- Drop existing constraints that expect lowercase values
ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS chk_order_status_history_from_status;
ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS chk_order_status_history_to_status;

-- Add new constraints that accept uppercase enum values (matching Java enums)
ALTER TABLE order_status_history ADD CONSTRAINT chk_order_status_history_from_status 
    CHECK (from_status IS NULL OR from_status IN ('PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'));

ALTER TABLE order_status_history ADD CONSTRAINT chk_order_status_history_to_status 
    CHECK (to_status IN ('PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED'));
