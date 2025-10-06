
# Implementation Plan: Minimal RBAC (User Management) — Epic E10

**Branch**: `013-minimal-rbac-user` | **Date**: October 6, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-minimal-rbac-user/spec.md`
**Testing Strategy**: Minimal tests for speed of implementation (per user request)

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Implement minimal role-based access control (RBAC) with three fixed roles (ADMIN, STAFF, AGENT) to enable secure, authenticated access to the FleetOps system and unblock the Delivery Sheet Module (Epic E4).

**Technical Approach**:
- **Backend**: Spring Security + JWT (access + refresh tokens) with BCrypt password hashing
- **Database**: PostgreSQL with Flyway migrations for users, roles, user_roles tables
- **Frontend**: Angular login page, HTTP interceptor, route guards (canActivate), role-based menu visibility
- **Integration**: Agent dropdown in DS creation; agent-scoped DS queries
- **Testing**: Minimal contract tests + smoke integration tests for fast implementation

## Technical Context
**Language/Version**: Java 17 (Spring Boot 3.x), TypeScript 5.x (Angular 18)  
**Primary Dependencies**: 
- Backend: Spring Security 6.x, jjwt (JWT), BCrypt, Spring Data JPA, Flyway
- Frontend: Angular Material 18, Angular Router guards, HttpClient interceptors
**Storage**: PostgreSQL 15+ (existing)  
**Testing**: JUnit 5 + Mockito (backend), Jasmine + Karma (frontend) - MINIMAL test coverage for speed  
**Target Platform**: Web application (Linux server + browser)  
**Project Type**: Web (frontend + backend)  
**Performance Goals**: 
- Login endpoint: <500ms p95
- Token validation: <10ms per request
- User creation: <2 minutes (manual process)  
**Constraints**: 
- No external identity providers (SSO/OAuth)
- No password recovery emails (admin resets manually)
- No MFA in this phase
- Token storage: localStorage (XSS mitigation required)
- HTTPS required in production  
**Scale/Scope**: 
- < 1,000 users expected
- 3 fixed roles (no dynamic role creation)
- Single deployment instance (no multi-tenancy)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **I. Spec Before Code**: spec.md completed and committed (729 lines, comprehensive)  
✅ **II. Plan & Tasks Discipline**: plan.md in progress; tasks.md will follow via `/tasks`  
⚠️ **III. Test-First & Red-Green Integrity**: **WAIVED** - User requested minimal tests for speed  
  - **Justification**: P0 blocker needs fast delivery; comprehensive tests deferred to post-launch hardening  
  - **Minimal Coverage**: Contract tests for login/create-user endpoints + 1 smoke E2E test  
✅ **IV. Contracts Are Source of Truth**: api-contracts.md already exists (500+ lines)  
✅ **V. Simplicity & Iterative Delivery**: Minimal viable RBAC (3 roles, no MFA, no SSO)  
✅ **VI. Observability & Traceability**: Spring Boot default logging + login/user-creation events  
✅ **VII. Consistency Across Frontend & Backend**: Shared DTO field names in contracts

### Technology Stack Compliance

✅ **Backend**: Spring Boot + Flyway + PostgreSQL (per constitution)  
✅ **Frontend**: Angular + Angular Material + Tailwind (per constitution)  
✅ **Real-time**: Not applicable for RBAC (no real-time requirements)  

### Performance & Reliability Compliance

✅ **API latency**: Login <500ms p95 (standard web app), token validation <10ms (per spec)  
✅ **Migrations**: Flyway, idempotent, forward-only, nullable columns first  

### Data & Schema Evolution Compliance

✅ **New columns nullable**: users.phone is nullable, is_active defaults to TRUE  
✅ **Semantic naming**: *_at timestamps, *_id foreign keys, is_active boolean  
✅ **Enumerations**: Role names (ADMIN, STAFF, AGENT) documented in data-model.md  

### Security & Input Validation Compliance

✅ **Validation at API boundary**: Spring Boot @Valid annotations on DTOs  
✅ **Service layer validation**: Username/email uniqueness, role existence checks  
✅ **No sensitive logs**: Password hash never logged, only generic "login failed" messages  

### Development Workflow Compliance

✅ **Branching**: feature/013-minimal-rbac-user (correct format)  
✅ **Version Control**: Complete spec suite will be committed together  
✅ **Required Artifacts**: spec.md ✓, plan.md (in progress), tasks.md (pending), contracts/ ✓, data-model.md ✓  
✅ **Build Gates**: Gradle + ng build + Flyway migrations (will pass)  

### Test Strategy Compliance

⚠️ **WAIVER**: Comprehensive test-first approach waived for speed  
- **Minimum viable tests**: 
  - Contract test: POST /api/v1/auth/login (request/response shape)
  - Contract test: POST /api/v1/users (create user)
  - Integration smoke test: Admin creates agent → Agent logs in → Agent sees scoped DS
- **Deferred to post-launch**: 
  - Full contract test coverage for all endpoints
  - Unit tests for service layer edge cases
  - Frontend component interaction tests
  - Load/performance tests

### Constitutional Violations Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| Test-First Integrity | ⚠️ WAIVED | Minimal tests for speed; comprehensive suite post-launch |
| All other principles | ✅ COMPLIANT | No violations |

**Post-Design Re-Check**: Will verify no new violations after Phase 1 contracts/data-model finalized.

## Project Structure

### Documentation (this feature)
```
specs/013-minimal-rbac-user/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (/plan command output - IN PROGRESS)
├── README.md            # Overview and quick start (COMPLETE)
├── research.md          # Phase 0 output (/plan command - PENDING)
├── data-model.md        # Database schema (COMPLETE)
├── quickstart.md        # Phase 1 output (/plan command - PENDING)
├── contracts/           # API contracts (COMPLETE)
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/tasks command - PENDING)
```

### Source Code (repository root)
```
backend/
├── src/main/java/com/fleetops/
│   ├── config/
│   │   ├── SecurityConfig.java          # Spring Security configuration
│   │   └── JwtConfig.java               # JWT token settings
│   ├── security/
│   │   ├── JwtTokenProvider.java        # JWT generation/validation
│   │   ├── JwtAuthenticationFilter.java # Token extraction filter
│   │   └── UserDetailsServiceImpl.java  # Spring Security user loader
│   ├── auth/
│   │   ├── controller/
│   │   │   └── AuthController.java      # Login, refresh endpoints
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   └── RefreshTokenRequest.java
│   │   └── service/
│   │       └── AuthService.java         # Authentication logic
│   ├── user/
│   │   ├── controller/
│   │   │   └── UserController.java      # User CRUD endpoints
│   │   ├── dto/
│   │   │   ├── CreateUserRequest.java
│   │   │   ├── UpdateUserRequest.java
│   │   │   └── UserResponse.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   └── UserRole.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   └── UserRoleRepository.java
│   │   └── service/
│   │       └── UserService.java         # User management logic
│   └── role/
│       ├── controller/
│       │   └── RoleController.java      # Role listing endpoint
│       └── service/
│           └── RoleService.java         # Role logic
├── src/main/resources/
│   └── db/migration/
│       ├── V7__create_rbac_tables.sql   # Users, roles, user_roles
│       └── V8__add_default_admin.sql    # Seed admin user (dev only)
└── src/test/java/com/fleetops/
    ├── auth/
    │   └── AuthControllerTest.java      # Contract test: login
    ├── user/
    │   └── UserControllerTest.java      # Contract test: create user
    └── integration/
        └── RBACIntegrationTest.java     # Smoke test: E2E flow

