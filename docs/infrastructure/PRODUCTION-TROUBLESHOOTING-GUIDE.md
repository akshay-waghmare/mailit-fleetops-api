# Production Troubleshooting Guide - FleetOps

**Quick Reference**: Common production issues and solutions  
**Last Updated**: October 16, 2025  
**Production URL**: http://mailit-dev.ddns.net

---

## 🚨 Critical Issues & Solutions

### **1. API Returns 403 "Invalid CORS request"**

**Symptoms**:
- Browser login fails with 403 error
- Curl without headers works (200)  
- Curl with `Origin` header fails (403)
- Browser console shows CORS errors

**Diagnosis**:
```bash
# Test without CORS headers (should work)
curl -X POST http://mailit-dev.ddns.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Test with CORS headers (should also work after fix)
curl -X POST http://mailit-dev.ddns.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://mailit-dev.ddns.net" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Root Cause**: Missing production domain in backend CORS configuration.

**Solution**:
```yaml
# In docker-compose.hub.yml
backend:
  environment:
    CORS_ALLOWED_ORIGINS: "https://mailit-dev.ddns.net,http://mailit-dev.ddns.net,http://localhost:5001,http://frontend:80,http://localhost:4200,http://localhost:8081"
```

**Verification**:
```bash
# Check environment variable is set
docker exec fleetops-backend printenv | grep CORS

# Should show production domain in the list
```

---

### **2. Nginx Configuration Not Loading**

**Symptoms**:
- HTTP 000 connection errors
- Nginx container running but config file missing
- `cat: can't open '/etc/nginx/conf.d/fleetops.conf': No such file or directory`

**Diagnosis**:
```bash
# Check if config file exists in container
docker exec fleetops-web cat /etc/nginx/conf.d/fleetops.conf

# Check volume mount
docker inspect fleetops-web | grep -A 10 "Mounts"
```

**Root Cause**: Volume mount path mismatch or missing host directory.

**Solution**:
```bash
# 1. Create proper directory structure on host
mkdir -p /root/fleetops-nginx/conf.d

# 2. Create nginx configuration file
cat > /root/fleetops-nginx/conf.d/fleetops.conf << 'EOF'
server {
    listen 80;
    server_name mailit-dev.ddns.net;

    location /api/ {
        proxy_pass http://fleetops-backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;     
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
    }

    location / {
        proxy_pass http://fleetops-frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 3. Recreate container (restart won't pick up volume changes)
cd /root/mailit-fleetops-api
docker-compose -f docker-compose.hub.yml stop web
docker-compose -f docker-compose.hub.yml rm -f web
docker-compose -f docker-compose.hub.yml up -d web
```

**Verification**:
```bash
# Config should now be loaded
docker exec fleetops-web cat /etc/nginx/conf.d/fleetops.conf

# Nginx should start successfully
docker exec fleetops-web nginx -t
```

---

### **3. Backend Container Fails to Start**

**Symptoms**:
- Backend container exits immediately
- Database connection errors in logs
- Health check failures

**Diagnosis**:
```bash
# Check backend logs
docker logs fleetops-backend --tail 20

# Check database connectivity
docker exec fleetops-postgres pg_isready -U fleetops -d fleetops_dev

# Check network connectivity
docker exec fleetops-backend ping postgres
```

**Common Causes & Solutions**:

**Database Not Ready**:
```bash
# Wait for database health check
docker-compose -f docker-compose.hub.yml logs postgres

# Ensure health check passes before backend starts
depends_on:
  postgres:
    condition: service_healthy
```

**Environment Variable Issues**:
```bash
# Check all backend environment variables
docker exec fleetops-backend printenv | grep -E "(DB_|SPRING_|CORS_)"

# Ensure required variables are set
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fleetops_dev
DB_USERNAME=fleetops
DB_PASSWORD=fleetops
```

---

### **4. Frontend Application Not Loading**

**Symptoms**:
- Blank page or loading errors
- 404 errors for static assets
- Browser console shows network errors

**Diagnosis**:
```bash
# Check frontend container status
docker logs fleetops-frontend --tail 10

# Test direct frontend access
curl -I http://mailit-dev.ddns.net:5001

# Check nginx routing
docker logs fleetops-web --tail 10
```

