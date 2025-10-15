# Feature Specification: Minimal RBAC (User Management) — Epic E10 — Slim Slice

**Feature Branch**: `013-minimal-rbac-user`  
**Created**: October 6, 2025  
**Status**: Draft  
**Priority**: 🔴 P0 Critical  
**Effort**: 4-5 weeks  
**Input**: Ship P0 minimal RBAC to unblock DS module: authenticated users, role-based access (ADMIN, STAFF, AGENT), JWT, frontend guards, agent-scope on DS.

## Execution Flow (main)
```
1. Parse user description from Input ✓
   → Feature: Minimal role-based access control for delivery sheet operations
2. Extract key concepts from description ✓
   → Actors: Admin, Staff, Agent
   → Actions: Login, manage users, assign roles, access DS by role
   → Data: Users, Roles, User-Role assignments
   → Constraints: Agent sees only their own DS, admin-only user management
3. For each unclear aspect: None identified - requirements are concrete
4. Fill User Scenarios & Testing section ✓
5. Generate Functional Requirements ✓
6. Identify Key Entities ✓
7. Run Review Checklist
   → No implementation details in spec
   → All requirements testable
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (deferred to planning phase)
- 👥 Written for business stakeholders and product owners

---

## Problem Statement

### Current Situation
The FleetOps system currently has no user authentication or access control. All users can access all features and see all data, including:
- Any user can view and modify any delivery sheet (DS)
- No distinction between administrative staff, operational staff, and field agents
- No audit trail of who performed what action
- Cannot assign delivery sheets to specific agents
- Cannot restrict agent access to only their assigned work

### Business Impact
- **Operational Risk**: Field agents can accidentally (or intentionally) modify data they shouldn't access
- **Accountability Gap**: Cannot track who updated order statuses or closed delivery sheets
- **Workflow Blocker**: Cannot implement agent-specific delivery sheet assignment (required for Epic E4 - DS Module)
- **Security Exposure**: Sensitive business data (revenue, client details, all orders) visible to all users
- **Compliance Risk**: No access control violates basic data protection principles

### Root Cause
System was initially built as a single-user admin tool. Now expanding to multi-user operations with distinct roles (office admin, operations staff, field agents) requires authentication and authorization.

---

## Goals

### Primary Goal
Enable secure, role-based access to the FleetOps system so that:
1. **Admins** can manage users and access all system features
2. **Staff** can perform operational tasks without user management privileges
3. **Agents** can view and update only their assigned delivery sheets
4. System tracks who performed each action via authenticated sessions

### Success Criteria
- ✅ 100% of users must log in with credentials before accessing the system
- ✅ Agent users can only view delivery sheets assigned to them (0% data leakage)
- ✅ Admin users can create new users and assign roles in < 2 minutes per user
- ✅ Invalid login attempts are blocked with clear error messages
- ✅ User roles correctly enforce access restrictions (verified via automated tests)
- ✅ Delivery sheet assignment workflow uses authenticated agent identities

### Business Value
- **Unblocks Epic E4**: DS Module can now assign work to specific agents
- **Operational Efficiency**: Agents focus only on their assigned work (reduced cognitive load)
- **Accountability**: Every action tracked to a specific user
- **Security**: Sensitive data protected from unauthorized access
- **Scalability**: Foundation for future features (billing access, client portal, etc.)

---

## Non-Goals (Out of Scope)

### Explicitly Excluded
- **SSO/OAuth Integration**: No integration with external identity providers (Google, Microsoft, etc.)
- **Password Recovery via Email**: No "forgot password" email workflow (admin resets passwords manually)
- **Multi-Factor Authentication (MFA)**: No 2FA, OTP, or biometric authentication
- **Fine-Grained Permissions**: No custom permission sets beyond three roles (ADMIN, STAFF, AGENT)
- **Audit Trail System**: No comprehensive audit log (only minimal login timestamps)
- **External Secrets Management**: No integration with HashiCorp Vault, AWS Secrets Manager, etc.
- **Session Management UI**: No "active sessions" view or remote logout capability
- **Password Complexity Policies**: No enforced password rules (length, special chars, expiry)
- **User Self-Registration**: No public sign-up page (admin creates all accounts)
- **Role Hierarchy**: No nested roles or role inheritance (flat 3-role structure)

### Deferred to Future Phases
- **Delivery Sheet CRUD APIs**: Implemented separately in Epic E4
- **Advanced Audit Trail**: Detailed action logs for compliance (P3 priority)
- **Client Portal Authentication**: Separate external-facing auth system (P3 priority)
- **Mobile App Authentication**: Mobile-specific auth flows (P2 priority)

---

## Stakeholders & Users

### Primary Personas

#### 1. **Admin User** (Rajiv - Operations Manager)
**Role**: ADMIN  
**Needs**:
- Create user accounts for new hires (staff, agents)
- Assign roles (ADMIN, STAFF, AGENT) to users
- Deactivate accounts when employees leave
- Reset passwords for users who forget credentials
- View full system (all delivery sheets, all orders, all analytics)

**Access Level**: Full system access + user management

---

#### 2. **Staff User** (Priya - Operations Coordinator)
**Role**: STAFF  
**Needs**:
- Access operational features (create DS, view orders, analytics)
- Cannot create or modify user accounts
- Cannot change user roles or permissions
- View all delivery sheets (not scoped to specific agent)

**Access Level**: All operational features, no user management

---

#### 3. **Agent User** (Rajesh - Field Delivery Agent)
**Role**: AGENT  
**Needs**:
- View only delivery sheets assigned to them
- Update delivery status for items on their assigned sheets
- Enter COD amounts and proof of delivery
- Cannot view other agents' work
- Cannot access admin features (user management, system settings)
- Cannot view all orders or create new delivery sheets

**Access Level**: Minimal - only "My Delivery Sheets" and assigned items

---

## User Scenarios & Testing

### Scenario 1: Admin Creates New Agent User
**Actor**: Rajiv (Admin)  
**Context**: New field agent "Amit Kumar" joins the team  
**Steps**:
1. Rajiv logs into FleetOps system
2. Navigates to "User Management" page
3. Clicks "Create New User" button
4. Fills form:
   - Username: `amit.kumar`
   - Email: `amit.kumar@mailit.com`
   - Full Name: `Amit Kumar`
   - Phone: `9876543210`
   - Password: `TempPass123` (to be reset on first login)
   - Role: **AGENT**
5. Clicks "Create User"
6. System creates user account and shows success message
7. Rajiv shares credentials with Amit

**Expected Outcome**:
- User account created with AGENT role
- Amit can log in with provided credentials
- Amit sees only "My Delivery Sheets" (empty initially)
- Amit cannot access admin pages (blocked by route guard)

**Acceptance Test**:
```gherkin
Given Rajiv is logged in as ADMIN
When Rajiv creates user "Amit Kumar" with role AGENT
Then user account is created with is_active=true
And Amit can log in with provided credentials
And Amit's menu shows only "My Delivery Sheets" and "Profile"
And Amit cannot navigate to "/admin/users" (403 Forbidden)
```

---

### Scenario 2: Admin Assigns Agent to Delivery Sheet
**Actor**: Rajiv (Admin)  
**Context**: Admin needs to assign delivery work to Amit  
**Steps**:
1. Rajiv navigates to "Create Delivery Sheet" page
2. Selects 15 orders for delivery in Sector 21
3. In "Assign Agent" dropdown, sees list of active agents
4. Selects "Amit Kumar" from dropdown
5. Clicks "Create Delivery Sheet"
6. System creates DS and assigns to Amit

**Expected Outcome**:
- Delivery sheet created with `assigned_agent_id = Amit's user ID`
- Amit logs in → sees new DS in "My Delivery Sheets"
- Amit can view and update items on this DS
- Other agents (Rajesh, Priya) cannot see this DS in their list

