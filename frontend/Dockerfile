# 🚀 FleetOps Frontend Production Dockerfile
# Multi-stage build for DigitalOcean deployment
# Stage 1: Build the Angular application
# Stage 2: Serve with Nginx

# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/console-app/package*.json ./apps/console-app/
COPY apps/ui-kit/package*.json ./apps/ui-kit/

# Install dependencies (including dev dependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the Angular application for production
RUN npm run build:all

# ==========================================
# Stage 2: Production Stage with Nginx
# ==========================================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/console-app/browser/ /usr/share/nginx/html/

# Set permissions for web content
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]