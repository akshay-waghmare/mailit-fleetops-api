# 🎯 Priority Roadmap - FleetOps Development

**Project**: MailIt Postal Project - FleetOps Management System  
**Created**: October 6, 2025  
**Last Updated**: November 2, 2025 - Major Progress Update! 🎉  
**Status**: P0 Features 90-95% Complete! Ahead of Schedule!

---

## 🎉 BREAKING NEWS: P0 Features Nearly Complete!

**Date**: November 2, 2025  
**Status**: Delivery Sheet (90% done) + RBAC (95% done) + Agent Login (100% done)

### What We Discovered:
After thorough codebase analysis, we found that **P0 blockers are 90-95% complete**!

✅ **Delivery Sheet Module**: 90% Complete (not 0%)
- Backend: 100% done (DB, entities, services, controllers, agent-scoped queries)
- Frontend: 80% done (components, services, routes, auto-refresh)
- Missing: PDF export, POD photo, close validation (10%)

✅ **RBAC + Auth**: 95% Complete (not 0%)
- Backend: 100% done (JWT, Spring Security, AuthController, @PreAuthorize)
- Frontend: 90% done (login page, auth service, guards)
- Missing: Wire guards to routes (5%)

✅ **Agent-Scoped Access**: 100% Complete
- Agent can login and see ONLY their assigned delivery sheets
- Backend enforces agent scoping at repository level
- Frontend has dedicated `/my-delivery-sheets` route

**Revised Timeline**: 2-3 days to complete (not 2 weeks!)

---

## 📋 Executive Summary (Updated)

### Quick Stats (Updated November 2, 2025)
- **P0 Features**: 90-95% complete (was: Not Started)
- **Client-Requested**: 6 high-priority features
- **Core Infrastructure**: 2 of 4 critical features near complete
- **Timeline**: Now ahead of schedule by 1.5 weeks!

---

## 🚨 P0: BLOCKERS (Must Do First - Q4 2025)

**Goal**: Enable daily delivery operations with user accountability  
**Original Timeline**: 2 weeks (Sprint 1)  
**Actual Status**: 90-95% complete! 🎉  
**Remaining**: 2-3 days to finish

### 1. 🚚 Delivery Sheet (DS) Module - Epic E4
**Priority**: 🔴 P0 Critical  
**Original Effort**: 3-4 weeks  
**Actual Status**: ✅ 90% COMPLETE (Backend 100%, Frontend 80%)

#### What's Already Done ✅
- ✅ Database tables (V14__create_delivery_sheets_table.sql)
- ✅ DeliverySheet + DeliverySheetOrder entities
- ✅ DeliverySheetRepository with agent-scoped queries
- ✅ DeliverySheetService with full CRUD
- ✅ DeliverySheetController with @PreAuthorize
- ✅ GET /api/v1/delivery-sheets/my endpoint
- ✅ Frontend components (delivery-sheets, my-delivery-sheets)
- ✅ Auto-refresh every 30 seconds
- ✅ Material table with status chips
- ✅ Create/edit modal

#### Remaining Tasks (10% - 1-2 days):
- [ ] PDF export (iText library + endpoint) - 4 hours
- [ ] POD photo upload stub - 3 hours
- [ ] Close DS validation (all items terminal) - 2 hours
- [ ] E2E testing - 2 hours

**Files Implemented**:
- Backend: `DeliverySheet.java`, `DeliverySheetRepository.java`, `DeliverySheetService.java`, `DeliverySheetController.java`
- Frontend: `delivery-sheets.component.ts`, `my-delivery-sheets.component.ts`, `delivery-sheet.service.ts`

---

### 2. 👥 Minimal RBAC (User Management) - Epic E10 Slim Slice
**Priority**: 🔴 P0 Critical  
**Original Effort**: 4-5 weeks  
**Actual Status**: ✅ 95% COMPLETE (Backend 100%, Frontend 90%)

#### What's Already Done ✅
- ✅ Database tables (V12__create_rbac_tables.sql)
- ✅ Default admin user (V13__add_default_admin.sql)
- ✅ User, Role, UserRole entities with @ManyToMany
- ✅ UserRepository, RoleRepository
- ✅ UserService with CRUD + role assignment
- ✅ UserController with @PreAuthorize("hasRole('ADMIN')")
- ✅ AuthController with login + refresh endpoints
- ✅ JWT: JwtService + JwtAuthenticationFilter
- ✅ Spring Security configuration
- ✅ Login component (430 lines!)
- ✅ Auth service (289 lines with BehaviorSubject)
- ✅ Auth guards (authGuard, roleGuard, adminGuard, staffGuard)
- ✅ Role checking methods (hasRole, hasAnyRole, isAdmin)