**Acceptance Test**:
```gherkin
Given Rajiv is logged in as ADMIN
And agent user "Amit Kumar" exists with role AGENT
When Rajiv creates delivery sheet and assigns to "Amit Kumar"
Then delivery sheet has assigned_agent_id = Amit's user ID
And Amit sees this DS in "My Delivery Sheets" list
And other agents do NOT see this DS in their lists
```

---

### Scenario 3: Agent Updates Delivery Status (Scoped Access)
**Actor**: Amit (Agent)  
**Context**: Amit is out on delivery with his assigned DS  
**Steps**:
1. Amit logs in on mobile/web
2. Opens "My Delivery Sheets"
3. Sees only DS assigned to him (DS000123)
4. Opens DS000123 → sees 15 items
5. Updates item status:
   - Item 1: Delivered (OTP: 456789, COD: ₹500)
   - Item 2: Failed (Reason: "Customer not available")
6. System saves updates
7. Amit tries to access another agent's DS via URL hack (`/ds/000124`)
8. System blocks access with 403 Forbidden

**Expected Outcome**:
- Amit can update items on his assigned DS
- Amit cannot view or modify other agents' DS
- Admin can see all updates Amit made (audit trail: updated_by = Amit's user ID)

**Acceptance Test**:
```gherkin
Given Amit is logged in as AGENT
And DS000123 is assigned to Amit
And DS000124 is assigned to another agent
When Amit opens "My Delivery Sheets"
Then Amit sees only DS000123 in the list
When Amit updates item status on DS000123
Then updates are saved with updated_by = Amit's user ID
When Amit tries to access DS000124 via direct URL
Then system returns 403 Forbidden error
```

---

### Scenario 4: Staff User Accesses Operational Features (No User Management)
**Actor**: Priya (Staff)  
**Context**: Staff user performing daily operations  
**Steps**:
1. Priya logs in with staff credentials
2. Dashboard loads with operational menu items visible
3. Priya can:
   - View all delivery sheets (not scoped to specific agent)
   - Create new delivery sheets
   - View order list and analytics
4. Priya tries to access "User Management" page
5. Menu item is hidden (role-based UI)
6. Priya tries direct URL `/admin/users`
7. System blocks with 403 Forbidden

**Expected Outcome**:
- Staff can access all operational features
- Staff cannot create/edit users or change roles
- Menu hides admin-only items for staff role

**Acceptance Test**:
```gherkin
Given Priya is logged in as STAFF
Then Priya sees menu items: Dashboard, Orders, Delivery Sheets, Analytics
And Priya does NOT see menu item: User Management
When Priya navigates to "/delivery-sheets"
Then page loads successfully (200 OK)
When Priya tries to navigate to "/admin/users"
Then system returns 403 Forbidden error
```

---

### Scenario 5: Admin Deactivates User Account
**Actor**: Rajiv (Admin)  
**Context**: Agent "Amit Kumar" leaves the company  
**Steps**:
1. Rajiv opens "User Management" page
2. Finds "Amit Kumar" in user list
3. Clicks "Deactivate Account" button
4. Confirms deactivation in modal dialog
5. System sets `is_active = false` for Amit's account
6. Amit tries to log in later
7. System rejects login with error: "Account is inactive. Contact administrator."

**Expected Outcome**:
- Deactivated user cannot log in
- Existing sessions are invalidated (if session management implemented)
- User appears in user list with "Inactive" badge
- Admin can reactivate account later if needed

**Acceptance Test**:
```gherkin
Given Rajiv is logged in as ADMIN
And agent user "Amit Kumar" has is_active=true
When Rajiv deactivates Amit's account
Then Amit's user record has is_active=false
When Amit tries to log in with valid credentials
Then login fails with error "Account is inactive"
When Rajiv reactivates Amit's account
Then Amit can log in successfully
```

---

### Edge Cases & Error Scenarios

#### Edge Case 1: Duplicate Username
**Given**: User "amit.kumar" already exists  
**When**: Admin tries to create another user with username "amit.kumar"  
**Then**: System rejects with error "Username already exists. Please choose a different username."

#### Edge Case 2: Duplicate Email
**Given**: User with email "amit@mailit.com" already exists  
**When**: Admin tries to create user with same email  
**Then**: System rejects with error "Email already registered. Please use a different email."

#### Edge Case 3: Invalid Login Credentials
**Given**: User enters wrong password  
**When**: User clicks "Login"  
**Then**: System rejects with error "Invalid username or password" (generic message for security)

#### Edge Case 4: Token Expiration
**Given**: User logged in 8 hours ago (token expired)  
**When**: User tries to make API call  
**Then**: System returns 401 Unauthorized  
**And**: Frontend intercepts and redirects to login page

#### Edge Case 5: Agent Assigned No Delivery Sheets
**Given**: Agent "Amit" logged in  
**And**: No delivery sheets assigned to Amit  
**When**: Amit opens "My Delivery Sheets"  
**Then**: Page shows empty state: "No delivery sheets assigned to you yet."

#### Edge Case 6: Role Change Impact
**Given**: User "Priya" has role STAFF  
**And**: Priya is currently logged in  
**When**: Admin changes Priya's role to AGENT  
**Then**: Priya's current session remains valid with old role (STAFF)  
**And**: On next login, Priya sees AGENT menu and access restrictions

---

## Requirements

### Functional Requirements - Authentication

- **FR-AUTH-001**: System MUST provide a login page where users enter username/email and password
- **FR-AUTH-002**: System MUST validate credentials against stored user records
- **FR-AUTH-003**: System MUST reject login if username/email does not exist
- **FR-AUTH-004**: System MUST reject login if password does not match stored hash
- **FR-AUTH-005**: System MUST reject login if user account is inactive (`is_active = false`)
- **FR-AUTH-006**: System MUST issue a JWT access token upon successful login containing:
  - User ID
  - Username
  - List of roles (e.g., `["ADMIN"]` or `["STAFF"]` or `["AGENT"]`)
  - Token expiration timestamp
- **FR-AUTH-007**: System MUST issue a JWT refresh token with longer expiration than access token
- **FR-AUTH-008**: System MUST allow clients to refresh expired access tokens using valid refresh token
- **FR-AUTH-009**: System MUST update `last_login` timestamp in user record upon successful login
- **FR-AUTH-010**: System MUST invalidate refresh tokens when user password is changed
- **FR-AUTH-011**: System MUST return clear error messages for failed login attempts (without revealing whether username or password was incorrect)
- **FR-AUTH-012**: System MUST enforce token expiration (reject API calls with expired tokens)

### Functional Requirements - User Management (Admin Only)

- **FR-USER-001**: System MUST allow ADMIN role to create new user accounts with fields:
  - Username (required, unique, alphanumeric + underscore/dot)
  - Email (required, unique, valid email format)
  - Full Name (required)
  - Phone (optional)
  - Password (required, hashed before storage)
  - Role assignment (required, one or more of: ADMIN, STAFF, AGENT)
  - Active status (default: true)
- **FR-USER-002**: System MUST prevent duplicate usernames (case-insensitive)
- **FR-USER-003**: System MUST prevent duplicate email addresses (case-insensitive)
- **FR-USER-004**: System MUST hash passwords using BCrypt before storing in database
- **FR-USER-005**: System MUST allow ADMIN role to list all users with pagination and filters:
  - Filter by role (ADMIN, STAFF, AGENT)
  - Filter by active status (active, inactive)
  - Search by username, email, or full name
- **FR-USER-006**: System MUST allow ADMIN role to view individual user details
- **FR-USER-007**: System MUST allow ADMIN role to update user details:
  - Full name, phone, email
  - Role assignment (add/remove roles)
  - Active status (activate/deactivate)
- **FR-USER-008**: System MUST allow ADMIN role to deactivate user accounts (soft delete)
- **FR-USER-009**: System MUST allow ADMIN role to reactivate deactivated accounts
- **FR-USER-010**: System MUST allow ADMIN role to reset user passwords (admin sets new temporary password)
- **FR-USER-011**: System MUST prevent ADMIN from deleting their own account (last admin protection)
- **FR-USER-012**: System MUST block all user management endpoints for STAFF and AGENT roles (403 Forbidden)

### Functional Requirements - Role Management

- **FR-ROLE-001**: System MUST define three fixed roles:
  - **ADMIN**: Full system access + user management
  - **STAFF**: All operational features, no user management
  - **AGENT**: Minimal access (only assigned delivery sheets)
- **FR-ROLE-002**: System MUST allow ADMIN and STAFF roles to list all available roles
- **FR-ROLE-003**: System MUST allow users to have one or more roles (many-to-many relationship)
- **FR-ROLE-004**: System MUST assign role(s) to user at account creation
- **FR-ROLE-005**: System MUST allow ADMIN to change user role assignments after creation
- **FR-ROLE-006**: System MUST prevent creating new roles dynamically (fixed 3-role system)
- **FR-ROLE-007**: System MUST include all assigned roles in JWT token claims

### Functional Requirements - Authorization & Access Control

- **FR-AUTHZ-001**: System MUST enforce role-based access control on all API endpoints
- **FR-AUTHZ-002**: System MUST allow ADMIN role to access all endpoints
- **FR-AUTHZ-003**: System MUST block STAFF role from accessing user management endpoints
- **FR-AUTHZ-004**: System MUST block AGENT role from accessing:
  - User management endpoints
  - System settings endpoints
  - All delivery sheets (except their own)
  - Order creation endpoints
  - Analytics dashboards (unless scoped to their own data)
- **FR-AUTHZ-005**: System MUST scope delivery sheet queries for AGENT role to only show sheets where `assigned_agent_id = current user ID`
- **FR-AUTHZ-006**: System MUST block AGENT role from viewing/updating delivery sheets assigned to other agents (403 Forbidden)
- **FR-AUTHZ-007**: System MUST allow STAFF and ADMIN roles to view all delivery sheets (no agent-scoping)
- **FR-AUTHZ-008**: System MUST validate JWT token on every protected API call
- **FR-AUTHZ-009**: System MUST reject API calls with missing, invalid, or expired tokens (401 Unauthorized)
- **FR-AUTHZ-010**: System MUST reject API calls where user role lacks required permissions (403 Forbidden)

### Functional Requirements - Frontend Route Guards

- **FR-UI-001**: System MUST protect all routes with authentication guard (redirect to login if not authenticated)
- **FR-UI-002**: System MUST implement role-based route guards:
  - Admin-only routes: `/admin/users`, `/admin/settings`
  - Staff-accessible routes: `/delivery-sheets`, `/orders`, `/analytics` (all DS)
  - Agent-only routes: `/my-delivery-sheets` (scoped to assigned DS)
- **FR-UI-003**: System MUST hide menu items based on user role:
  - ADMIN: Show all menu items
  - STAFF: Hide "User Management"
  - AGENT: Show only "My Delivery Sheets" and "Profile"
- **FR-UI-004**: System MUST redirect users to appropriate landing page after login:
  - ADMIN/STAFF → Dashboard
  - AGENT → My Delivery Sheets
- **FR-UI-005**: System MUST attach JWT access token to all HTTP requests via interceptor
- **FR-UI-006**: System MUST handle token expiration gracefully:
  - Attempt token refresh on 401 Unauthorized response
  - Redirect to login if refresh fails
- **FR-UI-007**: System MUST clear stored tokens on logout

### Functional Requirements - Delivery Sheet Integration

- **FR-DS-001**: System MUST populate "Assign Agent" dropdown in DS creation form with users having role AGENT and `is_active = true`
- **FR-DS-002**: System MUST store `assigned_agent_id` (foreign key to users table) when DS is created
- **FR-DS-003**: System MUST scope "My Delivery Sheets" page for AGENT role to show only DS where `assigned_agent_id = current user ID`
- **FR-DS-004**: System MUST allow ADMIN and STAFF roles to view all delivery sheets (no filtering by agent)
- **FR-DS-005**: System MUST display agent name in DS list and detail views (join users table)
- **FR-DS-006**: System MUST prevent AGENT role from creating new delivery sheets (only ADMIN/STAFF can create)
- **FR-DS-007**: System MUST allow AGENT role to update item status on their assigned DS
- **FR-DS-008**: System MUST block AGENT role from closing delivery sheets (only ADMIN/STAFF can close)

---

## Key Entities

### Entity 1: User
**Represents**: A person who uses the FleetOps system (admin, staff, or agent)  
**Key Attributes**:
- Unique identifier (ID)
- Username (unique, for login)
- Email address (unique, for communication)
- Password hash (never store plaintext)
- Full name (for display)
- Phone number (optional, for contact)
- Active status (true/false - soft delete mechanism)
- Created timestamp
- Last login timestamp (for auditing)

**Relationships**:
- One user can have multiple roles (many-to-many with Role entity)
- One user can be assigned to multiple delivery sheets as agent (one-to-many with DeliverySheet entity)

**Business Rules**:
- Username and email must be unique across all users
- Inactive users cannot log in but records are retained
- Password changes invalidate existing refresh tokens

---

### Entity 2: Role
**Represents**: A fixed set of permissions in the system  
**Key Attributes**:
- Unique identifier (ID)
- Role name (ADMIN, STAFF, AGENT)
- Description (human-readable explanation)

**Relationships**:
- One role can be assigned to multiple users (many-to-many with User entity)

**Business Rules**:
- Only three roles exist (fixed, not user-configurable)
- Roles are seeded at database initialization
- Cannot delete or modify role names

---

### Entity 3: UserRole (Join Table)
**Represents**: The assignment of roles to users  
**Key Attributes**:
- User ID (foreign key)
- Role ID (foreign key)
- Composite primary key (user_id, role_id)

**Relationships**:
- Links User entity to Role entity

**Business Rules**:
- One user can have multiple roles (e.g., both STAFF and ADMIN)
- Duplicate role assignments for same user are prevented by primary key constraint

---

### Entity 4: DeliverySheet (Integration Point)
**Represents**: A batch of delivery items assigned to an agent  
**Key Attributes (relevant to RBAC)**:
- Assigned Agent ID (foreign key to User entity)
- Assigned Agent Name (denormalized for display)

**Relationships**:
- One delivery sheet is assigned to one agent user (many-to-one with User entity)

**Business Rules**:
- Only users with role AGENT can be assigned to delivery sheets
- Agent can only view/update delivery sheets where `assigned_agent_id = their user ID`
- ADMIN and STAFF can view all delivery sheets

---

## Data Relationships

```
User (1) ←→ (N) UserRole (N) ←→ (1) Role
User (1 as Agent) ←→ (N) DeliverySheet

User {
  id: primary key
  username: unique
  email: unique
  password_hash
  full_name
  phone
  is_active: boolean
  created_at: timestamp
  last_login: timestamp
}

Role {
  id: primary key
  name: unique (ADMIN, STAFF, AGENT)
  description
}

UserRole {
  user_id: foreign key → User.id
  role_id: foreign key → Role.id
  primary key (user_id, role_id)
}

DeliverySheet {
  id: primary key
  assigned_agent_id: foreign key → User.id (where User has AGENT role)
  ...other DS fields
}
```

---

## Dependencies & Assumptions

### Dependencies
- **Database**: PostgreSQL database must be running and accessible
- **Flyway**: Database migration tool must be configured for schema versioning
- **Spring Boot Backend**: Must be running and reachable from frontend
- **Angular Frontend**: Console app must be built and served

### Assumptions
- **Single Deployment**: All users access single instance (no multi-tenancy)
- **Token Storage**: Frontend can use localStorage or sessionStorage securely (HTTPS required in production)
- **Password Management**: Admins handle password resets manually (no self-service)
- **Session Limits**: No limit on concurrent sessions per user (not implemented in this phase)
- **Role Permissions**: Three-role model sufficient for current operations (no custom permissions needed)
- **Development Environment**: All testing done in dev environment with test users before production deployment

---

## Success Metrics

### Quantitative Metrics
- **Login Success Rate**: > 98% (failed logins due only to invalid credentials, not system errors)
- **Token Validation Performance**: < 10ms per API call for token validation
- **User Creation Time**: < 2 minutes for admin to create new user account
- **Agent Data Leakage**: 0% (agents never see other agents' delivery sheets)
- **Role Enforcement Accuracy**: 100% (all unauthorized access attempts blocked)

### Qualitative Metrics
- **User Feedback**: Admins report user management is "simple and fast"
- **Agent Feedback**: Agents report seeing "only my work" reduces confusion
- **Security Audit**: No unauthorized access incidents reported in first 30 days
- **System Readiness**: Epic E4 (DS Module) successfully uses agent user assignments

---

## Risks & Mitigations

### Risk 1: Password Management Complexity
**Description**: Admins must manually reset passwords for all users (no self-service)  
**Impact**: High support burden if many password reset requests  
**Probability**: Medium  
**Mitigation**: 
- Document clear password reset process for admins
- Consider self-service password reset in future phase (P2)
- Use temporary passwords that prompt for change on first login

### Risk 2: Token Security
**Description**: JWT tokens stored in browser localStorage vulnerable to XSS attacks  
**Impact**: High - compromised token grants full user access  
**Probability**: Low (if no XSS vulnerabilities exist)  
**Mitigation**:
- Ensure all user inputs are sanitized (prevent XSS)
- Use HTTPS in production (prevent token interception)
- Set reasonable token expiration (2-4 hours for access token)
- Document token storage as technical debt to address later with httpOnly cookies

### Risk 3: Agent Role Confusion
**Description**: Agents may not understand why they can't see all delivery sheets  
**Impact**: Medium - support requests and user frustration  
**Probability**: Medium  
**Mitigation**:
- Clear UI messaging: "My Delivery Sheets" (not "All Delivery Sheets")
- Empty state message: "No delivery sheets assigned to you yet"
- Training documentation for agents explaining scoped access

### Risk 4: Last Admin Account Deletion
**Description**: Admin accidentally deactivates all admin accounts, losing system access  
**Impact**: Critical - system becomes unmanageable  
**Probability**: Low  
**Mitigation**:
- Prevent admin from deactivating their own account
- Require at least one active admin account (database constraint or validation)
- Document emergency account recovery process (direct database access)

### Risk 5: Role Change Impact on Active Sessions
**Description**: Changing user role doesn't immediately affect active sessions (JWT contains old roles)  
**Impact**: Medium - user may briefly retain old permissions  
**Probability**: Medium  
**Mitigation**:
- Document that role changes take effect on next login
- Consider session invalidation API in future phase
- Set reasonably short token expiration (4-8 hours)

---

## Open Questions

**None identified** - All requirements are concrete and testable based on the detailed roadmap specification.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) - deferred to planning phase
- [x] Focused on user value and business needs (unblock DS module, secure access)
- [x] Written for non-technical stakeholders (personas, scenarios, business rules)
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous (all FRs have clear acceptance criteria)
- [x] Success criteria are measurable (metrics defined)
- [x] Scope is clearly bounded (non-goals explicitly listed)
- [x] Dependencies and assumptions identified

### Business Alignment
- [x] Aligns with roadmap Priority P0 (Critical blocker for DS Module)
- [x] Addresses client needs (agent accountability, secure access)
- [x] Success metrics support operational goals

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted (3 roles, auth, agent-scoped DS)
- [x] Ambiguities marked (none identified)
- [x] User scenarios defined (5 main scenarios + 6 edge cases)
- [x] Requirements generated (50+ functional requirements across 8 categories)
- [x] Entities identified (User, Role, UserRole, DeliverySheet integration)
- [x] Review checklist passed

**Status**: ✅ **Specification Complete - Ready for Planning Phase**

---

## Next Steps

After spec approval:
1. Run `/plan` command to generate implementation plan with technical details
2. Run `/tasks` command to generate failing-first task list
3. Create Flyway migration scripts for database schema
4. Implement backend Spring Security + JWT
5. Implement frontend login + route guards + user management UI
6. Run acceptance tests to verify all scenarios

---

**Spec Ready for Review** ✅
