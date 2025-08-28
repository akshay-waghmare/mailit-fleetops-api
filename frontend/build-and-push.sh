#!/bin/bash

# 🚀 FleetOps Frontend - Build and Push to Docker Hub
# Build locally and push updated image to Docker Hub

set -e

# Configuration
IMAGE_NAME="macubex/fleetops-frontend"
TAG="latest"

echo "🚀 Building and pushing FleetOps Frontend image: $IMAGE_NAME:$TAG"

# Build the image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

# Tag with timestamp for backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "🏷️  Creating backup tag: ${IMAGE_NAME}:${TIMESTAMP}"
docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:${TIMESTAMP}

# Push latest version
echo "📤 Pushing latest image to Docker Hub..."
docker push ${IMAGE_NAME}:${TAG}

# Push timestamp version
echo "📤 Pushing backup version to Docker Hub..."
docker push ${IMAGE_NAME}:${TIMESTAMP}

echo "✅ Build and push complete!"
echo "🌐 Image available at: ${IMAGE_NAME}:${TAG}"
echo "🔄 Backup version: ${IMAGE_NAME}:${TIMESTAMP}"
echo ""
echo "📝 Next steps:"
echo "   1. Update your droplet with: ./deploy-to-droplet.sh"
echo "   2. Or pull directly on server: docker pull ${IMAGE_NAME}:${TAG}"
echo "   3. Your app will be available at: http://139.59.46.120:5001"