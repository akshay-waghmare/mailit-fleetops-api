#!/bin/bash
# FleetOps Development Startup Script

echo "� Starting FleetOps Development Environment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "   Then run this script again."
    exit 1
fi

echo "� Starting PostgreSQL with PostGIS..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U fleetops -d fleetops_dev; do sleep 2; done'

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is ready!"
    echo "� Database URL: jdbc:postgresql://localhost:5432/fleetops_dev"
    echo "� Username: fleetops"
    echo "� Password: fleetops"
    echo ""
    echo "� Cleaning previous build..."
    ./gradlew clean
    echo ""
    echo "� Starting Spring Boot application..."
    source ~/.sdkman/bin/sdkman-init.sh 2>/dev/null || true
    ./gradlew bootRun
else
    echo "❌ PostgreSQL failed to start within 60 seconds"
    echo "� Checking logs..."
    docker-compose logs postgres
    exit 1
fi
