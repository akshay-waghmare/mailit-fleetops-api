-- Create order status history table for audit trail
-- This table tracks all status changes for orders with timestamps and reasons

CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(32),
    to_status VARCHAR(32) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(255),
    reason TEXT,
    notes TEXT,
    location_lat DECIMAL(10,8), -- Optional GPS tracking
    location_lng DECIMAL(11,8),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for order status history
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);
CREATE INDEX idx_order_status_history_to_status ON order_status_history(to_status);

-- Add constraints
ALTER TABLE order_status_history ADD CONSTRAINT chk_order_status_history_to_status 
    CHECK (to_status IN ('pending', 'confirmed', 'picked-up', 'in-transit', 'delivered', 'cancelled', 'returned'));

ALTER TABLE order_status_history ADD CONSTRAINT chk_order_status_history_from_status 
    CHECK (from_status IS NULL OR from_status IN ('pending', 'confirmed', 'picked-up', 'in-transit', 'delivered', 'cancelled', 'returned'));
