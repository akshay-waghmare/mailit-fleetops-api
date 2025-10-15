# Testing Guide

## Quick Start

Just run build or test - both will automatically ensure PostGIS is enabled:

```bash
./gradlew build
# or
./gradlew test
```

## Common Issues & Solutions

### Issue: Tests fail with "relation does not exist" or "type geometry does not exist"

**Quick Fix:**
```bash
./gradlew resetTestDb test
```

This will:
1. Drop and recreate the test database
2. Enable PostGIS extension
3. Run all tests (Flyway will automatically apply migrations)

### Issue: After merging branches, tests fail or Flyway validation errors

This usually happens when:
1. Test database has an old schema → Reset it
2. Dev database has V4 migration conflict → Fix the conflict

```bash
# For test database issues
./gradlew resetTestDb test

# For dev database migration conflicts (V4/V15)
./gradlew fixMigrationConflict

# Check for conflicts
./gradlew checkDevDb
```

## Useful Gradle Tasks

### `./gradlew build` or `./gradlew test`
- Runs compilation and tests
- Automatically ensures PostGIS is enabled before tests run
- Use either command - both handle database setup

### `./gradlew resetTestDb`
- Drops and recreates the test database
- Enables PostGIS and PostGIS Topology extensions
- Use this when tests fail due to schema issues

### `./gradlew fixMigrationConflict`
- Fixes V4/V15 migration conflicts in dev database
- Updates Flyway history to resolve duplicate migrations
- Run this if you get Flyway validation errors after merging

### `./gradlew checkTestDb`
- Shows current test database status
- Lists extensions, tables, and migration history
- Useful for debugging

### `./gradlew checkDevDb`
- Checks dev database for migration conflicts
- Warns about V4/V15 conflicts that need fixing
- Shows current migration history

### `./gradlew clean test`
- Full clean build and test
- Use this after resolving merge conflicts

## For New Developers

1. **Start PostgreSQL:**
   ```bash
   cd backend
   docker compose up -d postgres
   ```

2. **Build the project:**
   ```bash
   ./gradlew build
   ```
   
   That's it! The build automatically handles database setup and runs tests.

3. **If tests fail:**
   ```bash
   ./gradlew resetTestDb test
   ```

## CI/CD Setup

In CI/CD pipelines, ensure:

1. Use `postgis/postgis:15-3.3` image for PostgreSQL
2. The init script at `docker/init/01-init-db.sql` runs automatically
3. Run `./gradlew test` - everything else is automatic

## How It Works

1. **Automatic Setup**: The `test` task automatically enables PostGIS before running tests
2. **Flyway Integration**: When tests run, Flyway automatically applies all migrations to `fleetops_test` database
3. **Manual Reset**: Use `resetTestDb` task when you need a fresh database (after merges, conflicts, etc.)

## Troubleshooting

### PostgreSQL not running
```bash
docker compose up -d postgres
```

### Check if database exists
```bash
./gradlew checkTestDb
```

### Full reset
```bash
# Stop everything
docker compose down -v

# Start fresh
docker compose up -d postgres

# Wait a few seconds, then test
./gradlew test
```

## Test Configuration

Tests use configuration from `src/test/resources/application-test.properties`:
- Database: `fleetops_test`
- Flyway: Enabled (applies migrations automatically)
- SQL Debugging: Enabled for troubleshooting

## After Merge Conflicts

If you just merged `main` or another branch and encounter issues:

```bash
# 1. Check for migration conflicts in dev database
./gradlew checkDevDb

# 2. If V4/V15 conflict detected, fix it:
./gradlew fixMigrationConflict

# 3. Reset test database to ensure clean schema
./gradlew resetTestDb

# 4. Run tests
./gradlew test
```

### Common Flyway Errors After Merge:
- **"Migration checksum mismatch"** → Run `./gradlew fixMigrationConflict`
- **"Found non-empty schema without metadata table"** → Run `./gradlew resetTestDb`
- **"Validate failed: Migration V4 was already applied"** → Run `./gradlew fixMigrationConflict`

The migration conflict happens because V4 was renamed to V15 in main branch, but some developers might have the old V4 in their dev database.
