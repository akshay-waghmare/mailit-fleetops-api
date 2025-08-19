# FleetOps Database Setup Guide

## Quick Start with Docker

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your system.

### 2. Start PostgreSQL with PostGIS
```bash
# Start only the database
docker-compose up -d postgres

# Check if it's running
docker-compose ps

# View logs
docker-compose logs postgres
```

### 3. Start the Application
```bash
# Use the convenience script
./start-dev.sh

# Or manually
source ~/.sdkman/bin/sdkman-init.sh
./gradlew bootRun
```

## Database Details

- **Host**: localhost
- **Port**: 5432
- **Database**: fleetops_dev
- **Username**: fleetops
- **Password**: fleetops
- **JDBC URL**: `jdbc:postgresql://localhost:5432/fleetops_dev`

## PostGIS Extensions

The database automatically includes:
- PostGIS for spatial data types and functions
- PostGIS Topology for advanced spatial operations

## Connecting to Database

### Using psql (in Docker container)
```bash
docker-compose exec postgres psql -U fleetops -d fleetops_dev
```

### Using pgAdmin or other GUI tools
- Host: localhost
- Port: 5432
- Database: fleetops_dev
- Username: fleetops
- Password: fleetops

## Sample Spatial Queries

Once the application starts, you can test spatial functionality:

```sql
-- Check PostGIS version
SELECT PostGIS_Version();

-- View sample organizations with locations
SELECT name, ST_AsText(location) as coordinates 
FROM organizations;

-- View places near a point (within 10km)
SELECT name, address, ST_Distance(location, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)) as distance_meters
FROM places 
WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326), 10000)
ORDER BY distance_meters;

-- Check if a point is within any service area
SELECT g.name as geofence_name
FROM geofences g
WHERE ST_Contains(g.geometry, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326))
AND g.geofence_type = 'SERVICE_AREA';
```

## Flyway Migrations

Migrations are automatically applied on application startup. To manually run:

```bash
./gradlew flywayMigrate
./gradlew flywayInfo
```

## Troubleshooting

### Docker Issues
```bash
# Restart containers
docker-compose down
docker-compose up -d postgres

# Remove and recreate (WARNING: destroys data)
docker-compose down -v
docker-compose up -d postgres
```

### Connection Issues
1. Ensure Docker Desktop is running
2. Check if port 5432 is available
3. Verify container is healthy: `docker-compose ps`

### Application Issues
1. Check logs: `./gradlew bootRun`
2. Verify database connection in logs
3. Check Flyway migration status
