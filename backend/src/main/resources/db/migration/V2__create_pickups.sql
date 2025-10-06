-- Flyway migration: create pickups table
CREATE TABLE pickups (
  id BIGSERIAL PRIMARY KEY,
  pickup_id VARCHAR(50) NOT NULL UNIQUE,
  client_id BIGINT,
  client_name VARCHAR(255),
  pickup_address TEXT,
  pickup_type VARCHAR(32),
  pickup_date DATE,
  pickup_time TIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
  assigned_staff_id BIGINT NULL,
  items_count INT DEFAULT 1,
  total_weight NUMERIC(10,2) DEFAULT 0,
  carrier_id VARCHAR(64),
  estimated_cost NUMERIC(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pickups_date ON pickups(pickup_date);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);

-- Trigger function to update `updated_at` on update
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON pickups;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON pickups
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
