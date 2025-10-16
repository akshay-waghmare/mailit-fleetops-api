# FleetOps Production Deployment Guide

## 🚀 Current Working Configuration

### Production URL: http://mailit-dev.ddns.net

**Status**: ✅ **FULLY FUNCTIONAL**
- **Authentication**: Working with proper CORS configuration
- **API**: All endpoints responding correctly
- **Frontend**: Complete application accessible
- **Database**: PostgreSQL with PostGIS running smoothly

---

## 📋 Quick Deployment Steps

### 1. **Server Requirements**
- Ubuntu server with Docker and Docker Compose installed
- Domain pointing to server IP (mailit-dev.ddns.net → 139.59.46.120)
- Ports 80, 443, 5001, 8081, 5432 open

### 2. **Deploy Services**
```bash
# On production server
git clone https://github.com/akshay-waghmare/mailit-fleetops-api.git
cd mailit-fleetops-api
git checkout production-config

# Create nginx configuration directory
mkdir -p /root/fleetops-nginx/conf.d

# Create nginx HTTP configuration
cat > /root/fleetops-nginx/conf.d/fleetops.conf << 'EOF'
server {
    listen 80;
    server_name mailit-dev.ddns.net;

    # Backend API - MUST come before / location
    location /api/ {
        # Handle preflight OPTIONS requests for CORS
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';        
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://fleetops-backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Add CORS headers to all API responses
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;     
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;        
    }

    # Frontend - catch-all, must be last
    location / {
        proxy_pass http://fleetops-frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Start services
docker-compose -f docker-compose.hub.yml up -d
```

### 3. **Verify Deployment**
```bash
# Check service status
docker ps

# Test API authentication
curl -X POST http://mailit-dev.ddns.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Should return HTTP 200 with JWT tokens
```

---

## 🔧 Key Configuration Details

### **CORS Configuration**
```yaml
environment:
  CORS_ALLOWED_ORIGINS: "https://mailit-dev.ddns.net,http://localhost:5001,http://frontend:80,http://localhost:4200,http://localhost:8081"
```

### **Nginx Volume Mount**
```yaml
volumes:
  - /root/fleetops-nginx/conf.d:/etc/nginx/conf.d
```

### **Service Architecture**
- **Frontend**: Angular app served by nginx on port 80 (internal)
- **Backend**: Spring Boot API on port 8080 (internal)  
- **Web**: Nginx reverse proxy on ports 80/443 (public)
- **Database**: PostgreSQL with PostGIS on port 5432

---

## 🔐 Authentication & Access

### **Default Credentials**
- **Username**: admin
- **Password**: Admin@123

### **Admin Interface URLs**
- **Main App**: http://mailit-dev.ddns.net
- **PgAdmin**: http://mailit-dev.ddns.net:5050 (when admin profile active)
- **Backend API**: http://mailit-dev.ddns.net:8081 (direct access)

---

## 📊 Service Health Checks

### **Health Endpoints**
```bash
# Frontend health (through nginx)
curl http://mailit-dev.ddns.net

# Backend health  
curl http://mailit-dev.ddns.net:8081/actuator/health

# Database health
docker exec fleetops-postgres pg_isready -U fleetops -d fleetops_dev
```

### **View Logs**
```bash
# All services
docker-compose -f docker-compose.hub.yml logs

# Specific service
docker logs fleetops-backend
docker logs fleetops-frontend  
docker logs fleetops-web
docker logs fleetops-postgres
```

---

## 🔄 Maintenance Operations

### **Update Application**
```bash
# Pull latest images
docker pull macubex/fleetops-backend:latest
docker pull macubex/fleetops-frontend:latest

# Restart services
docker-compose -f docker-compose.hub.yml down
docker-compose -f docker-compose.hub.yml up -d
```

### **Database Backup**
```bash
# Create backup
docker exec fleetops-postgres pg_dump -U fleetops fleetops_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i fleetops-postgres psql -U fleetops -d fleetops_dev < backup.sql
```

### **Restart Individual Services**
```bash
docker-compose -f docker-compose.hub.yml restart backend
docker-compose -f docker-compose.hub.yml restart frontend
docker-compose -f docker-compose.hub.yml restart web
```

---

## 🚧 Future SSL Setup (Optional Enhancement)

### **SSL Certificate Setup**
The production-config branch includes SSL certificate configuration using Let's Encrypt.
See [CHANGES-SSL-SETUP.md](CHANGES-SSL-SETUP.md) for detailed SSL configuration steps.

**Current HTTP-only setup is fully functional and production-ready.**

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

#### **API 403 "Invalid CORS request"**
- **Cause**: CORS_ALLOWED_ORIGINS missing production domain
- **Solution**: Ensure backend environment includes production URL
- **Verify**: `docker exec fleetops-backend printenv | grep CORS`

#### **Nginx Configuration Not Loading**
- **Cause**: Volume mount path incorrect or file missing
- **Solution**: Ensure `/root/fleetops-nginx/conf.d/fleetops.conf` exists
- **Verify**: `docker exec fleetops-web cat /etc/nginx/conf.d/fleetops.conf`

#### **Database Connection Errors**
- **Cause**: Database not fully initialized or network issues
- **Solution**: Wait for health checks to pass, check logs
- **Verify**: `docker logs fleetops-postgres`

---

## 📋 Production Checklist

- [ ] Domain DNS pointing to server
- [ ] All required ports open (80, 443, 5001, 8081, 5432)
- [ ] Docker and Docker Compose installed
- [ ] Nginx configuration created at correct path
- [ ] All services healthy and responding
- [ ] Authentication working with admin credentials
- [ ] API endpoints responding correctly
- [ ] Frontend application loading properly
- [ ] Database connections successful
- [ ] Health check endpoints accessible

---

## 📈 Monitoring & Alerts

### **Service Monitoring**
```bash
# Check all container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Monitor resource usage
docker stats

# Check nginx access logs
docker logs fleetops-web --tail 50
```

### **Application Metrics**
- **Backend Health**: http://mailit-dev.ddns.net:8081/actuator/health
- **Database Health**: Built into health checks
- **Response Times**: Monitor via nginx logs
- **Error Rates**: Monitor via application logs

---

**Last Updated**: October 16, 2025  
**Version**: v1.0 (HTTP-only production deployment)  
**Status**: Production Ready ✅