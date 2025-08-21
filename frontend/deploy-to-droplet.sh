#!/bin/bash

# 🚀 FleetOps Frontend - Remote Droplet Deployment Script
# Deploy to your DigitalOcean droplet via SSH

set -e

# Configuration - Update these with your droplet details
DROPLET_IP="YOUR_DROPLET_IP"
DROPLET_USER="root"
SSH_KEY_PATH="~/.ssh/id_rsa"
IMAGE_NAME="fleetops-frontend"
TAG="latest"
CONTAINER_NAME="fleetops-frontend"

echo "🚀 Deploying FleetOps Frontend to droplet: $DROPLET_IP"

# Build image locally
echo "📦 Building Docker image locally..."
docker build -t ${IMAGE_NAME}:${TAG} .

# Save image to tar file
echo "💾 Saving image to tar file..."
docker save ${IMAGE_NAME}:${TAG} > fleetops-frontend.tar

# Copy image to droplet
echo "📤 Copying image to droplet..."
scp -i ${SSH_KEY_PATH} fleetops-frontend.tar ${DROPLET_USER}@${DROPLET_IP}:/tmp/

# Deploy on droplet
echo "🚀 Deploying on droplet..."
ssh -i ${SSH_KEY_PATH} ${DROPLET_USER}@${DROPLET_IP} << 'EOF'
    # Load the image
    echo "📥 Loading Docker image..."
    docker load < /tmp/fleetops-frontend.tar
    
    # Stop existing container
    echo "🛑 Stopping existing container..."
    docker stop fleetops-frontend 2>/dev/null || true
    docker rm fleetops-frontend 2>/dev/null || true
    
    # Run new container
    echo "🚀 Starting new container..."
    docker run -d \
        --name fleetops-frontend \
        --restart unless-stopped \
        -p 80:80 \
        fleetops-frontend:latest
    
    # Clean up
    rm /tmp/fleetops-frontend.tar
    
    # Show status
    echo "✅ Container status:"
    docker ps --filter "name=fleetops-frontend"
EOF

# Clean up local tar file
rm fleetops-frontend.tar

echo "🎉 Deployment complete!"
echo "🌐 Frontend available at: http://$DROPLET_IP"
echo ""
echo "📝 To update your configuration:"
echo "   1. Edit this script and update DROPLET_IP, DROPLET_USER, SSH_KEY_PATH"
echo "   2. Make sure Docker is installed on your droplet"
echo "   3. Ensure SSH key access is configured"