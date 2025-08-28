#!/bin/bash

# 🚀 FleetOps Frontend - Simple Deployment Script
# Deploy to your DigitalOcean droplet via SSH (password auth)

set -e

# Configuration
DROPLET_IP="139.59.46.120"
DROPLET_USER="root"
IMAGE_NAME="macubex/fleetops-frontend"
TAG="latest"
CONTAINER_NAME="fleetops-frontend"

echo "🚀 Deploying FleetOps Frontend to droplet: $DROPLET_IP"

# Build image locally
echo "📦 Building Docker image locally..."
docker build -t ${IMAGE_NAME}:${TAG} .

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}

# Deploy on droplet
echo "🚀 Deploying on droplet..."
ssh ${DROPLET_USER}@${DROPLET_IP} << EOF
    # Pull latest image
    echo "📥 Pulling latest image..."
    docker pull ${IMAGE_NAME}:${TAG}
    
    # Stop existing container
    echo "🛑 Stopping existing container..."
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    
    # Run new container
    echo "🚀 Starting new container..."
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 5001:80 \
        ${IMAGE_NAME}:${TAG}
    
    # Show status
    echo "✅ Container status:"
    docker ps --filter "name=${CONTAINER_NAME}"
    
    echo "🌐 Frontend should be available at: http://${DROPLET_IP}:5001"
EOF

echo "🎉 Deployment complete!"
echo "🌐 Frontend available at: http://$DROPLET_IP:5001"