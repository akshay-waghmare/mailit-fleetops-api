# Production Troubleshooting Guide - FleetOps

**Quick Reference**: Common production issues and solutions  
**Last Updated**: October 17, 2025  
**Production URL**: https://mailit-dev.ddns.net 🔒  
**✅ SSL Status**: HTTPS fully working with Let's Encrypt certificate

---

## ✅ **CURRENT SSL/HTTPS STATUS**

**HTTPS**: ✅ **FULLY WORKING** - https://mailit-dev.ddns.net  
**HTTP**: ✅ **REDIRECTS TO HTTPS** - Automatic redirect configured  
**Certificate**: Let's Encrypt (valid until December 12, 2025)  
**TLS**: TLS 1.2 and 1.3 supported

**CORS Status**: ✅ Working via nginx workaround (see Section 1 for details)

---

## 🚨 Critical Issues & Solutions

### **1. API Returns 403 "Invalid CORS request"** ⚠️ **CRITICAL - HTTPS ONLY**

**Symptoms**:
- Browser login fails with 403 error via HTTPS
- Login works without Origin header but fails with browser CORS
- Console shows: `POST https://mailit-dev.ddns.net/api/v1/auth/login 403 (Forbidden)`
- Preflight OPTIONS request returns "Invalid CORS request"

**Diagnosis**:
```bash
# Test CORS preflight (will fail with Spring Boot CORS issue)
curl -X OPTIONS -H "Origin: https://mailit-dev.ddns.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://mailit-dev.ddns.net/api/v1/auth/login -I

# Test without CORS (should work)
curl -X POST https://mailit-dev.ddns.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' -k

# Test direct backend (bypasses nginx)
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Root Cause**: Spring Boot CORS configuration not properly reading `CORS_ALLOWED_ORIGINS` environment variable for HTTPS domains. Backend rejects CORS preflight requests even when domain is configured.

**Solution - nginx CORS Workaround**:

Since Spring Boot CORS is not working properly, nginx handles CORS completely:

```nginx
# /root/fleetops-nginx/conf.d/fleetops.conf

server {
    listen 443 ssl;
    server_name mailit-dev.ddns.net;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mailit-dev.ddns.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mailit-dev.ddns.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # API Backend with CORS workaround
    location ~ ^/api/ {
        # Handle CORS preflight
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://mailit-dev.ddns.net" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age 86400 always;
            add_header Content-Type "text/plain; charset=utf-8" always;
            add_header Content-Length 0 always;
            return 204;
        }
        
        # Remove Origin header to bypass backend CORS check
        proxy_set_header Origin "";
        
        proxy_pass http://fleetops-backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Add CORS headers to response
        add_header Access-Control-Allow-Origin "https://mailit-dev.ddns.net" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
}
```

**Key Points**:
1. **nginx handles CORS preflight** - Returns 204 for OPTIONS requests with proper headers
2. **Strips Origin header** - Removes Origin when proxying to backend (bypasses backend CORS validation)
3. **Adds CORS headers** - nginx adds proper CORS headers to all API responses
4. **Backend oblivious** - Backend processes requests as non-CORS (no Origin header)

**Implementation Steps**:
```bash
# 1. Update nginx configuration with CORS workaround
cat > /root/fleetops-nginx/conf.d/fleetops.conf << 'EOF'
[paste configuration above]
EOF

# 2. Test nginx configuration
docker exec fleetops-web nginx -t

# 3. Reload nginx
docker exec fleetops-web nginx -s reload

# 4. Verify CORS works
curl -X OPTIONS -H "Origin: https://mailit-dev.ddns.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://mailit-dev.ddns.net/api/v1/auth/login -I -k
# Should return: HTTP/2 204 with CORS headers

# 5. Test actual login
curl -X POST -H "Content-Type: application/json" \
  -H "Origin: https://mailit-dev.ddns.net" \
  -d '{"username":"admin","password":"Admin@123"}' \
  https://mailit-dev.ddns.net/api/v1/auth/login -k
# Should return: JWT token with user info
```

**Verification**:
```bash
# Check nginx configuration is loaded
docker exec fleetops-web cat /etc/nginx/conf.d/fleetops.conf | grep -A 5 "OPTIONS"

