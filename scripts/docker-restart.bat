@echo off
echo 🧹 FleetOps Container Cleanup Starting...

echo.
echo 🛑 Stopping FleetOps containers...
docker stop fleetops-postgres fleetops-backend fleetops-frontend fleetops-pgadmin 2>nul

echo.
echo 🗑️ Removing FleetOps containers...
docker rm fleetops-postgres fleetops-backend fleetops-frontend fleetops-pgadmin 2>nul

echo.
echo 🔄 Cleaning up Docker system...
docker system prune -f

echo.
echo 🎉 FleetOps container cleanup completed!
echo ✅ Ready to start fresh containers

echo.
echo 🚀 Starting Docker Compose...
docker-compose up --build -d

echo.
echo 📊 Container Status:
docker-compose ps

echo.
echo 🌐 Service URLs:
echo    Frontend:  http://localhost:4200
echo    Backend:   http://localhost:8081
echo    Health:    http://localhost:8081/actuator/health
echo    Database:  localhost:5432