frontend/apps/console-app/src/app/
├── auth/
│   ├── login/
│   │   ├── login.component.ts           # Login page
│   │   ├── login.component.html
│   │   └── login.component.spec.ts
│   ├── guards/
│   │   ├── auth.guard.ts                # Authentication guard
│   │   └── role.guard.ts                # Role-based guard
│   ├── interceptors/
│   │   └── auth.interceptor.ts          # JWT token injection
│   └── services/
│       └── auth.service.ts              # Login/logout/refresh logic
├── user/
│   ├── user-list/
│   │   ├── user-list.component.ts       # User management UI (admin)
│   │   ├── user-list.component.html
│   │   └── user-list.component.spec.ts
│   ├── user-form/
│   │   ├── user-form.component.ts       # Create/edit user form
│   │   └── user-form.component.html
│   └── services/
│       └── user.service.ts              # User CRUD HTTP calls
└── core/
    ├── models/
    │   ├── user.model.ts                # User interface
    │   ├── role.model.ts                # Role interface
    │   └── auth.model.ts                # LoginResponse, etc.
    └── services/
        └── menu.service.ts              # Role-based menu visibility
```

**Structure Decision**: Web application (Option 2) with existing backend/frontend separation. All auth/user code follows domain-driven structure per existing conventions (e.g., pickups/, orders/ modules). Minimal file creation for speed.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. **Load Phase 1 artifacts**:
   - `contracts/api-contracts.md` → Extract 12 endpoints
   - `data-model.md` → Extract 3 tables (users, roles, user_roles)
   - `quickstart.md` → Extract 4 user validation flows
   - `research.md` → Extract 8 technical decisions

2. **Generate minimal test tasks** (waiver applied per Constitution Check):
   - Task 1: Write contract test for POST /api/v1/auth/login [P]
   - Task 2: Write contract test for POST /api/v1/users [P]
   - Task 3: Write smoke integration test for admin-creates-agent-sees-scoped-DS flow [P]
   - SKIP: Unit tests, service layer tests, repository tests (deferred to post-launch)

3. **Generate implementation tasks** (failing-first order):
   - **Backend Block 1** (Database):
     - Task 4: Create V7 migration (users, roles, user_roles tables)
     - Task 5: Create V8 migration (seed roles + default admin) [depends on 4]
     - Task 6: Apply migrations with Flyway [depends on 5]
   
   - **Backend Block 2** (Models & Security):
     - Task 7: Create User, Role, UserRole entities (JPA) [P]
     - Task 8: Create UserRepository, RoleRepository [P]
     - Task 9: Add jjwt dependencies to build.gradle
     - Task 10: Create JwtTokenProvider (generate/validate tokens)
     - Task 11: Create SecurityConfig (disable CSRF, configure endpoints)
     - Task 12: Create JwtAuthenticationFilter (extract token, set SecurityContext)
   
   - **Backend Block 3** (Auth Services):
     - Task 13: Create AuthService (login, refresh logic) [depends on 8,10]
     - Task 14: Create AuthController (POST /login, /refresh) [depends on 13]
     - Task 15: Run Task 1 contract test → should pass
   
   - **Backend Block 4** (User Management):
     - Task 16: Create UserService (CRUD, BCrypt hashing) [depends on 8]
     - Task 17: Create UserController (POST /users, GET /users, etc.) [depends on 16]
     - Task 18: Add @PreAuthorize("hasRole('ADMIN')") to user endpoints
     - Task 19: Run Task 2 contract test → should pass
   
   - **Frontend Block 1** (Auth Foundation):
     - Task 20: Create auth.model.ts (LoginRequest, LoginResponse interfaces) [P]
     - Task 21: Create AuthService (login, logout, getToken, hasRole) [depends on 20]
     - Task 22: Create authInterceptor (attach JWT to requests) [depends on 21]
     - Task 23: Register interceptor in app.config.ts
   
   - **Frontend Block 2** (Guards & Routing):
     - Task 24: Create authGuard (check isAuthenticated) [depends on 21]
     - Task 25: Create adminGuard, agentGuard (check hasRole) [depends on 21,24]
     - Task 26: Update app.routes.ts (apply guards to routes) [depends on 24,25]
   
   - **Frontend Block 3** (Login UI):
     - Task 27: Create LoginComponent (form, submit, error handling) [depends on 21]
     - Task 28: Create login.component.html (Material form fields)
     - Task 29: Add /login route to app.routes.ts
   
   - **Frontend Block 4** (User Management UI):
     - Task 30: Create user.model.ts, user.service.ts (CRUD HTTP calls) [P]
     - Task 31: Create UserListComponent (table, filters, pagination) [depends on 30]
     - Task 32: Create UserFormComponent (create user dialog) [depends on 30]
     - Task 33: Add /admin/users route with adminGuard [depends on 31,25]
   
   - **Frontend Block 5** (Menu & Logout):
     - Task 34: Update NavigationComponent template (role-based *ngIf) [depends on 21]
     - Task 35: Add logout button (calls authService.logout) [depends on 21]
   
   - **Integration Block** (Delivery Sheets):
     - Task 36: Add getActiveAgents() to UserService (backend) [depends on 16]
     - Task 37: Update DS creation form with agent dropdown (frontend) [depends on 30,36]
     - Task 38: Add findByAssignedAgentId() to DeliverySheetRepository [depends on 7]
     - Task 39: Update DS list to filter by currentUser.role [depends on 21,38]
     - Task 40: Run Task 3 integration test → should pass

**Ordering Strategy**:
- **Failing-first**: Tests created before implementation (Tasks 1-3 → fail until Tasks 15,19,40)
- **Dependency chain**: Migrations → Entities → Services → Controllers → UI
- **Parallel execution [P]**: Mark tasks with no dependencies (e.g., Task 7, 8, 20, 30)
- **Minimal scope**: 40 tasks vs typical 60+ (no unit tests, no complex error flows)

**Constitutional Waiver Applied**:
- Test-First Integrity principle waived for unit/integration tests (only 3 contract tests)
- Justification: P0 blocker, speed prioritized, comprehensive tests deferred to Sprint 2
- Risk mitigation: Manual testing via quickstart.md flows, production monitoring alerts

**Estimated Output**: 40 numbered, dependency-ordered tasks in tasks.md (15-20 parallel tasks marked [P])

**Validation Checkpoints**:
- Checkpoint 1 (after Task 15): Login endpoint returns valid JWT
- Checkpoint 2 (after Task 19): Admin can create users, Staff gets 403
- Checkpoint 3 (after Task 40): Full E2E flow passes (admin creates agent, agent sees scoped DS)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan. The above is a planning blueprint only.

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - research.md created with 8 decisions
- [x] Phase 1: Design complete (/plan command) - quickstart.md created, agent context updated
- [x] Phase 2: Task planning complete (/plan command - approach described, 40 tasks outlined)
- [ ] Phase 3: Tasks generated (/tasks command) - NEXT STEP
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (1 waiver: Test-First)
- [x] Post-Design Constitution Check: PASS (minimal scope, no complexity violations)
- [x] All NEEDS CLARIFICATION resolved (8 research questions answered)
- [x] Complexity deviations documented (N/A - standard web app pattern)

**Phase 1 Artifacts**:
- [x] research.md: 8 technical decisions (JWT, BCrypt, guards, storage, migrations, queries, menus, testing)
- [x] quickstart.md: 5-phase implementation guide (DB setup → Backend → Frontend → Integration → Testing)
- [x] Agent context updated: .github/copilot-instructions.md incremental update applied

**Ready for /tasks command**: ✅ All prerequisites met

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
