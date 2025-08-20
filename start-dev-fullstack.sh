#!/bin/bash

# Start FleetOps Development Environment
echo "🚀 Starting FleetOps Development Environment..."

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend/apps/console-app" ]; then
    echo "❌ Frontend directory not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Starting PostgreSQL database..."
cd backend
docker-compose up -d
cd ..

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔧 Starting Spring Boot backend..."
cd backend
./gradlew bootRun --args='--server.port=8081' &
BACKEND_PID=$!
cd ..

echo "⚡ Starting Angular frontend..."
cd frontend/apps/console-app
ng serve --port 4200 &
FRONTEND_PID=$!
cd ../../..

echo ""
echo "✅ FleetOps Development Environment Started!"
echo "🗄️  Database: PostgreSQL running in Docker"
echo "🔧 Backend: http://localhost:8081"
echo "⚡ Frontend: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for either process to end
wait $BACKEND_PID $FRONTEND_PID

echo "🛑 Stopping services..."
# Kill remaining processes
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

echo "✅ All services stopped."