# Test in browser - should work now
# Open https://mailit-dev.ddns.net and login with admin/Admin@123
```

**Future Fix**: Update Spring Boot CORS configuration to properly read environment variables.

---

### **1B. Windows Client SSL/TLS Handshake Errors** ⚠️ **INFORMATIONAL**

**Symptoms**:
- curl from Windows shows: `schannel: next InitializeSecurityContext failed: SEC_E_ILLEGAL_MESSAGE`
- Server-side HTTPS works perfectly
- Certificate is valid and properly configured

**Root Cause**: Windows Schannel SSL/TLS compatibility issue with specific nginx SSL cipher configuration.

**Solution**: This is a **client-side Windows issue only**. The production server HTTPS is working correctly.

**Workarounds for Testing**:
```bash
# Option 1: Use browser (recommended)
# Open https://mailit-dev.ddns.net in Chrome/Firefox/Edge

# Option 2: Test from Linux/Mac
ssh user@server curl https://mailit-dev.ddns.net

# Option 3: Test from server itself
ssh root@139.59.46.120
curl -k https://mailit-dev.ddns.net/api/v1/auth/login

# Option 4: Use HTTP endpoint temporarily
curl http://139.59.46.120:8081/api/v1/auth/login
```

**Impact**: None on production. Browsers work fine. This only affects Windows curl/Schannel.

---

### **2. SSL Certificate Configuration and Mounting**

**Symptoms**:
- HTTPS not working even though certificates exist
- nginx can't find SSL certificate files
- Certificate files exist on host but not accessible in container

**Diagnosis**:
```bash
# Check certificates on host
ls -la /root/mailit-fleetops-api/certbot/live/mailit-dev.ddns.net/

# Check certificates in nginx container
docker exec fleetops-web ls -la /etc/letsencrypt/live/mailit-dev.ddns.net/

# Verify certificate validity
openssl x509 -in /root/mailit-fleetops-api/certbot/live/mailit-dev.ddns.net/cert.pem -text -noout | grep -E 'Subject:|Not After'
```

**Solution - Proper Certificate Mounting**:

```bash
# 1. Stop nginx container (must recreate for volume changes)
docker stop fleetops-web
docker rm fleetops-web

# 2. Create nginx container with SSL certificate volume
docker run -d --name fleetops-web \
  --network mailit-fleetops-api_fleetops-network \
  -p 80:80 -p 443:443 \
  -v /root/fleetops-nginx/conf.d:/etc/nginx/conf.d \
  -v /root/mailit-fleetops-api/certbot:/etc/letsencrypt:ro \
  --restart unless-stopped \
  nginx:alpine

# 3. Verify mount worked
docker exec fleetops-web ls -la /etc/letsencrypt/live/mailit-dev.ddns.net/

# 4. Test nginx config
docker exec fleetops-web nginx -t

# 5. Reload nginx  
docker exec fleetops-web nginx -s reload
```

**docker-compose.hub.yml Configuration**:
```yaml
web:
  image: nginx:alpine
  container_name: fleetops-web
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /root/fleetops-nginx/conf.d:/etc/nginx/conf.d
    - /root/mailit-fleetops-api/certbot:/etc/letsencrypt:ro  # SSL certificates
  depends_on:
    - frontend
    - backend
  networks:
    - fleetops-network
  restart: unless-stopped
```

**Note**: Certificate mount is read-only (`:ro`) for security.

---

### **3. Frontend Port Configuration** 

**Symptoms**:
- nginx returns 502 Bad Gateway for frontend
- Frontend container running but nginx can't connect
- Error: `connect() failed (111: Connection refused) while connecting to upstream`

**Root Cause**: Frontend container listens on port 80 internally, but nginx configuration references wrong port (e.g., 4200).

**Solution**:
```nginx
# Correct configuration
location / {
    proxy_pass http://frontend:80;  # NOT frontend:4200
    proxy_set_header Host $host;
}
```

**Verification**:
```bash
# Check what port frontend actually uses
docker exec fleetops-frontend netstat -tlnp

