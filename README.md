# MailIt Postal Project Backend

A comprehensive logistics and postal management system with Angular frontend and Spring Boot backend.

## 🚀 Quick Start

### Frontend Development
```bash
cd frontend
npm install
ng serve console-app --port 4200
```

### Backend Development
```bash
cd backend
docker compose -f backend/docker-compose.yml up -d postgres
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
```

### Full Stack Development
```bash
# Use the provided scripts
./start-dev-fullstack.sh    # Linux/Mac
./start-dev-fullstack.bat   # Windows
```

## 📁 Project Structure

```
├── frontend/           # Angular workspace with console-app and ui-kit
├── backend/            # Spring Boot application
├── scripts/            # Development and deployment scripts
├── docs/               # 📚 Organized project documentation
└── reference-from-client-wireframes/  # Design references
```

## 🎯 Current Features

### ✅ Pickup Management (Complete)
- **Pickup Scheduling**: http://localhost:4200/pickups
- **Pickup Management**: http://localhost:4200/pickup-list  
- **Pickup Analytics**: http://localhost:4200/pickup-analytics
- **Backend Integration**: Full PostgreSQL integration with real-time updates

### 🔄 Order Management (In Progress)
- **Order Creation**: http://localhost:4200/orders
- **Order Management**: http://localhost:4200/order-list (implementing)
- **Order Analytics**: http://localhost:4200/order-analytics (planned)
- **Backend Integration**: Database schema and APIs in development

### 🗺️ Additional Features
- Interactive maps with Google Maps integration
- Real-time notifications and updates
- Comprehensive analytics and reporting
- Mobile-responsive design with Angular Material

## 📚 Documentation

All documentation has been organized in the `/docs` folder:

- **[Setup & Installation](docs/setup/)** - Get started with the project
- **[Infrastructure](docs/infrastructure/)** - Docker and deployment guides  
- **[Implementation Plans](docs/implementation/)** - Active development roadmaps
- **[Completed Features](docs/completed/)** - Documentation for finished features

See [docs/README.md](docs/README.md) for the complete documentation index.

## 🛠️ Tech Stack

**Frontend:**
- Angular 17+ with Material UI
- TypeScript, RxJS, Tailwind CSS
- Google Maps integration
- Real-time updates with SSE

**Backend:**
- Spring Boot 3.x with Java 17+
- PostgreSQL database
- Flyway migrations
- RESTful APIs with real-time SSE

**Infrastructure:**
- Docker & Docker Compose
- GitHub Actions CI/CD
- Multi-environment configuration

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests  
cd backend
./gradlew test
```

## 📈 Development Status

This project follows an iterative development approach with pickup management serving as the foundation for order management implementation. The established patterns and infrastructure are being extended to provide comprehensive logistics management capabilities.

## 🤝 Contributing

1. Check the [implementation plans](docs/implementation/) for current development priorities
2. Follow the established patterns from [completed features](docs/completed/)
3. Review the [setup guide](docs/setup/) for development environment configuration

---

For detailed documentation, see the [docs folder](docs/) which contains organized guides for all aspects of the project.