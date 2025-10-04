# Copilot Instructions — FleetOps Management System Implementation
Purpose
-------
Implement comprehensive Pickup and Order Management systems with database integration, providing consistent and professional user experience for managing logistics operations across the FleetOps platform.

Spec-Driven Development Extension
---------------------------------
We are adopting GitHub Spec Kit (Specify CLI). See `.github/SPEC-KIT-ADOPTION-PLAN.md` for rollout phases. For any new substantial feature:
- Create spec & plan under `specs/<NNN-feature>/` using `/specify`, `/clarify` (if needed), `/plan`, `/tasks`.
- Keep tasks failing-first for contract/integration tests before implementation.
- Contracts (`contracts/`) and data model (`data-model.md`) are authoritative; update them before changing code.
- Refer to path-specific instructions in `.github/instructions/specs.instructions.md` for rules & review checklist.

Quick Demo / Current Status
---------------------------
**Pickup Management** ✅ - Fully implemented:
- Pickup Creation: http://localhost:4200/pickups (pickup scheduling component)
- Pickup Management: http://localhost:4200/pickup-list (management dashboard)
- Pickup Analytics: http://localhost:4200/pickup-analytics (analytics dashboard)
- Backend Integration: Complete with PostgreSQL database

**Order Management** 🎯 - Implementation in progress:
- Order Creation: http://localhost:4200/orders (existing order scheduling component)
- Order Management List: http://localhost:4200/order-list (new management dashboard)
- Order Analytics: http://localhost:4200/order-analytics (new analytics dashboard)
- Backend Integration: Planned with comprehensive database schema

Quick run steps (from repo root):
```bash
cd frontend
npm install
ng serve console-app --port 4200

# In separate terminal for backend
cd backend
docker compose -f backend/docker-compose.yml up -d postgres
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
```

Integration Plans Overview
--------------------------

**Pickup Integration Plan** ✅ COMPLETED
Purpose: Connect the Schedule Pickup UI with a persistent backend store and Pickup Management. This document contains data contracts, database schema options (PostgreSQL), REST API definitions, Spring Boot implementation, frontend wiring notes, migration and testing guidance, and rollout steps.

**Order Integration Plan** 🆕 NEW - See ORDER-MANAGEMENT-DATABASE-INTEGRATION-PLAN.md
Purpose: Implement comprehensive Order Management database integration following the same successful patterns established for Pickup Management, including REST APIs, real-time updates, and analytics.

Checklist
---------
- [ ] Define DTOs / contracts (frontend & backend)
- [ ] Add DB migration (Flyway / Liquibase) for pickups table/collection
- [ ] Implement Spring Boot endpoints (create, list, get, update status, delete)
- [ ] Implement service layer + repository + mapping
- [ ] Add real-time notification (SSE/WebSocket) or polling
- [ ] Replace frontend demo store with backend HTTP calls and subscribe to real-time updates
- [ ] Add unit + integration tests and run migrations in CI

Checklist
---------
**Pickup Management** ✅ COMPLETED:
- [x] Define DTOs / contracts (frontend & backend)
- [x] Add DB migration (Flyway) for pickups table
- [x] Implement Spring Boot endpoints (create, list, get, update status, delete)
- [x] Implement service layer + repository + mapping
- [x] Add real-time notification (SSE/WebSocket) or polling
- [x] Replace frontend demo store with backend HTTP calls and subscribe to real-time updates
- [x] Add unit + integration tests and run migrations in CI

**Order Management** 🆕 IN PROGRESS:
- [ ] Define DTOs / contracts (frontend & backend)
- [ ] Add DB migration (Flyway) for orders table/collection
- [ ] Implement Spring Boot endpoints (create, list, get, update status, delete)
- [ ] Implement service layer + repository + mapping
- [ ] Add real-time notification (SSE/WebSocket) or polling
- [ ] Replace frontend demo store with backend HTTP calls and subscribe to real-time updates
- [ ] Add unit + integration tests and run migrations in CI

1) Data Contracts (Both Systems)
--------------------------------

**Pickup Management** ✅ COMPLETED:
- CreatePickupDto (request):
  - clientId (Long) or embedded client fields
  - pickupAddress (String)
  - pickupDate (ISO date yyyy-MM-dd)
  - pickupTime (optional string or time-slot id)
  - pickupType (vendor|direct)
  - itemCount, totalWeight, items description
  - carrierId (optional)
  - assignedStaffId (optional)
  - idempotencyKey (optional header)

- PickupDto (response):
  - id (Long), pickupId (PU000123), status, createdAt, updatedAt
  - clientName, pickupAddress, pickupDate, pickupTime, assignedStaff, estimatedCost

