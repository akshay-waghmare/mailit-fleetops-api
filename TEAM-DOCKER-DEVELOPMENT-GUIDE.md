# 🚀 FleetOps Docker Development Guide

## Quick Start for Team Development

### **Frontend Development Workflow**

Our Docker setup uses **local builds** for reliability and speed. This prevents the cache and dependency issues we encountered.

#### **Standard Development Process:**

1. **Build Frontend Locally First:**
   ```bash
   cd frontend
   npm install
   npm run build:console-app
   ```

2. **Start Full Docker Stack:**
   ```bash
   # From root directory
   docker compose up --build
   ```

3. **Verify Everything Works:**
   - Frontend: http://localhost:5001
   - Backend API: http://localhost:8081/api/v1/orders
   - PgAdmin: http://localhost:5050 (profile: admin)

### **Why This Approach?**

✅ **Reliable**: No cache issues or build context problems  
✅ **Fast**: Reuses your local build  
✅ **Consistent**: Same experience for all developers  
✅ **Debuggable**: Local source maps and console access  

### **File Structure:**

```
frontend/
├── Dockerfile.local       ← Production (simple, reliable)
├── Dockerfile.hybrid      ← Fallback (auto-detects build)
├── Dockerfile             ← Original (complex multi-stage)
├── .dockerignore          ← Updated to allow dist/ folder
└── dist/                  ← Your local build goes here
```

### **Important Notes:**

- **Always build locally first** before `docker compose up`
- **Use `Dockerfile.local`** (configured in docker-compose.yml)
- **Local build required** - Docker copies from `dist/console-app/browser/`
- **No npm install in Docker** - uses your pre-built files

### **Troubleshooting:**

#### Problem: "Order list not loading"
```bash
# Solution: Rebuild frontend locally
cd frontend && npm run build:console-app
docker compose up --build frontend
```

#### Problem: "Old content still showing"
```bash
# Solution: Complete rebuild
docker compose down
docker image rm macubex/fleetops-frontend:latest
cd frontend && npm run build:console-app
docker compose up --build
```

#### Problem: "API calls not working"
- Check backend logs: `docker logs fleetops-backend`
- Verify API URL: Should be `/api/v1/orders` (not full URL in Docker)
- Ensure ConfigService detects Docker mode (port 5001)

### **Backend Integration:**

The OrderService is configured to work identically to PickupService:
- ✅ Direct HttpClient calls (no ApiService layer)
- ✅ Proper Basic auth headers for compatibility
- ✅ Async baseUrl resolution via ConfigService
- ✅ JPA field naming compatibility (createdAt, not created_at)

### **Team Development Rules:**

1. **Never commit dist/ folder** (in .gitignore)
2. **Always build locally before Docker**
3. **Use Dockerfile.local for production builds**
4. **Test both local dev and Docker modes**
5. **Keep OrderService pattern consistent with PickupService**

---

**Need Help?** Check the working PickupService implementation in `frontend/libs/shared/pickup.service.ts` as reference.