# Test direct access
docker exec fleetops-web wget -O- http://frontend:80 | head -10

# Update nginx config if needed
docker exec fleetops-web sed -i 's/frontend:4200/frontend:80/g' /etc/nginx/conf.d/fleetops.conf
docker exec fleetops-web nginx -s reload
```

---

### **4. Backend Container Name Resolution**

**Symptoms**:
- nginx error: `host not found in upstream "backend"`
- 502 Bad Gateway for API requests
- nginx can't resolve backend container name

**Root Cause**: nginx trying to resolve generic "backend" instead of actual container name "fleetops-backend".

**Solution**:
```bash
# Update nginx configuration to use correct container name
docker exec fleetops-web sed -i 's/backend:8080/fleetops-backend:8080/g' /etc/nginx/conf.d/fleetops.conf

# Test configuration
docker exec fleetops-web nginx -t

# Reload nginx
docker exec fleetops-web nginx -s reload

# Verify backend resolution
docker exec fleetops-web nslookup fleetops-backend
docker exec fleetops-web wget -O- http://fleetops-backend:8080/actuator/health
```

---

### **5. docker-compose 'ContainerConfig' Error**

**Symptoms**:
- Error: `KeyError: 'ContainerConfig'` when running `docker-compose up`
- Cannot recreate containers with docker-compose
- Happens after adding/changing volume mounts

**Root Cause**: docker-compose 1.29.2 bug with volume configuration changes on existing containers.

**Workaround**:
```bash
# Option 1: Use docker run directly (recommended for volume changes)
docker stop fleetops-web
docker rm fleetops-web
docker run -d --name fleetops-web [... full docker run command ...]

# Option 2: Clean up and recreate
docker-compose -f docker-compose.hub.yml down
docker container prune -f
docker-compose -f docker-compose.hub.yml up -d

# Option 3: Upgrade docker-compose (if possible)
# This bug is fixed in docker compose v2+
```

---

### **6. Backend Container Fails to Start**

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
- [x] Domain name pointing to server IP (139.59.46.120)
- [x] Ports 80, 443 open for HTTPS/SSL ✅
- [x] Ports 5001, 8081, 5432 open for direct service access
- [x] Docker and Docker Compose installed
- [x] Sufficient disk space (>10GB recommended)
- [x] Sufficient RAM (>2GB recommended)
- [x] SSL certificates (Let's Encrypt, valid until Dec 12, 2025) ✅

### **Configuration Files**
- [x] `/root/fleetops-nginx/conf.d/fleetops.conf` exists with HTTPS + CORS workaround ✅
- [x] SSL certificates mounted at `/root/mailit-fleetops-api/certbot:/etc/letsencrypt:ro` ✅
- [x] `docker-compose.hub.yml` has CORS_ALLOWED_ORIGINS (though backend CORS not working)
- [x] Volume mounts point to correct host paths ✅
- [x] Environment variables set correctly ✅

### **Service Verification**
- [x] All containers start and show "healthy" status ✅
- [x] Nginx configuration test passes ✅
- [x] Database accepts connections ✅
- [x] Backend health endpoint responds ✅
- [x] Frontend loads in browser ✅
- [x] API authentication works via HTTPS ✅
- [x] HTTPS login functional with JWT tokens ✅

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

**Production URL**: https://mailit-dev.ddns.net 🔒  
**Admin Credentials**: admin/Admin@123  
**Repository**: https://github.com/akshay-waghmare/mailit-fleetops-api  
**Documentation**: `/docs` folder in repository  

**Critical Files**:
- `/root/mailit-fleetops-api/docker-compose.hub.yml`
- `/root/fleetops-nginx/conf.d/fleetops.conf` (HTTPS + CORS workaround)
- `/root/mailit-fleetops-api/certbot/` (SSL certificates)

**Production Status** (as of October 17, 2025):
- ✅ HTTPS working with Let's Encrypt SSL
- ✅ API authentication functional
- ✅ CORS working via nginx workaround
- ⚠️ Spring Boot CORS config needs fixing (non-blocking)  

---

*Keep this guide accessible during production deployments and maintenance windows.*