# FleetOps Development Guide

This guide helps developers set up and run the FleetOps backend on different platforms and IDEs.

## 🔧 Prerequisites

### All Platforms
- **Docker & Docker Compose** - For PostgreSQL/PostGIS database
- **Git** - Version control

### Java Development Kit
Choose one of the following options:

#### Option 1: SDKMAN (Recommended - Cross Platform)
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh

# Install Java 21
sdk install java 21.0.8-amzn
sdk use java 21.0.8-amzn
```

#### Option 2: Manual Installation
- **Windows**: Download Amazon Corretto 21 from [Amazon Corretto](https://aws.amazon.com/corretto/)
- **macOS**: `brew install --cask corretto21` or download from Amazon
- **Linux**: Use package manager or download from Amazon

## 🖥️ Platform-Specific Setup

### Windows
```cmd
# Check Java version
java -version

# Clone repository
git clone <repository-url>
cd fleetops-backend

# Run development script
./start-dev.sh
```

### macOS
```bash
# Install dependencies via Homebrew (optional)
brew install docker docker-compose git

# Clone and run
git clone <repository-url>
cd fleetops-backend
chmod +x gradlew start-dev.sh
./start-dev.sh
```

### Linux (Ubuntu/Debian)
```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose git

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Clone and run
git clone <repository-url>
cd fleetops-backend
chmod +x gradlew start-dev.sh
./start-dev.sh
```

## 🛠️ IDE Configuration

### Visual Studio Code
1. Install recommended extensions:
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - Docker
   - GitLens

2. Open project folder in VS Code
3. Use Command Palette (Ctrl+Shift+P):
   - `Tasks: Run Task` → `FleetOps: Run`
   - `Tasks: Run Task` → `FleetOps: Build`
   - `Tasks: Run Task` → `FleetOps: Test`

### IntelliJ IDEA
1. Open project as Gradle project
2. Configure Project SDK to Java 21
3. Enable annotation processing for Lombok
4. Run configurations are auto-detected
5. Use the "Run" button or `Shift+F10`

### Eclipse
1. Import as "Existing Gradle Project"
2. Install Lombok plugin: [projectlombok.org](https://projectlombok.org/setup/eclipse)
3. Configure Java Build Path to use Java 21
4. Right-click project → Run As → Spring Boot App

## 🐳 Docker Development

### Quick Start
```bash
# Start database only
docker-compose up -d postgres

# Start full environment
docker-compose up

# Stop services
docker-compose down

# Clean restart (removes volumes)
docker-compose down -v && docker-compose up
```

### Database Access
- **Host**: localhost
- **Port**: 5432
- **Database**: fleetops_dev
- **Username**: fleetops
- **Password**: fleetops

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
./gradlew test

# Run tests with coverage
./gradlew test jacocoTestReport

# Run specific test class
./gradlew test --tests "com.fleetops.FleetOpsApplicationTests"
```

### Integration Tests
```bash
# Run integration tests (uses TestContainers)
./gradlew integrationTest
```

## 📊 Monitoring

Once the application is running, access:
- **Health Check**: http://localhost:8081/actuator/health
- **Application Info**: http://localhost:8081/actuator/info
- **Metrics**: http://localhost:8081/actuator/metrics
- **All Endpoints**: http://localhost:8081/actuator

## 🔧 Build Commands

### Gradle
```bash
# Clean build
./gradlew clean build

# Run application
./gradlew bootRun

# Run with specific port
./gradlew bootRun --args='--server.port=8082'

# Create JAR
./gradlew bootJar

# Run Flyway migrations
./gradlew flywayMigrate
```

### Docker
```bash
# Build image
docker build -t fleetops-backend .

# Run image
docker run -p 8080:8080 fleetops-backend

# Production build
docker build --target production -t fleetops-backend:prod .
```

## 🌍 Environment Profiles

### Development (default)
- Uses PostgreSQL database
- Debug logging enabled
- Hot reload with Spring DevTools
- H2 console disabled

### Testing
- Uses H2 in-memory database
- Faster startup
- Test-specific configurations

### Staging
- Production-like settings
- Moderate logging
- External database required

### Production
- Minimal logging
- Security hardened
- External database required
- JVM optimized

### Switching Profiles
```bash
# Via command line
./gradlew bootRun --args='--spring.profiles.active=staging'

# Via environment variable
export SPRING_PROFILES_ACTIVE=staging
./gradlew bootRun

# Via IDE
-Dspring.profiles.active=staging
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8080/8081
netstat -an | findstr :8080  # Windows
lsof -i :8080               # macOS/Linux

# Kill process (replace PID)
taskkill /PID <PID> /F      # Windows
kill -9 <PID>               # macOS/Linux
```

#### Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Restart Docker Desktop (Windows/macOS)
# Restart Docker service (Linux)
sudo systemctl restart docker
```

#### Database Connection Issues
```bash
# Check PostgreSQL container
docker-compose ps
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Java Version Issues
```bash
# Check Java version
java -version
javac -version

# With SDKMAN
sdk current java
sdk list java
sdk use java 21.0.8-amzn
```

### Performance Tips

#### Windows Developers
- Use WSL2 for better Docker performance
- Exclude project folder from Windows Defender
- Use Git Bash or PowerShell

#### macOS Developers
- Allocate sufficient memory to Docker Desktop
- Use Homebrew for package management

#### Linux Developers
- Ensure user is in docker group
- Use systemctl for service management

## 📝 Development Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Start development environment**
   ```bash
   ./start-dev.sh
   ```

3. **Make changes and test**
   ```bash
   ./gradlew test
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature-branch
   ```

5. **Create Pull Request**

## 🎯 Next Steps

After successful setup:
1. Explore the codebase structure
2. Review the API documentation
3. Set up your IDE debugging
4. Run the test suite
5. Start implementing features

For questions or issues, check the project's issue tracker or contact the development team.