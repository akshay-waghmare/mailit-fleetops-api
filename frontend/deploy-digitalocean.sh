#!/bin/bash

# 🚀 FleetOps Frontend - Server Droplet Deployment Script
# Deploy the frontend container to your DigitalOcean droplet server

set -e

echo "🚀 Starting FleetOps Frontend deployment to server droplet..."

# Configuration
IMAGE_NAME="fleetops-frontend"
TAG="latest"
CONTAINER_NAME="fleetops-frontend"
PORT="5001"
# Optional: set REMOTE_IMAGE to pull instead of building locally, e.g.
# REMOTE_IMAGE="macubex/fleetbase-app:latest"
REMOTE_IMAGE="${REMOTE_IMAGE:-}"

IMAGE_TO_RUN=""
if [ -n "$REMOTE_IMAGE" ]; then
  echo "⬇️  Pulling remote image: ${REMOTE_IMAGE}"
  docker pull "${REMOTE_IMAGE}"
  IMAGE_TO_RUN="${REMOTE_IMAGE}"
else
  # Build the Docker image
  echo "📦 Building Docker image..."
  docker build -t ${IMAGE_NAME}:${TAG} .
  IMAGE_TO_RUN="${IMAGE_NAME}:${TAG}"
fi

# Stop and remove existing container if running
echo "🛑 Stopping existing container (if any)..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Run the new container
echo "🚀 Starting new container with image: ${IMAGE_TO_RUN}..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --restart unless-stopped \
  -p ${PORT}:80 \
  ${IMAGE_TO_RUN}

# Check container status
echo "✅ Container status:"
docker ps --filter "name=${CONTAINER_NAME}"

echo "🎉 Deployment complete!"
echo "🌐 Frontend available at: http://your-droplet-ip:${PORT}"
echo "🔍 Check logs: docker logs ${CONTAINER_NAME}"
echo "📊 Monitor: docker stats ${CONTAINER_NAME}"