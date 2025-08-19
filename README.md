# FleetOps Backend - Logistics Management Platform

A comprehensive Spring Boot 3.3.5 backend for logistics and fleet management operations, built with Java 21 and designed as a modular monolith for future microservices extraction.

## Ì∫Ä Features

- **Modern Stack**: Spring Boot 3.3.5 with Java 21
- **Spatial Data**: PostgreSQL + PostGIS for geographical operations
- **Security**: JWT/OAuth2 authentication with Spring Security
- **Job Scheduling**: Quartz scheduler for background tasks
- **Database Migration**: Flyway for version control
- **Testing**: Comprehensive test suite with TestContainers
- **Monitoring**: Spring Actuator for health checks and metrics
- **Containerization**: Docker support with docker-compose

## ÌøóÔ∏è Architecture

### Modular Design
The application is structured as a modular monolith with clear package boundaries:

- **accounts**: User management, organizations, and roles
- **catalog**: Vehicles, drivers, and depot management
- **orders**: Shipment and job management
- **dispatch**: Task assignment and state machines
- **geo**: Geofences, places, and spatial operations
- **routing**: OSRM/Valhalla integration, ETA calculations
- **tracking**: Event logging and telemetry

## Ìª†Ô∏è Technology Stack

- **Framework**: Spring Boot 3.3.5
- **Language**: Java 21 (Amazon Corretto)
- **Build Tool**: Gradle 8.10.2
- **Database**: PostgreSQL + PostGIS
- **Security**: Spring Security with JWT
- **Testing**: JUnit 5, TestContainers, H2
- **Monitoring**: Spring Actuator
- **Spatial**: Hibernate Spatial, JTS
- **Scheduling**: Spring Quartz

## Ì∫¶ Getting Started

### Prerequisites

- Java 21 (managed via SDKMAN)
- Docker and Docker Compose
- PostgreSQL with PostGIS extension

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fleetops-backend
   ```

2. **Install Java 21 via SDKMAN** (if not already installed):
   ```bash
   curl -s "https://get.sdkman.io" | bash
   source ~/.sdkman/bin/sdkman-init.sh
   sdk install java 21.0.8-amzn
   ```

3. **Build the project**:
   ```bash
   ./gradlew build
   ```

4. **Run tests**:
   ```bash
   ./gradlew test
   ```

### Running the Application

#### Option 1: Local Development
```bash
# Start PostgreSQL and PostGIS via Docker
docker-compose up -d db

# Run the application
./gradlew bootRun
```

#### Option 2: Full Docker Environment
```bash
# Start all services
docker-compose up
```

#### Option 3: VS Code Tasks
Use VS Code Command Palette (`Ctrl+Shift+P`) and run:
- `Tasks: Run Task` ‚Üí `FleetOps: Run`
- `Tasks: Run Task` ‚Üí `FleetOps: Build`
- `Tasks: Run Task` ‚Üí `FleetOps: Test`

## Ì∑ÑÔ∏è Database Setup

### Environment Variables
Configure the following environment variables:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleetops_dev
DB_USERNAME=fleetops
DB_PASSWORD=fleetops

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400

# Spring Profiles
SPRING_PROFILES_ACTIVE=dev
```

### Flyway Migrations
Database migrations are automatically applied on startup. Manual migration:

```bash
./gradlew flywayMigrate
```

## Ì¥ß Configuration

### Application Profiles

- **dev**: Development environment with debug logging
- **staging**: Staging environment with moderate logging
- **prod**: Production environment with minimal logging
- **test**: Test environment with H2 in-memory database

### Environment-Specific Properties

Configuration files are located in `src/main/resources/`:
- `application.properties` - Common configuration
- `application-dev.properties` - Development settings
- `application-staging.properties` - Staging settings
- `application-prod.properties` - Production settings

## Ì∑™ Testing

The project includes comprehensive testing:

```bash
# Run all tests
./gradlew test

# Run tests with coverage
./gradlew test jacocoTestReport

# Run integration tests only
./gradlew integrationTest
```

## Ì≥ä Monitoring

Access application health and metrics:

- Health Check: `http://localhost:8080/actuator/health`
- Metrics: `http://localhost:8080/actuator/metrics`
- Info: `http://localhost:8080/actuator/info`

## Ì∞≥ Docker Support

### Development
```bash
# Build image
docker build -t fleetops-backend .

# Run with docker-compose
docker-compose up
```

### Production
```bash
# Multi-stage production build
docker build --target production -t fleetops-backend:prod .
```

## Ìª£Ô∏è Roadmap

### Sprint 1: Foundation ‚úÖ
- [x] Backend scaffold with Spring Boot 3.3.5
- [x] Environment-specific configurations
- [x] Docker support
- [x] Basic security setup
- [x] Database migration framework

### Sprint 2: Core Features (Next)
- [ ] Core entity models (Place, Vehicle, Driver, Task)
- [ ] REST API endpoints for CRUD operations
- [ ] PostGIS spatial queries
- [ ] Basic authentication and authorization

### Sprint 3: Advanced Features
- [ ] OSRM/Valhalla routing integration
- [ ] Real-time tracking and events
- [ ] Job scheduling and background tasks
- [ ] Advanced spatial operations

## Ì¥ù Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Ì≥ù License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Ì∂ò Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

Built with ‚ù§Ô∏è using Spring Boot 3.3.5 and Java 21
