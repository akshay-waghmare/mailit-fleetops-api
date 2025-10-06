Pickup Integration Plan

Purpose
-------
Provide a concise, actionable plan to connect the Schedule Pickup UI with a persistent backend store and Pickup Management. This document contains data contracts, database schema options (MySQL & MongoDB), REST API definitions, Spring Boot implementation sketches, frontend wiring notes, migration and testing guidance, and rollout steps.

Checklist
---------
- [ ] Define DTOs / contracts (frontend & backend)
- [ ] Add DB migration (Flyway / Liquibase) for pickups table/collection
- [ ] Implement Spring Boot endpoints (create, list, get, update status, delete)
- [ ] Implement service layer + repository + mapping
- [ ] Add real-time notification (SSE/WebSocket) or polling
- [ ] Replace frontend demo store with backend HTTP calls and subscribe to real-time updates
- [ ] Add unit + integration tests and run migrations in CI

1) Minimal data contracts
-------------------------
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

2) Database schema options
--------------------------

A. PostgreSQL (recommended for relational queries)

-- pickups table (essential columns)
-- PostgreSQL variant with JSONB for flexible fields and timezone-aware timestamps
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
	items_count INT DEFAULT 1,
	total_weight NUMERIC(10,2) DEFAULT 0,
	carrier_id VARCHAR(64),
	estimated_cost NUMERIC(10,2),
	metadata JSONB DEFAULT '{}'::jsonb, -- optional free-form data
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Postgres does not support ON UPDATE for columns; consider a trigger to set updated_at on UPDATE.
CREATE INDEX idx_pickups_date ON pickups(pickup_date);
CREATE INDEX idx_pickups_status ON pickups(status);

-- Optional GIN index for text search across important fields
CREATE INDEX idx_pickups_search ON pickups USING GIN (to_tsvector('english', coalesce(client_name,'') || ' ' || coalesce(pickup_address,'')));

Notes: consider a `pickup_status_history` table for audit and a `clients` table for normalized client data.

B. MongoDB (document model)

Example document:
{
	_id: ObjectId(...),
	pickupId: 'PU000123',
	client: { id:'c1', name:'Acme', contact:'', address:'' },
	pickupAddress: '123 Main St',
	pickupType: 'vendor',
	pickupDate: ISODate('2025-08-25T00:00:00Z'),
	pickupTime: '10:30',
	status: 'scheduled',
	assignedStaff: { id:'s1', name:'Raj' },
	items: [{desc:'Box', count:2, weight:5}],
	estimatedCost: 100,
	createdAt: ISODate(...),
	updatedAt: ISODate(...)
}

Indexes: { pickupDate:1 }, { status:1 }, { pickupId:1 unique }, text index on client.name/address.

3) REST API (v1) — contract
--------------------------------
- POST /api/v1/pickups
	- Create pickup; request CreatePickupDto; returns 201 + PickupDto. Accepts Idempotency-Key header.

- GET /api/v1/pickups
	- List pickups with filters & pagination: page, size, sort, q, pickupDate, status, clientId, staffId
	- Response: Page<PickupDto>

- GET /api/v1/pickups/{id}
	- Get single pickup

- PATCH /api/v1/pickups/{id}/status
	- Update status (body: { status: 'in-progress'|'completed'|'cancelled' })

- PUT /api/v1/pickups/{id}
	- Replace/update pickup (admin)

- DELETE /api/v1/pickups/{id}
	- Soft-delete/cancel

- GET /api/v1/pickups/analytics
	- Return counts/trends (today, weekly)

- Real-time: SSE / WebSocket endpoint (`/api/v1/pickups/stream`) to push events for created/updated pickups.

4) Spring Boot implementation sketch
-----------------------------------

- Migration: add Flyway script V1__create_pickups.sql for pickups table and indexes.

-- Entity (JPA) example (PostgreSQL):
	@Entity class Pickup { Long id; String pickupId; Long clientId; String clientName; String pickupAddress; LocalDate pickupDate; LocalTime pickupTime; String status; Long assignedStaffId; Integer itemsCount; BigDecimal totalWeight; BigDecimal estimatedCost; Instant createdAt; Instant updatedAt; }

- Repository:
	interface PickupRepository extends JpaRepository<Pickup,Long>, JpaSpecificationExecutor<Pickup> { Optional<Pickup> findByPickupId(String pickupId); }

