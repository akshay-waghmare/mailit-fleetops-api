# 🚀 FleetOps Docker Infrastructure Implementation Guide

## 📋 Overview
This document describes the comprehensive Docker infrastructure improvements implemented for the FleetOps project, including frontend-backend communication fixes, environment configuration, and Docker Hub deployment workflow.

## 🎯 Objectives Achieved

### ✅ **1. Fixed Frontend-Backend Communication**
- Resolved nginx proxy routing issues causing API 404 errors
- Fixed path duplication in API calls (`/api/v1/v1/pickups` → `/api/v1/pickups`)
- Established proper container networking between frontend and backend

### ✅ **2. Smart Environment Detection**
- Implemented ConfigService with automatic environment detection
- Added support for Docker, localhost, and external environments
- Improved reliability of API endpoint resolution across environments

### ✅ **3. Enhanced Error Handling**
- Fixed null reference errors in pickup component with safe navigation
- Added defensive programming patterns throughout the frontend
- Prevented component crashes from undefined values

### ✅ **4. Docker Hub Integration**
- Created deployment workflow using pre-built Docker Hub images
- Reduced server build time and resource usage
- Established consistent images across development and production environments

### ✅ **5. Development Tools Enhancement**
- Created safer container cleanup script with data preservation
- Added comprehensive npm scripts for Docker operations
- Improved development workflow automation

## 🔧 Technical Changes Made

### **Frontend (Angular + Nginx)**

#### **Nginx Configuration Fix** (`frontend/nginx.conf`)
```nginx
# BEFORE (causing 404s)
location /api/ {
    proxy_pass http://backend:8080/api/v1/;  # Double path issue
}

# AFTER (working correctly)
location /api/ {
    proxy_pass http://backend:8080/api/;     # Preserves full API path
}
```

#### **ConfigService Enhancement** (`frontend/libs/shared/config.service.ts`)
```typescript
// Added smart environment detection
private mightBeDockerEnvironment(): boolean {
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
}

getApiBaseUrl(): string {
  if (this.mightBeDockerEnvironment()) {
    return '/api';  // Use nginx proxy in Docker
  }
  return 'http://localhost:8081/api';  // Direct backend in local dev
}
```

#### **Component Safety** (`frontend/apps/console-app/src/app/pages/pickup.component.ts`)
```typescript
// BEFORE (causing crashes)
pickup.clientName!

// AFTER (safe navigation)
pickup?.clientName || 'Unknown Client'
```

### **Backend (Spring Boot)**

#### **Dockerfile Enhancement** (`backend/Dockerfile`)
- Added robust Gradle wrapper handling with fallback mechanism
- Automatic wrapper regeneration if corruption detected
- Improved build reliability across different platforms

### **Docker Infrastructure**

#### **Development with Local Builds** (`docker-compose.yml`)
```yaml
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    image: macubex/fleetops-backend:latest
```

#### **Production with Docker Hub Images** (`docker-compose.hub.yml`)
```yaml
services:
  backend:
    image: macubex/fleetops-backend:latest  # Pull from Docker Hub
  frontend:
    image: macubex/fleetops-frontend:latest  # Pull from Docker Hub
```

## 🚀 Deployment Workflow

### **1. Local Development & Testing**
```bash
# Option A: Local development without Docker
npm run dev:all

# Option B: Local development with Docker (builds locally)
npm run docker:dev
```

### **2. Build and Push to Docker Hub**
```bash
# Build images locally
npm run docker:build

# Push to Docker Hub
npm run docker:push

# Or combined
npm run docker:build-push
```

### **3. Server Deployment**
```bash
# Deploy using Docker Hub images (no local building)
npm run docker:dev:hub

# With database admin
npm run docker:dev:hub:admin

# View logs
npm run docker:dev:hub:logs

# Stop services
npm run docker:dev:hub:down
```

### **4. Production Deployment**
```bash
# Full production setup
npm run docker:prod
```

## 📦 Docker Hub Integration

### **Available Images**
- `macubex/fleetops-backend:latest` - Spring Boot API server
- `macubex/fleetops-frontend:latest` - Angular app with nginx

### **Image Update Workflow**
```bash
# 1. Make code changes locally
# 2. Test changes
npm run docker:dev

# 3. Build and push updated images
npm run docker:build-push

# 4. Update server (on server machine)
npm run docker:dev:hub:down
docker pull macubex/fleetops-backend:latest
docker pull macubex/fleetops-frontend:latest
npm run docker:dev:hub
```

## 🛠️ Available npm Scripts

### **Development Scripts**
```bash
npm run dev:all              # Local development (no Docker)
npm run docker:dev           # Local Docker development
npm run docker:dev:hub       # Docker Hub images development
```

### **Build & Push Scripts**
```bash
npm run docker:build         # Build all images
npm run docker:build:backend # Build backend only
npm run docker:build:frontend# Build frontend only
npm run docker:push          # Push all images
npm run docker:build-push    # Build and push combined
```

