<!-- FleetOps Full-Stack Monorepo - Angular Frontend Setup Instructions -->

# FleetOps Angular Frontend Development Plan

## 🎯 Current Goal: Angular 20 Frontend Setup & Integration

### ✅ Backend Foundation COMPLETED
- Spring Boot 3.3.5 with Java 21 (via SDKMAN)
- PostgreSQL + PostGIS spatial database
- Modular monolith architecture (accounts, catalog, orders, dispatch, geo, routing, tracking)
- Docker development environment
- Flyway migrations and spatial data support
- JWT/OAuth2 authentication ready
- Actuator endpoints for monitoring
- Cross-platform development support (Windows, Linux, macOS)

### 🚧 Current Sprint: Frontend Monorepo Setup

## Angular Frontend Requirements
- **Angular Version**: Angular 20 (stable Signals, modern control flow)
- **Node.js**: 20.19+ required
- **TypeScript**: 5.8
- **Package Manager**: npm with workspaces
- **Architecture**: Monorepo structure for shared libraries

## Frontend Applications Structure
```
frontend/
├── apps/
│   ├── console-app/          # Admin/Operations SPA (Primary)
│   └── driver-app/           # Driver web/mobile app (Future)
└── libs/
    ├── shared/               # Common utilities, types, services
    ├── ui-kit/               # Reusable UI components
    ├── map-widgets/          # MapLibre GL JS components
    └── state-management/     # NgRx store modules
```

## Technology Stack - Frontend
- **Framework**: Angular 20 with Standalone Components
- **Styling**: SCSS + Angular Material
- **State Management**: NgRx (Store, Effects, DevTools)
- **Maps**: MapLibre GL JS (open-source vector maps)
- **Tile Server**: TileServer GL with OpenMapTiles
- **Build Tool**: Angular CLI with workspace support
- **Testing**: Jasmine + Karma, Playwright E2E

## Sprint Tasks

### Phase 1: Monorepo Foundation
- [ ] Create root package.json with workspaces
- [ ] Update .gitignore for full-stack development
- [ ] Create Angular workspace structure
- [ ] Set up console-app with routing and SCSS
- [ ] Configure development scripts (dev:all, dev:frontend, dev:backend)
- [ ] Update docker-compose.yml for frontend development

### Phase 2: Core Angular Setup
- [ ] Install Angular CLI 20 globally
- [ ] Create console-app: `ng new console-app --routing --style=scss`
- [ ] Install dependencies:
  - `maplibre-gl` + `@maplibre/maplibre-gl-geocoder`
  - `@angular/material` + `@angular/cdk`
  - `@ngrx/store` + `@ngrx/effects` + `@ngrx/store-devtools`
- [ ] Configure Angular Material theme
- [ ] Set up shared library structure

### Phase 3: Map Integration
- [ ] Install and configure MapLibre GL JS
- [ ] Create map wrapper component in map-widgets library
- [ ] Set up TileServer GL in Docker for local development
- [ ] Integrate OpenMapTiles or custom tile source
- [ ] Create basic map service with markers support

### Phase 4: API Integration
- [ ] Generate TypeScript interfaces from Spring Boot entities
- [ ] Create HTTP client services for backend APIs
- [ ] Set up environment configurations (dev, staging, prod)
- [ ] Implement authentication guards and JWT handling
- [ ] Connect to backend actuator endpoints for health checks

### Phase 5: State Management
- [ ] Set up NgRx store structure
- [ ] Create feature stores for:
  - Authentication state
  - Map state (bounds, markers, selected features)
  - Fleet data (vehicles, drivers, routes)
  - Real-time updates (WebSocket integration)

## Development Commands
```bash
# Backend only
npm run dev:backend
./gradlew bootRun --args='--server.port=8081'

# Frontend only  
npm run dev:frontend
ng serve --port 4200

# Full stack
npm run dev:all
concurrently "npm run dev:backend" "npm run dev:frontend"

# Build
npm run build:all
npm run build:frontend && npm run build:backend

# Test
npm run test:all
npm run test:frontend && npm run test:backend
```

## Integration Points
1. **API Communication**: Angular HTTP client → Spring Boot REST endpoints
2. **Authentication**: Angular guards → Spring Security JWT
3. **Real-time Data**: WebSocket → Spring Boot WebSocket endpoints
4. **Spatial Data**: MapLibre GL JS → PostGIS spatial queries
5. **Development**: Docker Compose orchestration for full stack

## Next Immediate Steps
1. **Setup Node.js 20+ via nvm**
2. **Install Angular CLI 20 globally**
3. **Create monorepo package.json structure**
4. **Initialize Angular workspace**
5. **Configure MapLibre GL JS integration**
6. **Connect to Spring Boot backend APIs**

## Success Criteria
- [ ] Angular 20 console-app running on http://localhost:4200
- [ ] Spring Boot backend running on http://localhost:8081
- [ ] MapLibre map rendering with basic controls
- [ ] API communication between frontend and backend
- [ ] Authentication flow working end-to-end
- [ ] Live markers displaying on map from backend data
- [ ] Docker Compose orchestrating both services

## Architecture Benefits
✅ **Monorepo**: Shared types, unified CI/CD, coordinated releases  
✅ **Modern Stack**: Angular 20 Signals, Spring Boot 3.3.5, Java 21  
✅ **Spatial**: MapLibre + PostGIS for fleet management  
✅ **Scalable**: Modular monolith → microservices migration path  
✅ **Cross-platform**: Windows, Linux, macOS development support
