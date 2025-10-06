-- Create orders table for Order Management system
-- This migration adds comprehensive order tracking with delivery management

CREATE TABLE orders (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE, -- ORD000001
    
    -- Client Information
    client_id BIGINT,
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    contact_number VARCHAR(20),
    
    -- Sender Information
    sender_name VARCHAR(255) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_contact VARCHAR(20) NOT NULL,
    sender_email VARCHAR(255),
    sender_pincode VARCHAR(10),
    sender_city VARCHAR(100),
    sender_state VARCHAR(100),
    
    -- Receiver Information
    receiver_name VARCHAR(255) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_contact VARCHAR(20) NOT NULL,
    receiver_email VARCHAR(255),
    receiver_pincode VARCHAR(10) NOT NULL,
    receiver_city VARCHAR(100) NOT NULL,
    receiver_state VARCHAR(100),
    
    -- Package Details
    item_count INT DEFAULT 1,
    total_weight DECIMAL(10,2) DEFAULT 0,
    length_cm DECIMAL(8,2),
    width_cm DECIMAL(8,2),
    height_cm DECIMAL(8,2),
    item_description TEXT,
    declared_value DECIMAL(12,2),
    
    -- Service Details
    service_type VARCHAR(32) NOT NULL, -- express, standard, economy
    carrier_name VARCHAR(100) NOT NULL,
    carrier_id VARCHAR(64),
    tracking_number VARCHAR(100),
    
    -- Status Management
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status_updated_by VARCHAR(255),
    
    -- Staff Assignment
    assigned_staff_id BIGINT,
    assigned_staff_name VARCHAR(255),
    staff_department VARCHAR(100),
    
    -- Delivery Information
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    delivery_time TIME,
    delivery_instructions TEXT,
    
    -- Financial Information
    cod_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    payment_status VARCHAR(32) DEFAULT 'pending', -- pending, paid, failed, refunded
    
    -- Additional Fields
    special_instructions TEXT,
    rating DECIMAL(2,1), -- 1.0 to 5.0
    customer_feedback TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Metadata (JSONB for flexible fields)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for Performance
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_delivery_date ON orders(estimated_delivery_date);
CREATE INDEX idx_orders_assigned_staff ON orders(assigned_staff_id);

-- Full-text search index
CREATE INDEX idx_orders_search ON orders USING GIN (
    to_tsvector('english', 
        coalesce(client_name,'') || ' ' || 
        coalesce(sender_name,'') || ' ' || 
        coalesce(receiver_name,'') || ' ' || 
        coalesce(item_description,'')
    )
);

-- Partial indexes for common queries
CREATE INDEX idx_orders_active ON orders(created_at) WHERE status IN ('pending', 'confirmed', 'picked-up', 'in-transit');
CREATE INDEX idx_orders_delivered ON orders(actual_delivery_date) WHERE status = 'delivered';

-- Add constraints
ALTER TABLE orders ADD CONSTRAINT chk_orders_status 
    CHECK (status IN ('pending', 'confirmed', 'picked-up', 'in-transit', 'delivered', 'cancelled', 'returned'));

ALTER TABLE orders ADD CONSTRAINT chk_orders_service_type 
    CHECK (service_type IN ('express', 'standard', 'economy'));

ALTER TABLE orders ADD CONSTRAINT chk_orders_payment_status 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();