### **Deployment Scripts**
```bash
npm run docker:dev:hub       # Development with Docker Hub
npm run docker:dev:hub:admin # With PgAdmin included
npm run docker:prod          # Production deployment
```

### **Utility Scripts**
```bash
npm run docker:status        # Check container status
npm run docker:logs          # View all logs
npm run docker:cleanup       # Safe cleanup (preserves data)
npm run docker:dev:hub:logs  # View hub deployment logs
```

## 🌐 Service URLs

### **Local Development**
- Frontend: http://localhost:4200
- Backend: http://localhost:8081
- Database: localhost:5432
- PgAdmin: http://localhost:5050 (with admin profile)

### **Server Deployment** 
- Frontend: http://YOUR_SERVER:5001
- Backend: http://YOUR_SERVER:8081
- Database: localhost:5432 (internal)
- PgAdmin: http://YOUR_SERVER:5050 (with admin profile)

## 🔍 Troubleshooting Guide

### **API 404 Errors**
- **Symptom**: API calls return 404 "Not Found"
- **Cause**: nginx proxy misconfiguration
- **Solution**: Ensure `proxy_pass http://backend:8080/api/;` in nginx.conf

### **Double Path Issues**
- **Symptom**: Backend receives `/v1/pickups` instead of `/api/v1/pickups`
- **Cause**: nginx proxy stripping `/api/` incorrectly
- **Solution**: Use `proxy_pass http://backend:8080/api/;` (with trailing `/api/`)

### **Environment Detection Issues**
- **Symptom**: Frontend can't reach backend in Docker
- **Cause**: ConfigService not detecting Docker environment
- **Solution**: Check ConfigService environment detection logic

### **Gradle Wrapper Issues**
- **Symptom**: "Could not find GradleWrapperMain" error
- **Cause**: Corrupted gradle-wrapper.jar
- **Solution**: Dockerfile has automatic fallback to regenerate wrapper

## 📋 Best Practices

### **1. Environment Consistency**
- Use same ports across development and production
- Maintain consistent database names and credentials in dev
- Test locally before pushing to Docker Hub

### **2. Image Management**
- Tag images with versions for production: `v1.0.0`, `v1.1.0`, etc.
- Use `:latest` for development
- Always test images locally before pushing

### **3. Security**
- Use environment variables for sensitive data in production
- Don't commit passwords or secrets to version control
- Use strong passwords for production databases

### **4. Performance**
- Pre-build images and push to Docker Hub for faster server deployments
- Use Docker layer caching
- Optimize nginx configuration for production

## 🎯 Quick Reference Commands

### **Start Development Environment**
```bash
# Local with Docker Hub images (recommended for servers)
npm run docker:dev:hub

# Local with builds (recommended for development)
npm run docker:dev
```

### **Update Server with New Changes**
```bash
# 1. Build and push from development machine
npm run docker:build-push

# 2. Update server
npm run docker:dev:hub:down
docker pull macubex/fleetops-backend:latest
docker pull macubex/fleetops-frontend:latest
npm run docker:dev:hub
```

### **Emergency Commands**
```bash
# View logs
npm run docker:logs

# Restart specific service
docker-compose restart backend

# Full reset (preserves database)
npm run docker:cleanup
npm run docker:dev:hub
```

## 📈 Metrics & Monitoring

### **Health Checks**
- Frontend: http://localhost:5001/health
- Backend: http://localhost:8081/actuator/health
- Database: Built-in PostgreSQL health checks

### **Log Monitoring**
```bash
# All services
npm run docker:logs

# Specific service
npm run docker:backend:logs
npm run docker:frontend:logs

# Follow logs in real-time
docker-compose logs -f
```

## 🔄 Version History

### **v1.0.0 - Initial Docker Infrastructure**
- Basic Docker Compose setup
- Frontend and backend containerization
- PostgreSQL with PostGIS

### **v1.1.0 - Communication Fixes**
- Fixed nginx proxy configuration
- Resolved API path duplication issues
- Added environment detection

### **v1.2.0 - Docker Hub Integration**
- Added Docker Hub deployment workflow
- Created production and development configurations
- Enhanced build and deployment scripts

### **v1.3.0 - Stability Improvements**
- Fixed Gradle wrapper issues
- Added error handling improvements
- Enhanced development tools

---

## 💡 Tips for Development Teams

1. **Always test locally first**: Use `npm run docker:dev` before pushing changes
2. **Use semantic commits**: Follow conventional commit format for better tracking
3. **Document environment variables**: Update this guide when adding new config
4. **Monitor resource usage**: Check Docker containers memory and CPU usage
5. **Keep images small**: Regularly clean up unused Docker images and layers

---

*This documentation is maintained as part of the FleetOps project. Last updated: September 2025*