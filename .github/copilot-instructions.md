<!-- FleetOps Logistics Backend - Spring Boot 3.5.x Project Instructions -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created. ✅ Created

- [x] Clarify Project Requirements ✅ Spring Boot 3.3.5 FleetOps logistics backend with Gradle, Java 21, PostgreSQL/PostGIS, modular design

- [x] Scaffold the Project ✅ Complete Spring Boot project structure created with all required starters

- [x] Customize the Project ✅ Added modular package structure, security config, spatial entities, Docker support

- [x] Install Required Extensions ✅ Java extensions already installed

- [x] Compile the Project ✅ Project compiles successfully with Java 21

- [x] Create and Run Task ✅ VS Code tasks created for build, run, test, clean

- [ ] Launch the Project

- [x] Ensure Documentation is Complete ✅ Project setup completed

## Project Details
- Spring Boot 3.3.5 with Java 21 (via SDKMAN)
- Gradle build system with wrapper
- PostgreSQL + PostGIS for spatial data (H2 for testing)
- Modular monolith design (accounts, catalog, orders, dispatch, geo, routing, tracking)
- Environment configs: dev, staging, prod
- Docker support with docker-compose
- JWT/OAuth2 authentication configured
- Flyway migrations for database versioning
- Comprehensive testing setup with TestContainers

## Sprint 1.1 - Backend Scaffold & Environments ✅ COMPLETED
- ✅ Spring Boot 3.3.5 (Java 21) skeleton created
- ✅ Dev, staging, prod profiles configured
- ✅ Dockerfile and docker-compose.yml created
- ✅ Gradle build with all required starters
- ✅ Environment-specific configs via application-{profile}.properties
- ✅ Secrets manageable via environment variables

## Next Steps
1. Set up PostgreSQL database and run migrations
2. Implement core entities and repositories
3. Add REST endpoints for CRUD operations
4. Integrate spatial queries with PostGIS
5. Set up CI/CD pipeline

## Available Commands
- `./gradlew build` - Build the project
- `./gradlew bootRun` - Run the application
- `./gradlew test` - Run tests
- `./gradlew clean` - Clean build artifacts