#### Remaining Tasks (5% - 3-4 hours):
- [ ] Wire authGuard to routes in app.routes.ts - 30 mins
- [ ] Wire roleGuard with data: { roles } - 30 mins
- [ ] Add role-based menu visibility - 1 hour
- [ ] Test E2E: admin vs agent access - 1 hour
- [ ] Password reset flow (optional) - 2 hours

**Files Implemented**:
- Backend: `User.java`, `Role.java`, `AuthController.java`, `JwtService.java`, `JwtAuthenticationFilter.java`
- Frontend: `login.component.ts`, `auth.service.ts`, `auth.guard.ts`, `auth.model.ts`
  - Printable format with branding
  - Barcode/QR codes

#### First Tasks (Sprint 1):
1. **Database Layer** (Day 1-2)
   ```sql
   -- Tables needed:
   CREATE TABLE delivery_sheet (
     id BIGSERIAL PRIMARY KEY,
     ds_id VARCHAR(50) UNIQUE NOT NULL, -- DS000001
     branch_id BIGINT,
     assigned_agent_id BIGINT NOT NULL,
     status VARCHAR(32) NOT NULL, -- OPEN, IN_PROGRESS, CLOSED
     created_at TIMESTAMP,
     closed_at TIMESTAMP,
     metadata JSONB
   );
   
   CREATE TABLE delivery_sheet_item (
     id BIGSERIAL PRIMARY KEY,
     delivery_sheet_id BIGINT REFERENCES delivery_sheet(id),
     booking_id BIGINT NOT NULL, -- FK to orders table
     item_status VARCHAR(32), -- PENDING, DELIVERED, FAILED, RTO
     pod_type VARCHAR(32), -- OTP, SIGNATURE, PHOTO
     pod_data TEXT,
     delivered_at TIMESTAMP,
     failure_reason TEXT,
     cod_collected DECIMAL(12,2)
   );
   
   CREATE TABLE pod_document (
     id BIGSERIAL PRIMARY KEY,
     delivery_sheet_item_id BIGINT,
     document_type VARCHAR(32), -- SIGNATURE, PHOTO
     file_path TEXT,
     uploaded_at TIMESTAMP
   );
   ```

2. **API Layer** (Day 3-5)
   - `POST /api/v1/delivery-sheets` - Create DS
   - `GET /api/v1/delivery-sheets/{id}` - Get DS details
   - `PATCH /api/v1/delivery-sheets/{id}/items/{itemId}` - Update item status
   - `POST /api/v1/delivery-sheets/{id}/close` - Close DS
   - `GET /api/v1/delivery-sheets/{id}/export` - Export PDF/Excel

3. **Admin UI** (Day 6-8)
   - DS list with filters (status, agent, date)
   - Create DS form (select bookings, assign agent)
   - DS details view (items table, status tracking)
   - Close DS workflow (validate all items)
   - Export button (PDF/Excel download)

4. **Agent UI (Web-First)** (Day 9-10)
   - "My Delivery Sheets" list
   - DS item worklist (scan/search by tracking no.)
   - Update item action (Delivered/Failed/RTO)
   - OTP entry field
   - Photo upload stub (for POD signature/photo)
   - COD amount entry

5. **CI/CD & Storage** (Day 11-12)
   - Flyway migrations
   - E2E smoke test (create → update → close)
   - POD file storage (S3/local filesystem)
   - Folder structure: `/pod/{ds_id}/{item_id}/{timestamp}.jpg`

#### Acceptance Demo:
```
1. Admin creates DS with 5 bookings → assigned to Agent "Rajesh"
2. Agent logs in → sees "My Delivery Sheets"
3. Agent updates 2 items:
   - Item 1: Delivered (OTP: 123456)
   - Item 2: Failed (Reason: "Customer not available")
4. Admin views DS → sees updated statuses
5. Agent completes all items → closes DS
6. Admin exports DS as PDF → printable with barcodes
```