**Solution**:
```bash
# Restart frontend service
docker-compose -f docker-compose.hub.yml restart frontend

# Check nginx proxy configuration
docker exec fleetops-web nginx -t
docker exec fleetops-web nginx -s reload
```

---

## 🔧 Diagnostic Commands

### **Quick Health Check**
```bash
# All services status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep fleetops

# Service health summary  
docker-compose -f docker-compose.hub.yml ps

# Quick API test
curl -o /dev/null -s -w "%{http_code}\n" http://mailit-dev.ddns.net/api/v1/auth/login
```

### **Detailed Diagnostics**
```bash
# Check all container logs
docker-compose -f docker-compose.hub.yml logs --tail 10

# Network connectivity between services
docker exec fleetops-web ping fleetops-backend
docker exec fleetops-backend ping postgres

# Database connection test
docker exec fleetops-postgres psql -U fleetops -d fleetops_dev -c "SELECT 1;"

# Nginx configuration test
docker exec fleetops-web nginx -t
```

### **Performance Monitoring**
```bash
# Resource usage
docker stats

# Active connections
docker exec fleetops-postgres psql -U fleetops -d fleetops_dev -c "SELECT count(*) FROM pg_stat_activity;"

# Nginx access logs
docker logs fleetops-web --tail 20
```

---

## 🔄 Recovery Procedures

### **Complete Service Restart**
```bash
cd /root/mailit-fleetops-api
docker-compose -f docker-compose.hub.yml down
docker-compose -f docker-compose.hub.yml up -d
```

### **Rolling Service Restart** 
```bash
# Restart in dependency order
docker-compose -f docker-compose.hub.yml restart postgres
sleep 10
docker-compose -f docker-compose.hub.yml restart backend
sleep 5  
docker-compose -f docker-compose.hub.yml restart frontend
docker-compose -f docker-compose.hub.yml restart web
```

### **Clean Rebuild** (Last Resort)
```bash
# Stop all services
docker-compose -f docker-compose.hub.yml down

# Pull latest images
docker pull macubex/fleetops-backend:latest
docker pull macubex/fleetops-frontend:latest

# Remove old containers
docker container prune -f

# Restart services
docker-compose -f docker-compose.hub.yml up -d
```

---

## 📋 Pre-Deployment Checklist

### **Infrastructure Requirements**
- [ ] Domain name pointing to server IP
- [ ] Ports 80, 443, 5001, 8081, 5432 open
- [ ] Docker and Docker Compose installed
- [ ] Sufficient disk space (>10GB recommended)
- [ ] Sufficient RAM (>2GB recommended)

### **Configuration Files**
- [ ] `/root/fleetops-nginx/conf.d/fleetops.conf` exists
- [ ] `docker-compose.hub.yml` has CORS_ALLOWED_ORIGINS
- [ ] Volume mounts point to correct host paths
- [ ] Environment variables set correctly

### **Service Verification**
- [ ] All containers start and show "healthy" status
- [ ] Nginx configuration test passes
- [ ] Database accepts connections
- [ ] Backend health endpoint responds
- [ ] Frontend loads in browser
- [ ] API authentication works

---

## 🚨 Emergency Contacts & Escalation

### **Log Collection for Support**
```bash
# Collect all relevant logs
mkdir -p /tmp/fleetops-debug
docker-compose -f docker-compose.hub.yml logs > /tmp/fleetops-debug/all-services.log
docker logs fleetops-backend > /tmp/fleetops-debug/backend.log
docker logs fleetops-web > /tmp/fleetops-debug/nginx.log
docker ps -a > /tmp/fleetops-debug/container-status.txt
docker inspect fleetops-web > /tmp/fleetops-debug/web-inspect.json
```

### **System Information**
```bash
# System resources
df -h > /tmp/fleetops-debug/disk-space.txt
free -h > /tmp/fleetops-debug/memory.txt
docker system df > /tmp/fleetops-debug/docker-usage.txt
```

---

## 📞 Support Information

**Production URL**: http://mailit-dev.ddns.net  
**Admin Credentials**: admin/Admin@123  
**Repository**: https://github.com/akshay-waghmare/mailit-fleetops-api  
**Documentation**: `/docs` folder in repository  

**Critical Files**:
- `/root/mailit-fleetops-api/docker-compose.hub.yml`
- `/root/fleetops-nginx/conf.d/fleetops.conf`  

---

*Keep this guide accessible during production deployments and maintenance windows.*