- Service responsibilities:
	- createPickup(CreatePickupDto, Optional<String> idempotencyKey)
		- validate client/staff, generate pickupId (PU + sequence), persist, publish event
	- searchPickups(filters, Pageable) using Specifications or QueryDSL
	- updateStatus(id, status)

- Controller (REST): map endpoints above; on create, return 201 Created with Location header.

- Real-time push:
	- Option A: SSE — maintain SseEmitters and push on create/update.
	- Option B: WebSocket + STOMP for UI subscriptions.
	- Option C: Publish domain events to message bus (Kafka) and subscribe in UI gateway.

5) Frontend changes (Angular)
-----------------------------

- PickupService (`frontend/libs/shared/pickup.service.ts`):
	- Replace demo `createPickup()` implementation with an HTTP POST to `/api/v1/pickups`.
	- Implement `getPickups()` to call backend with paging params and map response.
	- Subscribe to SSE/WebSocket stream and call `pickupsUpdatedSubject.next(...)` when events arrive.

- Schedule UI (`pickup.component.ts`):
	- Send CreatePickupDto to `pickupService.createPickup(dto)`.
	- On success: show snackbar, navigate to `/pickup-list?highlight=<id>`.

- Pickup List (`pickup-list.component.ts`):
	- Use server pagination (page/size) and apply filters via query params.
	- Subscribe to real-time events and update table rows.

- Auth: attach Bearer token from auth store to HTTP calls.

6) Migration & dev seed
-----------------------
- Flyway migration example (V1__create_pickups.sql) included in repo `backend/src/main/resources/db/migration/`.
- Dev seed: add SQL inserts or a Spring CommandLineRunner (profile=dev) to create sample pickups.

7) Example SQL snippets
-----------------------
- Insert:
	INSERT INTO pickups (pickup_id, client_id, client_name, pickup_address, pickup_type, pickup_date, pickup_time, status, items_count, total_weight, estimated_cost) VALUES ('PU000123', 12, 'Acme', '123 Main', 'vendor', '2025-08-25', '10:30:00', 'scheduled', 2, 12.5, 150.0);

- Select by date + status + pagination:
	SELECT * FROM pickups WHERE pickup_date = '2025-08-25' AND status = 'scheduled' ORDER BY created_at DESC LIMIT 20 OFFSET 0;

8) Example Mongo queries (if using MongoDB)
-----------------------------------------
- Insert document: db.pickups.insertOne({...})
- Find by date & status: db.pickups.find({ pickupDate: ISODate('2025-08-25'), status: 'scheduled' }).sort({ createdAt:-1 }).limit(20)

9) Tests
--------
- Backend
	- Unit tests for `PickupService.createPickup()` (happy path + validation errors)
	- Integration tests using Testcontainers/MySQL or H2 with Flyway migrations applied
	- SSE/WebSocket integration test (if implemented)

- Frontend
	- Unit tests for `pickup.component` (mock service, assert snackbar/navigation)
	- Service tests using `HttpClientTestingModule` for `pickup.service`

10) Edge cases & operational notes
---------------------------------
- Timezones: store timestamps in UTC; use DATE for scheduled day and TIME or time-slot id for slot.
- Idempotency: accept `Idempotency-Key` header on create to avoid duplicate records on retry.
- Concurrency: use DB-level checks/locks or optimistic checks when assigning staff/time-slot.
- Soft deletes: set status='cancelled' instead of hard delete.
- Pagination: prefer cursor-based pagination for large datasets, otherwise return Page with totalElements.
- Security: validate authorization for create/edit/cancel.

11) Rollout plan
----------------
- Phase A (backend): add migration + implement create/list endpoints + unit tests; deploy to staging.
- Phase B (realtime): add SSE/WebSocket and event publisher; deploy to staging.
- Phase C (frontend): switch `pickup.service` to call backend endpoints behind feature flag; test flows.
- Phase D: QA and production rollout; monitor errors and duplicates; rollback plan ready.

12) Next concrete artifacts I can generate for you
-------------------------------------------------
- Flyway SQL migration file (MySQL) ready-to-apply.
- Spring Boot Java stubs: Entity, Repository, Service, Controller, DTOs, MapStruct mapper.
- Angular changes: updated `pickup.service.ts` HTTP methods and SSE subscription, updated `pickup.component.ts` wiring.

Tell me which artifact you want me to generate first (Flyway migration, Spring Boot stubs, or frontend wiring) and I will create the files and run quick validations.