#### Dependencies & Risks:
- **Depends On**: Minimal RBAC (Agent role must exist)
- **Risk**: POD storage policy (size limits, retention, foldering)
- **Risk**: COD reconciliation touches billing later (log COD now, integrate later)
- **Mitigation**: Deliver Agent Web App (PWA) first if mobile app not ready

---

### 2. 👥 Minimal RBAC (User Management) - Epic E10 Slim Slice
**Priority**: 🔴 P0 Critical  
**Effort**: 4-5 weeks  
**Status**: ❌ Not Started

#### Definition of Done (DoD):
- [ ] User entity with authentication
  - Username, email, password (hashed)
  - Active/inactive status
- [ ] Role-based access control
  - Roles: Admin, Staff, Agent
  - Role assignment per user
- [ ] JWT-based authentication
  - Login endpoint (POST /api/v1/auth/login)
  - Token refresh endpoint
  - Token expiration (configurable)
- [ ] Route guards (frontend)
  - Admin-only routes
  - Agent-only routes (My Delivery Sheets)
  - Staff routes
- [ ] DS assignment to agent user
  - Dropdown of agent users in DS creation
  - Agent can only see their own DS

#### First Tasks (Sprint 1):
1. **Database Layer** (Day 1-2)
   ```sql
   CREATE TABLE users (
     id BIGSERIAL PRIMARY KEY,
     username VARCHAR(100) UNIQUE NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     full_name VARCHAR(255),
     phone VARCHAR(20),
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP,
     last_login TIMESTAMP
   );
   
   CREATE TABLE roles (
     id BIGSERIAL PRIMARY KEY,
     name VARCHAR(50) UNIQUE NOT NULL, -- ADMIN, STAFF, AGENT
     description TEXT
   );
   
   CREATE TABLE user_roles (
     user_id BIGINT REFERENCES users(id),
     role_id BIGINT REFERENCES roles(id),
     PRIMARY KEY (user_id, role_id)
   );
   
   -- Seed data
   INSERT INTO roles (name, description) VALUES
     ('ADMIN', 'Administrator with full access'),
     ('STAFF', 'Staff user with operational access'),
     ('AGENT', 'Delivery agent with field access');
   ```

2. **Backend Auth** (Day 3-6)
   - Spring Security configuration
   - JWT token generation/validation
   - Login endpoint (POST /api/v1/auth/login)
   - Token refresh endpoint (POST /api/v1/auth/refresh)
   - Password hashing (BCrypt)
   - User registration endpoint (POST /api/v1/auth/register)

3. **Frontend Auth** (Day 7-9)
   - Login page component
   - JWT token storage (localStorage/sessionStorage)
   - HTTP interceptor (attach token to requests)
   - Route guards (canActivate)
   - Role-based menu visibility

4. **User Management UI** (Day 10-12)
   - User list (admin only)
   - Create/edit user form
   - Role assignment dropdown
   - Password reset functionality
   - User activation/deactivation

#### Acceptance Demo:
```
1. Admin logs in → sees all menu items
2. Admin creates agent user "Rajesh Kumar" (role: AGENT)
3. Admin creates DS → assigns to "Rajesh Kumar"
4. Agent logs in → sees only "My Delivery Sheets"
5. Agent cannot access admin routes (blocked by route guard)
```

#### Quick Wins (Parallel Tasks):
- [ ] Add NDR standard reasons picklist (~2 hours)
  ```typescript
  NDR_REASONS = [
    'Customer not available',
    'Wrong address',
    'Customer refused',
    'Office/shop closed',
    'Delivery rescheduled',
    'Other (specify)'
  ];
  ```
- [ ] DS filters (pincode cluster, vendor, promised date)
- [ ] "Reassign item to another DS" action (ops lifesaver)

---

## 🔥 P1: OPERATIONAL ACCELERATION (Next - Q4 2025 & Q1 2026)

**Goal**: Reduce manual workload for operations teams  
**Timeline**: 8-12 weeks (3 features)  
**Why Now**: Force multipliers for efficiency, client-requested

### 3. 📊 Bulk Delivery Status Upload - CLIENT REQUEST
**Priority**: 🔴 P1 High  
**Effort**: 3-4 weeks  
**Status**: ❌ Not Started  
**Client Priority**: ⭐⭐⭐ High

#### Purpose:
When agents return with paper/WhatsApp updates, ops can bulk-upload outcomes per waybill instead of updating one-by-one.

