-- Create bulk_upload_row table for per-row outcomes in bulk uploads
-- This migration tracks individual row processing results with validation errors
-- Retention: 30 days (configurable via application properties)

CREATE TABLE bulk_upload_row (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Batch Reference
    batch_id BIGINT NOT NULL,
    row_index INT NOT NULL, -- 1-based row number from Excel (excluding header)
    
    -- Idempotency
    idempotency_key VARCHAR(300) NOT NULL, -- clientReference or SHA-256 hash
    idempotency_basis VARCHAR(32) NOT NULL, -- CLIENT_REFERENCE, HASH
    
    -- Processing Outcome
    status VARCHAR(32) NOT NULL, -- CREATED, FAILED_VALIDATION, SKIPPED_DUPLICATE
    
    -- Order Reference (nullable - only set if order created successfully)
    order_id BIGINT,
    
    -- Validation Errors (JSONB array)
    error_messages JSONB, -- [{"code": "MISSING_RECEIVER_PINCODE", "field": "receiverPincode", "message": "..."}]
    
    -- Raw Data (JSONB for debugging/audit)
    raw_data JSONB, -- Original Excel row data as JSON object
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_bulk_upload_row_batch_id 
        FOREIGN KEY (batch_id) 
        REFERENCES bulk_upload_batch(id) 
        ON DELETE CASCADE, -- Delete rows when batch is deleted
    
    CONSTRAINT fk_bulk_upload_row_order_id 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE SET NULL, -- Preserve row record even if order deleted
    
    -- Constraints
    CONSTRAINT chk_bulk_upload_row_status 
        CHECK (status IN ('CREATED', 'FAILED_VALIDATION', 'SKIPPED_DUPLICATE')),
    
    CONSTRAINT chk_bulk_upload_row_idempotency_basis 
        CHECK (idempotency_basis IN ('CLIENT_REFERENCE', 'HASH')),
    
    CONSTRAINT chk_bulk_upload_row_index_positive
        CHECK (row_index > 0),
    
    -- Unique constraint: one row per idempotency key (across all batches)
    CONSTRAINT uq_bulk_upload_row_idempotency_key 
        UNIQUE (idempotency_key)
);

-- Indexes for Performance
CREATE INDEX idx_bulk_upload_row_batch_id ON bulk_upload_row(batch_id);
CREATE INDEX idx_bulk_upload_row_idempotency_key ON bulk_upload_row(idempotency_key);
CREATE INDEX idx_bulk_upload_row_order_id ON bulk_upload_row(order_id);
CREATE INDEX idx_bulk_upload_row_created_at ON bulk_upload_row(created_at); -- For retention cleanup
CREATE INDEX idx_bulk_upload_row_status ON bulk_upload_row(status);

-- Composite index for batch detail queries
CREATE INDEX idx_bulk_upload_row_batch_row_index ON bulk_upload_row(batch_id, row_index);

-- Partial index for failed rows (troubleshooting)
CREATE INDEX idx_bulk_upload_row_failed ON bulk_upload_row(batch_id, status) 
    WHERE status IN ('FAILED_VALIDATION', 'SKIPPED_DUPLICATE');

-- GIN index for JSONB error_messages (querying specific error codes)
CREATE INDEX idx_bulk_upload_row_error_messages ON bulk_upload_row USING GIN (error_messages);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bulk_upload_row_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bulk_upload_row_updated_at
    BEFORE UPDATE ON bulk_upload_row
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_upload_row_updated_at();

-- Table comment for documentation
COMMENT ON TABLE bulk_upload_row IS 'Per-row outcomes for bulk order uploads; retained 30 days (configurable)';
COMMENT ON COLUMN bulk_upload_row.batch_id IS 'Foreign key to bulk_upload_batch; CASCADE delete when batch deleted';
COMMENT ON COLUMN bulk_upload_row.row_index IS '1-based row number from Excel file (excluding header row)';
COMMENT ON COLUMN bulk_upload_row.idempotency_key IS 'clientReference (preferred) or SHA-256 hash of canonical fields; max 300 chars';
COMMENT ON COLUMN bulk_upload_row.idempotency_basis IS 'How idempotency key was derived: CLIENT_REFERENCE or HASH';
COMMENT ON COLUMN bulk_upload_row.status IS 'Processing outcome: CREATED (success), FAILED_VALIDATION (error), SKIPPED_DUPLICATE (already exists)';
COMMENT ON COLUMN bulk_upload_row.order_id IS 'Foreign key to orders table; NULL if row failed validation or was skipped';
COMMENT ON COLUMN bulk_upload_row.error_messages IS 'JSONB array of validation errors with code, field, and message';
COMMENT ON COLUMN bulk_upload_row.raw_data IS 'JSONB copy of original Excel row data for debugging and audit trail';
