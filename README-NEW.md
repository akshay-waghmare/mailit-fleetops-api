# FleetOps - Fleet Operations Management System

A modern, full-stack fleet operations management system built with **Spring Boot 3.3.5** backend and **Angular 20** frontend.

## 🏗️ Architecture

```
fleetops-monorepo/
├── backend/                    # Spring Boot 3.3.5 + PostgreSQL/PostGIS
│   ├── src/main/java/         # Java application code
│   ├── build.gradle           # Gradle build configuration
│   └── docker-compose.yml     # Database services
├── frontend/                   # Angular 20 workspace
│   ├── apps/
│   │   └── console-app/       # Main Angular application
│   ├── libs/                  # Shared libraries
│   │   ├── shared/           # Common types and services
│   │   ├── map-widgets/      # MapLibre GL JS components
│   │   ├── ui-kit/           # Reusable UI components
│   │   └── state-management/ # NgRx store modules
│   └── angular.json          # Angular workspace configuration
├── package.json              # Root monorepo configuration
└── start-dev-fullstack.*     # Development startup scripts
```

## 🚀 Quick Start

### Prerequisites

- **Java 21** (Amazon Corretto via SDKMAN)
- **Node.js 20.19+** and **npm 10+**
- **Docker & Docker Compose**
- **Angular CLI 20** (`npm install -g @angular/cli@20`)

### 🔧 Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fleetops-monorepo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm run install:all
   ```

3. **Start all services:**
   ```bash
   # Windows
   start-dev-fullstack.bat
   
   # Linux/MacOS
   ./start-dev-fullstack.sh
   ```

4. **Access the applications:**
   - 🖥️ **Frontend Console:** http://localhost:4200
   - 🔧 **Backend API:** http://localhost:8081
   - 📊 **Database:** PostgreSQL on localhost:5432

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.3.5** with Java 21
- **PostgreSQL 15.4** with **PostGIS** for spatial data
- **Hibernate Spatial** for geospatial operations
- **Flyway** for database migrations
- **Docker Compose** for development environment

### Frontend
- **Angular 20** with standalone components
- **MapLibre GL JS** for interactive mapping
- **SCSS** for styling
- **Server-Side Rendering (SSR)** enabled
- **TypeScript 5.9** with strict mode

### Development Tools
- **Gradle 8.10.2** for backend builds
- **npm workspaces** for monorepo management
- **Angular CLI 20** for frontend development
- **Docker** for containerized services

## 📱 Features

### Current
- ✅ Spring Boot backend with PostgreSQL/PostGIS
- ✅ Angular frontend with MapLibre GL mapping
- ✅ Monorepo structure with npm workspaces
- ✅ Docker development environment
- ✅ Cross-platform development scripts

### Planned
- 🔄 Organization management
- 🔄 Fleet tracking and geofencing
- 🔄 Real-time location updates
- 🔄 Route optimization
- 🔄 Reporting and analytics

## 🧩 Development Commands

### Root Level
```bash
npm run dev:all          # Start both backend and frontend
npm run build:all        # Build both applications
npm run test:all         # Run all tests
npm run clean:all        # Clean all build artifacts
```

### Backend Only
```bash
cd backend
./gradlew bootRun        # Start Spring Boot application
./gradlew test           # Run backend tests
./gradlew build          # Build backend application
```

### Frontend Only
```bash
cd frontend/apps/console-app
ng serve                 # Start development server
ng build                 # Build for production
ng test                  # Run unit tests
```

## 📊 Database Schema

The application uses PostgreSQL with PostGIS extension for spatial operations:

- **Organizations:** Fleet management companies
- **Places:** Geographic points of interest
- **Geofences:** Geographic boundaries for alerts
- **Spatial Support:** Full PostGIS integration for location-based queries

## 🎯 API Endpoints

- `GET /api/organizations` - List organizations
- `GET /api/places` - List places with spatial queries
- `GET /api/geofences` - List geofences
- `GET /actuator/health` - Application health check

## 🔧 Configuration

### Environment Variables
- `POSTGRES_DB=fleetops_db`
- `POSTGRES_USER=fleetops_user` 
- `POSTGRES_PASSWORD=fleetops_password`
- `SERVER_PORT=8081`
- `FRONTEND_PORT=4200`

### Development Profiles
- **Backend:** `application-dev.properties`
- **Frontend:** Angular development configuration
- **Database:** Docker Compose with init scripts

## 📚 Documentation

- [Development Guide](DEVELOPMENT.md) - Detailed setup instructions
- [Database Schema](DATABASE.md) - Database design and migrations
- [API Documentation](http://localhost:8081/swagger-ui.html) - Interactive API docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.