#### Definition of Done (DoD):
- [ ] CSV/Excel upload template
  - Columns: waybill_number, final_status, remarks, cod_collected, pod_link (optional), ndr_reason
- [ ] Upload validation
  - Waybill exists
  - Valid status transition (state machine)
  - NDR reason required if status = FAILED
- [ ] Dry-run report
  - Preview changes before commit
  - Show warnings/errors per row
- [ ] Idempotent apply
  - Use idempotency key per batch
  - Skip already-processed rows
- [ ] Batch audit trail
  - Track who uploaded, when, what changed
  - Batch history page

#### Implementation Tasks:
1. **Parser + Validator** (Week 1)
   - Reuse `BulkUploadService` pattern from orders
   - Add `BulkDeliveryStatusService`
   - Validate status transitions (e.g., can't go from DELIVERED → PENDING)
   - NDR reason validation

2. **Batch Outcomes** (Week 2)
   - `BulkDeliveryStatusBatch` entity
   - `BulkDeliveryStatusRow` entity (per waybill)
   - Row outcome: SUCCESS, SKIPPED, FAILED
   - Link to `delivery_sheet_item` or `order`

3. **Audit Trail** (Week 2)
   - `delivery_status_history` table
   - Track old_status → new_status with timestamp
   - Track uploaded_by, upload_batch_id

4. **Admin UI** (Week 3)
   - Upload page with drag-and-drop
   - Template download button
   - Preview table (dry-run)
   - Error file download (failed rows)
   - Batch history page with filters

#### Acceptance Demo:
```
1. Agent returns with 50 delivery updates (paper list)
2. Ops downloads bulk status upload template
3. Ops fills Excel: waybill | status | cod_collected | ndr_reason
4. Ops uploads → sees preview (48 success, 2 errors)
5. Ops fixes 2 errors → re-uploads
6. System applies 50 status updates in 5 seconds
7. DS items auto-update to new statuses
```

#### Supported Status Updates:
- OUT_FOR_DELIVERY
- DELIVERED
- FAILED_DELIVERY (NDR)
- RTO_INITIATED
- IN_TRANSIT
- AT_HUB

---

### 4. 📤 Bulk Booking Entry Update - CLIENT REQUEST
**Priority**: 🔴 P1 High  
**Effort**: 3-4 weeks  
**Status**: ❌ Not Started  
**Client Priority**: ⭐⭐⭐ High

#### Purpose:
Clients/ops can fix pre-booking data in bulk (Ref No., Weight, Mode, Vendor) without manually editing each order.

#### Definition of Done (DoD):
- [ ] Upload sheet with bookingKey + fields to update
  - Columns: booking_id, reference_no, weight_kg, delivery_mode, vendor_name
- [ ] Only mutable fields allowed
  - Cannot change status if already DELIVERED
  - Cannot change core fields (sender/receiver address)
- [ ] Per-row validation
  - Booking exists
  - State allows update (not DELIVERED/CANCELLED)
  - Weight > 0, valid delivery mode
- [ ] Change log (audit trail)
  - Track old_value → new_value per field
  - Track updated_by, update_batch_id
- [ ] Preview diff before commit
  - Show "Current vs New" comparison table
  - Allow selective commit (checkbox per row)

#### Implementation Tasks:
1. **Update Rules Service** (Week 1)
   - Define allowed fields per booking status
   - Validate field-level permissions
   - State guard (can't update if DELIVERED)

2. **Bulk Update Service** (Week 2)
   - Separate from `BulkUploadService` (upload = create, update = modify)
   - `BulkBookingUpdateService`
   - Parse Excel with booking_id + update fields
   - Validate each row

3. **Audit Trail** (Week 2)
   - `booking_update_history` table
   - Columns: booking_id, field_name, old_value, new_value, updated_by, updated_at, batch_id

4. **UI: Preview Diff + Commit** (Week 3-4)
   - Upload page (reuse bulk upload UI)
   - Preview table: Booking ID | Field | Old Value | New Value | Status
   - Checkbox to select rows to apply
   - "Commit Changes" button
   - Batch history page

#### Acceptance Demo:
```
1. Client uploads 100 orders via bulk upload (yesterday)
2. Client realizes reference numbers are wrong
3. Ops downloads "Bulk Booking Update" template
4. Ops fills: booking_id | reference_no (corrected values)
5. Ops uploads → sees preview diff
6. System shows: "100 rows, 0 errors, ready to update"
7. Ops clicks "Commit Changes"
8. System updates 100 bookings in 3 seconds
9. Audit trail shows all changes (old vs new)
```

#### Fields to Support (Client Specified):
- ✅ Reference Number (client_reference)
- ✅ Weight (actual_weight_kg)
- ✅ Delivery Mode (express/standard/economy)
- ✅ Vendor Details (carrier_name, carrier_id)
- Additional: special_instructions, declared_value

---

### 5. 📋 Delivery Runsheet - CLIENT REQUEST
**Priority**: 🔴 P1 High (Consider moving from P2)  
**Effort**: 3-4 weeks  
**Status**: ❌ Not Started  
**Client Priority**: ⭐⭐⭐ High

#### Purpose:
Agent-facing route-based delivery document, different from Delivery Sheet (runsheet = field ops, DS = admin reporting).

#### Runsheet vs Delivery Sheet:
| Feature | Runsheet | Delivery Sheet |
|---------|----------|----------------|
| **Audience** | Agent (field) | Admin (office) |
| **View** | Route-based | Batch-based |
| **Features** | Barcode scan, GPS | Status tracking, reporting |
| **Format** | Printable PDF | Excel/PDF report |

#### Definition of Done (DoD):
- [ ] Runsheet generation by route/agent
  - Group orders by pincode cluster
  - Simple route optimization (distance-based)
- [ ] Order grouping by delivery area
  - Pincode-based clustering
  - Sort by proximity (lat/lng)
- [ ] Runsheet PDF export
  - Printable format (A4)
  - Barcode/QR codes per item
  - Agent name, date, route info
- [ ] Barcode/QR codes for scanning
  - QR contains: order_id, tracking_number, receiver_phone
  - Agent can scan to update status
- [ ] Agent assignment workflow
  - Admin assigns route to agent
  - Agent sees runsheet in mobile/web app
- [ ] Runsheet status tracking
  - Track runsheet completion %
  - Items completed / total items
- [ ] COD collection summary on runsheet
  - Total COD to collect: ₹15,000
  - COD collected: ₹12,000
  - Pending: ₹3,000
- [ ] Signature capture integration
  - Sign-off at end of route
  - Timestamp of completion

#### Implementation Tasks:
1. **Runsheet Entity** (Week 1)
   ```sql
   CREATE TABLE delivery_runsheet (
     id BIGSERIAL PRIMARY KEY,
     runsheet_id VARCHAR(50) UNIQUE, -- RUN000001
     agent_id BIGINT NOT NULL,
     route_name VARCHAR(100),
     planned_date DATE,
     status VARCHAR(32), -- PENDING, IN_PROGRESS, COMPLETED
     total_items INT,
     completed_items INT,
     total_cod DECIMAL(12,2),
     collected_cod DECIMAL(12,2),
     created_at TIMESTAMP,
     completed_at TIMESTAMP
   );
   
   CREATE TABLE runsheet_item (
     id BIGSERIAL PRIMARY KEY,
     runsheet_id BIGINT REFERENCES delivery_runsheet(id),
     order_id BIGINT NOT NULL,
     sequence_no INT, -- route order
     item_status VARCHAR(32),
     scanned_at TIMESTAMP
   );
   ```

2. **Route Optimization (Simple)** (Week 1-2)
   - Simple heuristic: sort by pincode → lat/lng distance
   - Use Haversine formula for distance
   - (Later: integrate OSRM for real route optimization)

3. **PDF Generation with Barcodes** (Week 2)
   - Use iText/Apache PDFBox
   - Generate QR code per item (ZXing library)
   - Template: Logo, agent name, date, items table

4. **Agent Mobile UI** (Week 3)
   - "My Runsheets" list
   - Runsheet detail page (items list)
   - Barcode scanner (mobile camera)
   - Update item status on scan
   - COD amount entry per item

5. **Admin UI** (Week 3-4)
   - Create runsheet page (select orders, assign agent, optimize route)
   - Runsheet list with filters
   - Export PDF button
   - Track runsheet progress (% completion)

#### Acceptance Demo:
```
1. Admin creates runsheet for Agent "Rajesh" (25 orders in Sector 15)
2. System optimizes route by proximity
3. Admin exports runsheet PDF → printable with QR codes
4. Agent opens "My Runsheets" on mobile
5. Agent scans QR code → order details appear
6. Agent updates status: Delivered (COD: ₹500)
7. Agent completes all 25 items
8. System shows runsheet status: COMPLETED
9. Admin sees COD summary: ₹12,500 collected
```

---

## ⚡ P2: DAILY EFFICIENCY (Q1 2026)

**Goal**: Optimize what's already working  
**Timeline**: 8-10 weeks (2 features)  
**Why Now**: Management visibility + field productivity boost

### 6. 📊 MIS & NDR Dashboard - Epic E7
**Priority**: 🟠 P2 Medium-High  
**Effort**: 4-5 weeks  
**Status**: ❌ Not Started

#### Purpose:
Visibility for managers; fast feedback loop on operations performance.

#### Definition of Done (DoD):
- [ ] DS summary dashboard
  - Open / In-Progress / Closed counts
  - SLA hit rate (on-time delivery %)
  - Chart: DS completion trend (daily/weekly)
- [ ] NDR reason analysis
  - Top 5 failure reasons
  - NDR rate by agent, by area
  - Chart: NDR trend over time
- [ ] Export functionality
  - CSV/Excel export for all reports
  - Date range filters
  - Agent/area filters

#### Dashboard Widgets:
1. **Delivery Performance** (Card)
   - Total deliveries today: 450
   - Successful: 420 (93%)
   - Failed (NDR): 30 (7%)
   - Pending: 15

2. **NDR Analysis** (Table + Chart)
   - Top NDR Reasons:
     1. Customer not available (40%)
     2. Wrong address (25%)
     3. Customer refused (15%)
     4. Office closed (10%)
     5. Other (10%)

3. **Agent Performance** (Table)
   - Agent Name | Deliveries | Success Rate | Avg Time
   - Rajesh Kumar | 25 | 96% | 18 min
   - Priya Sharma | 22 | 91% | 22 min

4. **DS Status** (Donut Chart)
   - Open: 5
   - In Progress: 12
   - Closed: 138

#### Implementation Tasks:
1. **Aggregation Queries** (Week 1)
   - SQL views for dashboard metrics
   - Cache results (Redis) for performance

2. **Report Service** (Week 2)
   - `MISReportService` with query methods
   - Export service (Apache POI for Excel)

3. **Dashboard UI** (Week 3-4)
   - MIS Dashboard component (Angular)
   - Charts (Chart.js / ng2-charts)
   - Date range picker
   - Export buttons

#### Acceptance Demo:
```
1. Manager opens MIS Dashboard
2. Sees today's delivery stats: 450 total, 93% success
3. Clicks "NDR Analysis" → sees top reasons
4. Filters by agent "Rajesh" → sees his performance
5. Exports NDR report as Excel
6. Shares report with operations team
```

---

### 7. 🔄 RTO Management - Epic E5
**Priority**: 🟠 P2 Medium  
**Effort**: 2-3 weeks  
**Status**: ❌ Not Started

*(See PROJECT-STATUS.md for full implementation details)*

---

## 💰 P3: REVENUE + EXTERNAL READINESS (Q2-Q4 2026)

**Goal**: Monetize operations + scale with external integrations  
**Timeline**: 19-33 weeks (6 features)  
**Why Now**: After internal ops are solid, optimize revenue and scale

### 8. 💰 Billing & Invoicing - Epic E6
**Priority**: 🔴 P3 High (deferred until ops solid)  
**Effort**: 5-6 weeks  
**Status**: ❌ Not Started

*(Depends on accurate DS data and COD reconciliation)*

### 9. 🔗 Carrier/Vendor Integrations - Epic E9
**Priority**: 🟠 P3 Medium-High  
**Effort**: 8-10 weeks  
**Status**: ❌ Not Started

### 10. 💵 Special Rates Update / Manual Entry - CLIENT REQUEST
**Priority**: 🟠 P3 Medium-High  
**Effort**: 4-5 weeks  
**Client Priority**: ⭐⭐ Medium-High

### 11. 🧾 Vendor Bill Check - CLIENT REQUEST
**Priority**: 🟠 P3 Medium-High  
**Effort**: 5-6 weeks  
**Client Priority**: ⭐⭐ Medium-High

### 12. 👷 Manpower Billing Tab - CLIENT REQUEST
**Priority**: 🟡 P3 Medium  
**Effort**: 6-8 weeks  
**Client Priority**: ⭐ Medium

### 13. 📄 Delivery Sheet PDF Export
**Priority**: 🟡 P3 Medium  
**Effort**: 1-2 weeks

*(See PROJECT-STATUS.md for full implementation details of P3 features)*

---

## 📅 Sprint Breakdown: Next 2 Weeks (Sprint 1)

### Sprint Goal:
**Ship operational DS with minimal RBAC**

### Sprint Backlog:

#### 🔴 P0 - Critical Path (Days 1-12)

**Week 1: Days 1-5**
- [ ] **Day 1-2**: Database setup
  - Create `delivery_sheet`, `delivery_sheet_item`, `pod_document` tables
  - Create `users`, `roles`, `user_roles` tables
  - Seed roles (ADMIN, STAFF, AGENT)
  - Run Flyway migrations

- [ ] **Day 3-4**: Backend DS API
  - `DeliverySheet` entity + repository
  - `DeliverySheetService` (create, get, update, close)
  - `DeliverySheetController` (all REST endpoints)
  - Unit tests

- [ ] **Day 5**: Backend Auth API
  - Spring Security configuration
  - JWT token generation/validation
  - Login endpoint + tests

**Week 2: Days 6-12**
- [ ] **Day 6-8**: Admin UI - DS Module
  - DS list component (Angular Material table)
  - Create DS form (select bookings, assign agent)
  - DS details view (items table)
  - Close DS workflow
  - Export button (PDF/Excel stub)

- [ ] **Day 9-10**: Agent UI - Web App
  - Login page
  - "My Delivery Sheets" component
  - DS item worklist
  - Update item action (Delivered/Failed/RTO)
  - OTP entry + photo upload stub
  - COD amount entry

- [ ] **Day 11-12**: CI/CD + Testing
  - Flyway migration scripts
  - E2E smoke test (create → update → close)
  - POD file storage setup (S3 or local)
  - Add NDR reasons picklist (quick win)

### Acceptance Criteria (Sprint Demo):
```
✅ Admin creates DS → assigns to Agent "Rajesh"
✅ Agent logs in → sees DS in "My Delivery Sheets"
✅ Agent updates 2 items:
   - Item 1: Delivered (OTP: 123456)
   - Item 2: Failed (Reason: "Customer not available")
✅ Admin views DS → sees updated statuses
✅ Agent completes all items → closes DS
✅ Admin exports DS as PDF → printable with barcodes
```

---

## 🗺️ Full Roadmap Timeline

### Q4 2025 (October - December)
- **Sprint 1-2 (2 weeks)**: P0 - DS Module + Minimal RBAC
- **Sprint 3-5 (6 weeks)**: P1 - Bulk Delivery Status Upload + Bulk Booking Update
- **Sprint 6-7 (4 weeks)**: P1 - Delivery Runsheet

**Total Q4**: ~12 weeks, **4 features completed**

### Q1 2026 (January - March)
- **Sprint 8-10 (6 weeks)**: P2 - MIS & NDR Dashboard
- **Sprint 11-12 (4 weeks)**: P2 - RTO Management
- **Sprint 13-14 (4 weeks)**: P3 - Special Rates Update (client request)

**Total Q1**: ~14 weeks, **3 features completed**

### Q2 2026 (April - June)
- **Sprint 15-18 (8 weeks)**: P3 - Billing & Invoicing
- **Sprint 19-21 (6 weeks)**: P3 - Vendor Bill Check (client request)
- **Sprint 22-23 (4 weeks)**: P3 - Notification System

**Total Q2**: ~18 weeks, **3 features completed**

### Q3 2026 (July - September)
- **Sprint 24-31 (16 weeks)**: P3 - Carrier Integrations
- **Sprint 32-35 (8 weeks)**: P3 - Manpower Billing Tab (client request)

**Total Q3**: ~24 weeks, **2 features completed**

### Q4 2026 (October - December)
- **Sprint 36-42 (14 weeks)**: Client Self-Service Portal
- **Sprint 43-45 (6 weeks)**: Offline Mode (Mobile PWA)

**Total Q4**: ~20 weeks, **2 features completed**

---

## 📊 Feature Summary by Quarter

| Quarter | Features | Effort | Priority |
|---------|----------|--------|----------|
| **Q4 2025** | DS Module, RBAC, Bulk Status Upload, Bulk Booking Update, Runsheet | 12 weeks | 🔴 P0-P1 |
| **Q1 2026** | MIS Dashboard, RTO, Special Rates | 14 weeks | 🟠 P2-P3 |
| **Q2 2026** | Billing, Vendor Bill Check, Notifications | 18 weeks | 🟠 P3 |
| **Q3 2026** | Carrier Integrations, Manpower Billing | 24 weeks | 🟠 P3 |
| **Q4 2026** | Client Portal, Offline Mode | 20 weeks | 🟡 P3 |

**Total**: 88 weeks (~17 months) for **14 major features**

---

## 🎯 Success Metrics

### Sprint 1 (Week 1-2):
- ✅ DS creation time: < 2 minutes
- ✅ Agent can update 50 items in < 10 minutes
- ✅ DS close workflow: < 1 minute
- ✅ PDF export: < 5 seconds

### Q4 2025 Milestones:
- ✅ 100% of deliveries tracked via DS
- ✅ Bulk status upload reduces manual work by 80%
- ✅ Runsheet adoption: 90% of agents

### Q1 2026 Milestones:
- ✅ MIS dashboard used by 100% of managers
- ✅ NDR rate reduced by 20% (visibility + action)
- ✅ RTO processing time reduced by 50%

---

## 🚨 Critical Dependencies

### Before Starting Sprint 1:
- [ ] PostgreSQL database running (localhost or Docker)
- [ ] Spring Boot backend running
- [ ] Angular frontend running
- [ ] Development environment setup complete

### Before Starting P1 Features:
- [ ] P0 features (DS + RBAC) deployed to staging
- [ ] Agent user accounts created
- [ ] DS workflow tested end-to-end

### Before Starting P3 Features:
- [ ] P0-P2 features deployed to production
- [ ] Accurate DS data for 30+ days
- [ ] COD reconciliation process defined

---

## 📝 Quick Reference: What to Build Next

### This Sprint (Sprint 1):
1. Database tables (DS + Auth)
2. Backend APIs (DS + Auth)
3. Admin UI (DS management)
4. Agent UI (My DS + Update items)
5. CI/CD + E2E tests

### Next Sprint (Sprint 2):
1. DS PDF export with barcodes
2. DS filters (pincode, agent, date)
3. Reassign item to another DS
4. NDR reasons picklist (if not done)

### Next Month (Sprint 3-5):
1. Bulk Delivery Status Upload (Excel template + UI)
2. Bulk Booking Entry Update (Excel template + preview diff)

---

## 🤝 Team Recommendations

### Sprint 1 Team:
- **1 Full-stack Developer** (Backend + Frontend)
- **1 UI/UX Designer** (DS PDF template + Agent UI wireframes)
- **1 QA Engineer** (E2E testing)

### Sprint 3-5 Team:
- **1 Backend Developer** (Bulk upload services)
- **1 Frontend Developer** (Bulk upload UI)
- **1 DevOps Engineer** (File storage + CI/CD)

---

## 📌 Client-Requested Features Summary

The following features were specifically requested by the client via email and should be prioritized:

| Feature | Priority | Phase | Estimated Effort | Business Impact |
|---------|----------|-------|------------------|-----------------|
| **Bulk Booking Entry Update** | 🔴 High | Q1 2026 | 3-4 weeks | Operational corrections |
| **Bulk Delivery Status Upload** | 🔴 High | Q4 2025 | 3-4 weeks | Delivery efficiency |
| **Delivery Runsheet** | 🔴 High | Q4 2025 | 3-4 weeks | Field operations |
| **Special Rates Update** | 🟠 Medium-High | Q1 2026 | 4-5 weeks | Revenue management |
| **Vendor Bill Check** | 🟠 Medium-High | Q2 2026 | 5-6 weeks | Cost control |
| **Manpower Billing Tab** | 🟡 Medium | Q3 2026 | 6-8 weeks | HR/Payroll |

**Total Client Features**: 6 features | **Total Effort**: 24-32 weeks

**Note**: ✅ Bulk Booking Upload is already completed (October 2025)

---

## 📞 Contact & Review

**Document Owner**: FleetOps Development Team  
**Last Reviewed**: October 6, 2025  
**Next Review**: November 1, 2025  

**Questions?** See:
- Full feature details: `/docs/planning/PROJECT-STATUS.md`
- Implementation plans: `/docs/implementation/`
- Completed features: `/docs/completed/`

---

**Let's ship Sprint 1! 🚀**
