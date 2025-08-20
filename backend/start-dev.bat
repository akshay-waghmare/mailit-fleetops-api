@echo off
REM FleetOps Development Setup Script for Windows
REM This script helps Windows developers get started quickly

echo.
echo ========================================
echo  FleetOps Backend Development Setup
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running or not installed.
    echo Please start Docker Desktop first.
    echo.
    echo Download Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed or not in PATH.
    echo Please install Java 21 first.
    echo.
    echo Option 1 - SDKMAN (Recommended):
    echo   Visit: https://sdkman.io/install
    echo.
    echo Option 2 - Direct Download:
    echo   Visit: https://aws.amazon.com/corretto/
    echo.
    pause
    exit /b 1
)

echo ✅ Java is installed
java -version

REM Check if gradlew exists
if not exist "gradlew.bat" (
    echo ❌ gradlew.bat not found. Are you in the project root directory?
    pause
    exit /b 1
)

echo.
echo 🐳 Starting PostgreSQL with PostGIS...
docker-compose up -d postgres

echo.
echo ⏳ Waiting for PostgreSQL to be ready...
:wait_loop
timeout /t 2 >nul
docker-compose exec postgres pg_isready -U fleetops -d fleetops_dev >nul 2>&1
if %errorlevel% neq 0 goto wait_loop

echo ✅ PostgreSQL is ready!
echo.
echo 📊 Database Information:
echo   URL: jdbc:postgresql://localhost:5432/fleetops_dev
echo   Username: fleetops
echo   Password: fleetops
echo.

echo 🧹 Cleaning previous build...
gradlew.bat clean

echo.
echo 🚀 Starting Spring Boot application...
echo   The application will be available at: http://localhost:8081
echo   Health check: http://localhost:8081/actuator/health
echo   API docs: http://localhost:8081/actuator
echo.
echo Press Ctrl+C to stop the application
echo.

gradlew.bat bootRun --args="--server.port=8081"