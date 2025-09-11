# FleetOps Docker Setup

## 🚀 Quick Start

### Start Everything (Development)
```bash
npm run docker:dev
```

This starts:
- PostgreSQL database
- Spring Boot backend 
- Angular frontend
- All services connected via Docker network

## 📋 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Angular Application |
| Backend API | http://localhost:8081 | Spring Boot API |
| Backend Health | http://localhost:8081/actuator/health | Health Check |
| Database | localhost:5432 | PostgreSQL |
| PgAdmin | http://localhost:5050 | Database Admin (optional) |

## 🔧 Common Commands

### Development
```bash
# Start all services (with automatic cleanup)
npm run docker:dev

# Force start without cleanup (original behavior)
npm run docker:dev:force

# Clean containers and restart
npm run docker:restart

# Start in background
npm run docker:dev:detached

# Clean up containers only
npm run docker:cleanup

# View logs
npm run docker:logs

# Check detailed status
npm run docker:status

# Stop everything
npm run docker:down
```

### Database Management
```bash
# Start database only
npm run docker:db:start

# View database logs
npm run docker:db:logs

# Reset database (removes all data!)
npm run docker:db:reset

# Start PgAdmin for database management
npm run docker:admin
```

### Individual Services
```bash
# Backend only
npm run docker:backend:start
npm run docker:backend:logs
npm run docker:backend:restart

# Frontend only
npm run docker:frontend:start
npm run docker:frontend:logs
npm run docker:frontend:restart
```

### Production Deployment
```bash
# Production mode
npm run docker:prod

# Production with build
npm run docker:prod:build
```

### Testing
```bash
# Run tests in containers
npm run docker:test
```

## 🗂️ File Structure

```
fleetops/
├── docker-compose.yml          # Main compose file
├── docker-compose.override.yml # Development overrides
├── docker-compose.prod.yml     # Production overrides  
├── docker-compose.test.yml     # Testing overrides
├── .env.example               # Environment variables template
├── backend/
│   ├── Dockerfile
│   └── docker/
│       └── init/              # Database initialization
└── frontend/
    └── Dockerfile
```

## ⚙️ Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` file with your values:
```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
```

## 🔍 PgAdmin Setup

1. Start PgAdmin:
```bash
npm run docker:admin
```

2. Open http://localhost:5050

3. Login:
   - Email: `admin@fleetops.com`
   - Password: `admin123`

4. Add server connection:
   - Host: `postgres`
   - Port: `5432`
   - Database: `fleetops_dev`
   - Username: `fleetops`
   - Password: `fleetops`

## 🐛 Troubleshooting

### Common Issues

**Container name conflicts (fixed automatically):**
```bash
# The new scripts handle this automatically
npm run docker:dev       # Auto-cleanup and restart
npm run docker:restart   # Force restart with cleanup
npm run docker:cleanup   # Clean containers only
```

**Port already in use:**
```bash
# Check what's using the port
netstat -tulpn | grep :4200
netstat -tulpn | grep :8081
netstat -tulpn | grep :5432

# Stop conflicting services
npm run docker:down
npm run docker:cleanup
```

**Database connection issues:**
```bash
# Check database status
npm run docker:db:logs

# Reset database
npm run docker:db:reset
```

**Frontend not loading:**
```bash
# Check frontend logs
npm run docker:frontend:logs

# Restart frontend
npm run docker:frontend:restart
```

### Clean Up
```bash
# Remove containers and volumes
npm run docker:clean

# Remove everything including images
npm run docker:clean:all
```

## 🔄 Development Workflow

### Option 1: Full Docker Development
```bash
npm run docker:dev:detached
npm run docker:logs
```

### Option 2: Database in Docker, Apps Local
```bash
npm run docker:db:start
npm run dev:all
```

### Option 3: Mixed Development
```bash
npm run docker:db:start
npm run docker:backend:start  
npm run dev:frontend
```

## 🚀 Deployment

### Build and Push Images
```bash
# Build all images
npm run docker:build

# Push to Docker Hub
npm run docker:push

# Build and push in one command
npm run docker:build-push
```

### Production Deployment
```bash
# Deploy to production
npm run docker:prod:build
```

## 📊 Monitoring

### Health Checks
- Backend: http://localhost:8081/actuator/health
- Frontend: http://localhost:4200 (should load)
- Database: `npm run docker:db:logs`

### Logs
```bash
# All services
npm run docker:logs

# Specific service
npm run docker:backend:logs
npm run docker:frontend:logs
npm run docker:db:logs
```