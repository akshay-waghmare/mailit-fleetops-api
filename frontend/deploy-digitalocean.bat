@echo off
REM 🚀 FleetOps Frontend - Server Droplet Deployment Script (Windows)
REM Deploy the frontend container to your DigitalOcean droplet server

echo 🚀 Starting FleetOps Frontend deployment to server droplet...

REM Configuration
set IMAGE_NAME=fleetops-frontend
set TAG=latest
set CONTAINER_NAME=fleetops-frontend
set PORT=80

REM Build the Docker image
echo 📦 Building Docker image...
docker build -t %IMAGE_NAME%:%TAG% .

REM Stop and remove existing container if running
echo 🛑 Stopping existing container (if any)...
docker stop %CONTAINER_NAME% 2>nul
docker rm %CONTAINER_NAME% 2>nul

REM Run the new container
echo 🚀 Starting new container...
docker run -d --name %CONTAINER_NAME% --restart unless-stopped -p %PORT%:80 %IMAGE_NAME%:%TAG%

REM Check container status
echo ✅ Container status:
docker ps --filter "name=%CONTAINER_NAME%"

echo 🎉 Deployment complete!
echo 🌐 Frontend available at: http://your-droplet-ip:%PORT%
echo 🔍 Check logs: docker logs %CONTAINER_NAME%
echo 📊 Monitor: docker stats %CONTAINER_NAME%
pause