**Order Management** 🆕 NEW:
- CreateOrderDto (request):
  - clientId (Long) or embedded client fields
  - senderName, senderAddress, senderContact, senderEmail
  - receiverName, receiverAddress, receiverContact, receiverPincode, receiverCity
  - itemCount, totalWeight, dimensions (length, width, height)
  - itemDescription, declaredValue
  - serviceType (express|standard|economy)
  - carrierName, carrierId
  - codAmount, specialInstructions
  - idempotencyKey (optional header)

- OrderDto (response):
  - id (Long), orderId (ORD000123), status, createdAt, updatedAt
  - clientName, senderName, receiverName, receiverCity
  - serviceType, carrierName, trackingNumber
  - totalWeight, declaredValue, totalAmount
  - estimatedDeliveryDate, assignedStaffName

2) Database Schema (PostgreSQL)
-------------------------------

**Pickup Management** ✅ COMPLETED:
```sql
CREATE TABLE pickups (
  id BIGSERIAL PRIMARY KEY,
  pickup_id VARCHAR(50) NOT NULL UNIQUE,
  client_id BIGINT,
  client_name VARCHAR(255),
  pickup_address TEXT,
  pickup_type VARCHAR(32),
  pickup_date DATE,
  pickup_time TIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
  assigned_staff_id BIGINT NULL,
  assigned_staff_name VARCHAR(255),
  items_count INT DEFAULT 1,
  total_weight NUMERIC(10,2) DEFAULT 0,
  carrier_id VARCHAR(64),
  estimated_cost NUMERIC(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Order Management** 🆕 NEW (See ORDER-MANAGEMENT-DATABASE-INTEGRATION-PLAN.md):
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE,
  client_id BIGINT,
  client_name VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_address TEXT NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_pincode VARCHAR(10) NOT NULL,
  receiver_city VARCHAR(100) NOT NULL,
  item_count INT DEFAULT 1,
  total_weight DECIMAL(10,2) DEFAULT 0,
  service_type VARCHAR(32) NOT NULL,
  carrier_name VARCHAR(100) NOT NULL,
  tracking_number VARCHAR(100),
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  assigned_staff_id BIGINT,
  assigned_staff_name VARCHAR(255),
  estimated_delivery_date DATE,
  declared_value DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

3) REST API Contracts (v1)
--------------------------

**Pickup Management** ✅ COMPLETED:
- POST /api/v1/pickups - Create pickup
- GET /api/v1/pickups - List pickups with filters & pagination
- GET /api/v1/pickups/{id} - Get single pickup
- PATCH /api/v1/pickups/{id}/status - Update status
- PUT /api/v1/pickups/{id} - Update pickup
- DELETE /api/v1/pickups/{id} - Cancel pickup
- GET /api/v1/pickups/analytics - Return analytics
- GET /api/v1/pickups/stream - SSE for real-time updates

**Order Management** 🆕 NEW:
- POST /api/v1/orders - Create order
- GET /api/v1/orders - List orders with filters & pagination
- GET /api/v1/orders/{id} - Get single order
- PATCH /api/v1/orders/{id}/status - Update status
- PUT /api/v1/orders/{id} - Update order
- DELETE /api/v1/orders/{id} - Cancel order
- GET /api/v1/orders/analytics - Return analytics
- GET /api/v1/orders/stream - SSE for real-time updates

4) Spring Boot Implementation
-----------------------------

**Pickup Management** ✅ COMPLETED:
- Entity: Pickup.java with JPA annotations
- Repository: PickupRepository with custom queries
- Service: PickupService with business logic
- Controller: PickupController with REST endpoints
- DTOs: CreatePickupDto, PickupDto, UpdatePickupStatusDto
- Mapper: PickupMapper using MapStruct
- Real-time: SSE implementation for live updates

**Order Management** 🆕 IN PROGRESS:
- Entity: Order.java with comprehensive fields
- Repository: OrderRepository with analytics queries
- Service: OrderService with order lifecycle management
- Controller: OrderController with all CRUD operations
- DTOs: CreateOrderDto, OrderDto, UpdateOrderStatusDto
- Mapper: OrderMapper for entity-DTO conversion
- Real-time: SSE implementation for order updates

5) Frontend Implementation (Angular)
------------------------------------

**Pickup Management** ✅ COMPLETED:
- PickupService: HTTP client with backend integration
- pickup-list.component.ts: Management dashboard with filters
- pickup.component.ts: Creation form with backend submission
- Real-time updates via SSE subscription
- Material table with pagination, sorting, filtering

**Order Management** 🔄 IN PROGRESS:
- OrderService: HTTP client for backend integration
- order-list.component.ts: Management dashboard (to be created)
- orders.component.ts: Creation form (existing, needs backend integration)
- Real-time updates via SSE subscription (to be implemented)
- Analytics dashboard (to be created)

6) Migration & Testing
----------------------

**Pickup Management** ✅ COMPLETED:
- Flyway migrations: V2__create_pickups.sql, V3__add_assigned_staff_name.sql
- Unit tests for service and controller layers
- Integration tests with TestContainers
- Frontend tests with HttpClientTestingModule

**Order Management** 🆕 PLANNED:
- Flyway migrations: V5__create_orders_table.sql, V6__create_order_status_history.sql
- Unit tests for all layers
- Integration tests with PostgreSQL TestContainers
- Frontend tests for new components and services

7) Development Workflow
-----------------------

Execution guidance and constraints
---------------------------------
- Follow existing conventions in the repo for file locations, naming, and module boundaries. Inspect `frontend/apps/console-app` and `frontend/apps/ui-kit` to mirror patterns.
- Use Angular Material components and Tailwind utilities already present in the project. Respect `tailwind.config.js` colors and theming.
- Do not create or publish external packages. Do not make network requests to external services while implementing tests; mock HTTP responses instead.
- Avoid exposing secrets or changing CI/CD configurations in this change. Keep changes scoped to the pickup management feature.

API and data contract
---------------------
Use the endpoints and TypeScript interfaces listed in `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` as the source of truth for service shapes and query parameters. If an endpoint is missing, create a TODO and implement the frontend assuming the interface; coordinate backend changes via a separate issue/PR.

Development checklist for each PR
-------------------------------
- Branch name follows `feature/pickup-management`.
- Commit messages are small, focused, and reference the issue/plan when applicable.
- Add/modify routes and navigation entries with clear titles and icons.
- Include unit tests for new components and services. Keep tests fast and deterministic.
- Run `npm run build` (or `ng build console-app`) and `npm test` locally; fix errors before PR.

How to validate locally (short)
------------------------------
1. From repo root: install deps (if needed) and start console app dev server:

  cd frontend
  npm install
  ng serve console-app --port 4200

**Execution Guidance and Constraints:**
- Follow existing conventions in the repo for file locations, naming, and module boundaries
- Use Angular Material components and Tailwind utilities already present in the project
- Respect `tailwind.config.js` colors and theming
- Do not create or publish external packages
- Mock HTTP responses in tests instead of making network requests to external services
- Keep changes scoped to pickup/order management features

**API and Data Contract:**
- Use endpoints and TypeScript interfaces in implementation plans as source of truth
- If an endpoint is missing, create a TODO and implement frontend assuming the interface
- Coordinate backend changes via separate issue/PR

**Development Checklist for Each PR:**
- Branch name follows `feature/pickup-management` or `feature/order-management`
- Commit messages are small, focused, and reference the issue/plan when applicable
- Add/modify routes and navigation entries with clear titles and icons
- Include unit tests for new components and services
- Run `npm run build` and `npm test` locally; fix errors before PR

**How to Validate Locally:**

1. Start frontend dev server:
```bash
cd frontend
npm install
ng serve console-app --port 4200
```

2. Start backend (if testing integration):
```bash
cd backend
docker compose -f backend/docker-compose.yml up -d postgres
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
```

3. Run unit tests:
```bash
npm test --workspace=console-app
```

If build or tests fail, iterate locally and fix lint/type issues.

**Documentation References:**
All documentation has been organized in the `/docs` folder:
- **Setup & Installation**: `docs/setup/` - Project setup and configuration
- **Infrastructure**: `docs/infrastructure/` - Docker and deployment guides
- **Implementation Plans**: `docs/implementation/` - Active development roadmaps
- **Completed Features**: `docs/completed/` - Documentation for finished implementations

Key references:
- Pickup Management: `docs/completed/PICKUP-INTEGRATION-PHASE1-COMPLETE.md` (completed implementation)
- Order Management: `docs/implementation/ORDER-MANAGEMENT-DATABASE-INTEGRATION-PLAN.md` (implementation plan)
- Order UI: `docs/completed/MAILIT-STYLE-ORDERS-COMPLETE.md` (frontend design completed)

**Contact / Notes:**
If a missing backend API or schema prevents implementing a feature, add a TODO in the code and open an issue describing the required endpoint and minimal contract.

This file is intentionally concise — use the referenced implementation plans as the authoritative specification for feature details. Implement incrementally: foundation (list + service) → analytics → details/actions → exports/real-time.

Spec Kit References
-------------------
- Adoption Plan: `.github/SPEC-KIT-ADOPTION-PLAN.md`
- Path-Specific Guidance: `.github/instructions/specs.instructions.md`
- Constitution (after initialization): `.specify/memory/constitution.md`

