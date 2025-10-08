-- Fix Place Schema Issues
-- Version: 2.0
-- Description: Fix places table schema and constraints to match entity definition

-- Add missing active column if it doesn't exist
ALTER TABLE places ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Drop existing constraints that might be causing issues
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_type_check;
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_check;

-- Add proper type constraint that includes all valid PlaceType enum values
ALTER TABLE places ADD CONSTRAINT places_type_check
    CHECK (type IN (
        'DEPOT',
        'WAREHOUSE',
        'CUSTOMER',
        'PICKUP_POINT',
        'DELIVERY_POINT',
        'SERVICE_CENTER',
        'RETAIL_STORE',
        'DISTRIBUTION_CENTER',
        'OFFICE',
        'OTHER'
    ));

-- Add index on active column for better query performance
CREATE INDEX IF NOT EXISTS idx_places_active ON places(active);

-- Update any existing records to have active = true if null
UPDATE places SET active = true WHERE active IS NULL;