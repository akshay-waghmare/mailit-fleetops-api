-- FleetOps Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create additional databases for different environments
CREATE DATABASE fleetops_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fleetops_dev TO fleetops;
GRANT ALL PRIVILEGES ON DATABASE fleetops_test TO fleetops;

-- Connect to test database and enable PostGIS
\c fleetops_test;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fleetops;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fleetops;

-- Connect back to main database
\c fleetops_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fleetops;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fleetops;

-- Create schema for different modules
CREATE SCHEMA IF NOT EXISTS accounts;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS dispatch;
CREATE SCHEMA IF NOT EXISTS geo;
CREATE SCHEMA IF NOT EXISTS routing;
CREATE SCHEMA IF NOT EXISTS tracking;

-- Grant permissions on schemas
GRANT ALL ON SCHEMA accounts TO fleetops;
GRANT ALL ON SCHEMA catalog TO fleetops;
GRANT ALL ON SCHEMA orders TO fleetops;
GRANT ALL ON SCHEMA dispatch TO fleetops;
GRANT ALL ON SCHEMA geo TO fleetops;
GRANT ALL ON SCHEMA routing TO fleetops;
GRANT ALL ON SCHEMA tracking TO fleetops;

-- Set default schema search path
ALTER USER fleetops SET search_path = public, accounts, catalog, orders, dispatch, geo, routing, tracking;
