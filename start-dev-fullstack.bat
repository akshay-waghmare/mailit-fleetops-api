@echo off
REM Start FleetOps Development Environment (Windows)

echo.
echo 🚀 Starting FleetOps Development Environment...

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend\apps\console-app" (
    echo ❌ Frontend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📦 Starting PostgreSQL database...
cd backend
docker-compose up -d
cd ..

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 5 >nul

echo 🔧 Starting Spring Boot backend...
start "FleetOps Backend" cmd /k "cd backend && gradlew.bat bootRun --args=--server.port=8081"

REM Wait a moment for backend to start
timeout /t 3 >nul

echo ⚡ Starting Angular frontend...
start "FleetOps Frontend" cmd /k "cd frontend\apps\console-app && ng serve --port 4200"

echo.
echo ✅ FleetOps Development Environment Started!
echo 🗄️  Database: PostgreSQL running in Docker
echo 🔧 Backend: http://localhost:8081
echo ⚡ Frontend: http://localhost:4200
echo.
echo Press any key to continue...
pause >nul