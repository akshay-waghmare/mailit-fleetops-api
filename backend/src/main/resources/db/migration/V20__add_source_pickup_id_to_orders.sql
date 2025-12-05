-- Add source_pickup_id to orders table to track orders created from pickups
-- This enables showing "View Bookings" instead of "Create Bookings" for pickups with orders

ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_pickup_id VARCHAR(50);

-- Add index for faster lookup of orders by pickup
CREATE INDEX IF NOT EXISTS idx_orders_source_pickup_id ON orders(source_pickup_id);

-- Add comment for documentation
COMMENT ON COLUMN orders.source_pickup_id IS 'The pickup_id (e.g. PU12345678) from which this order was created';
