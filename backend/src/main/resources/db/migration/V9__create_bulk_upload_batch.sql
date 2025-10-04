-- Create bulk_upload_batch table for Bulk Order Upload feature
-- This migration adds batch-level tracking for Excel-based bulk order uploads
-- Retention: 180 days (configurable via application properties)

CREATE TABLE bulk_upload_batch (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Batch Identification
    batch_id VARCHAR(50) NOT NULL UNIQUE, -- BU20251004001 format
    
    -- Uploader Information (auth deferred to Phase 2)
    uploader_user_id BIGINT NOT NULL, -- Hardcoded to 1 in Phase 1
    uploader_name VARCHAR(255),
    
    -- File Information
    file_name VARCHAR(512) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_checksum VARCHAR(64) NOT NULL, -- SHA-256 hash of file content
    
    -- Processing Status
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING', -- PROCESSING, COMPLETED, FAILED
    
    -- Processing Results
    total_rows INT NOT NULL DEFAULT 0,
    created_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    skipped_duplicate_count INT NOT NULL DEFAULT 0,
    
    -- Timing
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_duration_ms BIGINT,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata (JSONB for flexible error messages, warnings, etc.)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT chk_bulk_upload_batch_status 
        CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    
    -- Count invariant: total_rows = created + failed + skipped
    -- NOTE: Update counts atomically at end of processing to avoid transient violations
    CONSTRAINT chk_bulk_upload_batch_counts 
        CHECK (total_rows = created_count + failed_count + skipped_duplicate_count),
    
    CONSTRAINT chk_bulk_upload_batch_id_pattern
        CHECK (batch_id ~ '^BU\d{12}$') -- BU + YYYYMMDD + 4-digit sequence
);

-- Indexes for Performance
CREATE INDEX idx_bulk_upload_batch_batch_id ON bulk_upload_batch(batch_id);
CREATE INDEX idx_bulk_upload_batch_uploader_user_id ON bulk_upload_batch(uploader_user_id);
CREATE INDEX idx_bulk_upload_batch_uploaded_at ON bulk_upload_batch(uploaded_at);
CREATE INDEX idx_bulk_upload_batch_created_at ON bulk_upload_batch(created_at); -- For retention cleanup
CREATE INDEX idx_bulk_upload_batch_status ON bulk_upload_batch(status);
CREATE INDEX idx_bulk_upload_batch_file_checksum ON bulk_upload_batch(file_checksum); -- For duplicate file detection

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bulk_upload_batch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bulk_upload_batch_updated_at
    BEFORE UPDATE ON bulk_upload_batch
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_upload_batch_updated_at();

-- Table comment for documentation
COMMENT ON TABLE bulk_upload_batch IS 'Batch metadata for bulk order uploads via Excel files; retained 180 days (configurable)';
COMMENT ON COLUMN bulk_upload_batch.batch_id IS 'Unique batch identifier: BU + YYYYMMDD + 4-digit sequence';
COMMENT ON COLUMN bulk_upload_batch.file_checksum IS 'SHA-256 hash of file content for duplicate detection';
COMMENT ON COLUMN bulk_upload_batch.uploader_user_id IS 'User who uploaded the batch (hardcoded to 1 in Phase 1; auth in Phase 2)';
COMMENT ON COLUMN bulk_upload_batch.status IS 'Processing status: PROCESSING (in progress), COMPLETED (success), FAILED (error)';
COMMENT ON COLUMN bulk_upload_batch.metadata IS 'JSONB for flexible fields: error messages, warnings, feature flags, etc.';
