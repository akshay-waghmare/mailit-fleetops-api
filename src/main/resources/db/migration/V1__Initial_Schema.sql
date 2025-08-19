-- FleetOps Initial Schema Migration
-- Version: 1.0
-- Description: Create initial tables for FleetOps logistics platform

-- Organizations table (accounts module)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Places table (geo module)
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOMETRY(POINT, 4326) NOT NULL,
    address TEXT,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    phone_number VARCHAR(50),
    contact_person VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for places
CREATE INDEX idx_places_location ON places USING GIST (location);
CREATE INDEX idx_places_organization ON places(organization_id);
CREATE INDEX idx_places_type ON places(type);

-- Geofences table (geo module)
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    geometry GEOMETRY(POLYGON, 4326) NOT NULL,
    geofence_type VARCHAR(50) NOT NULL, -- SERVICE_AREA, RESTRICTED_ZONE, DEPOT_ZONE
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Create spatial index for geofences
CREATE INDEX idx_geofences_geometry ON geofences USING GIST (geometry);
CREATE INDEX idx_geofences_organization ON geofences(organization_id);

-- Insert sample data
INSERT INTO organizations (name, slug, description, contact_email) VALUES 
(
    'FleetOps Demo Company', 
    'fleetops-demo', 
    'Demo logistics company for testing FleetOps platform',
    'demo@fleetops.com'
);

-- Get the organization ID for sample data
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'fleetops-demo' LIMIT 1
)
INSERT INTO places (organization_id, name, address, location, type, contact_person, phone_number)
SELECT 
    demo_org.id,
    'Main Depot',
    '123 Logistics Way, San Francisco, CA 94105',
    ST_SetSRID(ST_MakePoint(-122.3951, 37.7912), 4326),
    'DEPOT',
    'John Doe',
    '+1-555-0123'
FROM demo_org;

-- Create a sample service area geofence
WITH demo_org AS (
    SELECT id FROM organizations WHERE slug = 'fleetops-demo' LIMIT 1
)
INSERT INTO geofences (organization_id, name, description, geometry, geofence_type)
SELECT 
    demo_org.id,
    'San Francisco Service Area',
    'Primary service area covering San Francisco',
    ST_SetSRID(ST_GeomFromText('POLYGON((-122.5150 37.7088, -122.3549 37.7088, -122.3549 37.8324, -122.5150 37.8324, -122.5150 37.7088))'), 4326),
    'SERVICE_AREA'
FROM demo_org;

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Organizations/companies using the FleetOps platform';
COMMENT ON TABLE places IS 'Physical locations for pickups, deliveries, depots, etc.';
COMMENT ON TABLE geofences IS 'Geographical boundaries for service areas, restricted zones, etc.';

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
