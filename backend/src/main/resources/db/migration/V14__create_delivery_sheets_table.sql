-- V14: Create delivery sheets tables for agent-scoped access
-- Epic E10: Minimal RBAC (User Management)
-- Tasks: T033, T034

CREATE TABLE delivery_sheets (
    id BIGSERIAL PRIMARY KEY,
    sheet_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    assigned_agent_id BIGINT NOT NULL REFERENCES users(id),
    assigned_agent_name VARCHAR(255),
    total_orders INT NOT NULL DEFAULT 0,
    total_cod_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    scheduled_date DATE,
    delivery_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE delivery_sheets
    ADD CONSTRAINT chk_delivery_sheets_status
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'));

CREATE INDEX idx_delivery_sheets_agent ON delivery_sheets(assigned_agent_id);
CREATE INDEX idx_delivery_sheets_status ON delivery_sheets(status);
CREATE INDEX idx_delivery_sheets_created_at ON delivery_sheets(created_at DESC);

-- Track orders assigned to each delivery sheet
CREATE TABLE delivery_sheet_orders (
    id BIGSERIAL PRIMARY KEY,
    delivery_sheet_id BIGINT NOT NULL REFERENCES delivery_sheets(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX idx_delivery_sheet_orders_unique
    ON delivery_sheet_orders(delivery_sheet_id, order_id);

CREATE INDEX idx_delivery_sheet_orders_order
    ON delivery_sheet_orders(order_id);

-- Keep updated_at current on modifications
CREATE TRIGGER trg_delivery_sheets_updated_at
    BEFORE UPDATE ON delivery_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
