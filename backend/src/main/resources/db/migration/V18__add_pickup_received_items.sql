-- V18: Add items_received and completion_notes to pickups table for tracking actual received items
-- This allows agents to record how many items were actually picked up vs expected

ALTER TABLE pickups ADD COLUMN IF NOT EXISTS items_received INTEGER DEFAULT NULL;
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS completion_notes TEXT DEFAULT NULL;
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS completed_by VARCHAR(255) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN pickups.items_received IS 'Actual number of items received during pickup (may differ from items_count)';
COMMENT ON COLUMN pickups.completion_notes IS 'Notes added when completing the pickup';
COMMENT ON COLUMN pickups.completed_at IS 'Timestamp when pickup was marked as completed';
COMMENT ON COLUMN pickups.completed_by IS 'User/agent who completed the pickup';
