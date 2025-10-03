-- Update batch_id constraint to support seconds + random suffix (16 digits instead of 12)
-- This allows multiple uploads per second without conflicts
-- Pattern: BU + YYYYMMDDHHmmss + RR (e.g., BU2025100414302547)

-- First, drop the old constraint
ALTER TABLE bulk_upload_batch
DROP CONSTRAINT IF EXISTS chk_bulk_upload_batch_id_pattern;

-- Update existing batch_ids from 12 digits to 16 digits by appending '0000'
-- BU + 12 digits (old) = 14 chars → BU + 16 digits (new) = 18 chars
UPDATE bulk_upload_batch
SET batch_id = batch_id || '0000'
WHERE LENGTH(batch_id) = 14; -- Only update old 12-digit format

-- Update existing 14-digit format to 16 digits by appending '00'
UPDATE bulk_upload_batch
SET batch_id = batch_id || '00'
WHERE LENGTH(batch_id) = 16; -- Update 14-digit format

-- Now add the new constraint for 16 digits
ALTER TABLE bulk_upload_batch
ADD CONSTRAINT chk_bulk_upload_batch_id_pattern
    CHECK (batch_id ~ '^BU\d{16}$'); -- BU + 16 digits (YYYYMMDDHHmmss + RR)

COMMENT ON CONSTRAINT chk_bulk_upload_batch_id_pattern ON bulk_upload_batch IS 
'Batch ID format: BU + YYYYMMDDHHmmss + RR (16 digits total: timestamp + 2-digit random suffix)';
