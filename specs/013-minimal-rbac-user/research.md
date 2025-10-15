# Research: Minimal RBAC (User Management)

**Feature**: 013-minimal-rbac-user  
**Date**: October 6, 2025  
**Status**: Complete

---

## Research Questions & Decisions

### 1. JWT Token Strategy

**Question**: Which JWT library and token strategy for Spring Boot 3.x?

**Decision**: Use `io.jsonwebtoken:jjwt-api:0.12.3` with dual-token approach (access + refresh)

**Rationale**:
- **jjwt** is actively maintained, Spring Boot 3 compatible, and widely adopted
- **Dual tokens** balance security and UX:
  - Short-lived access token (2-4 hours) limits exposure window
  - Long-lived refresh token (7 days) avoids frequent re-login
  - Refresh tokens can be invalidated server-side (via password change or admin action)
- **Stateless approach** (no session storage) scales horizontally
- Token validation <10ms (in-memory verification)

**Alternatives Considered**:
- **Spring Security OAuth2**: Overkill for internal 3-role system; adds complexity
- **Single long-lived token**: Security risk (no revocation without database lookup)
- **Session-based auth**: Requires sticky sessions or shared session store (Redis)

**Implementation Notes**:
- Store JWT secret in `application.yml` (dev) or environment variable (prod)
- Use HS256 (HMAC-SHA256) algorithm for simplicity
- Include userId + roles in token claims for quick authorization checks

---

### 2. Password Hashing Strategy

**Question**: BCrypt work factor and implementation?

**Decision**: Use Spring Security's `BCryptPasswordEncoder` with work factor 10

**Rationale**:
- **Work factor 10** provides good security/performance balance:
  - ~100ms hashing time (acceptable for login)
  - 2^10 = 1,024 rounds (resistant to brute force)
- **Built-in to Spring Security**: No additional dependencies
- **Auto-salting**: BCrypt generates unique salt per password
- **Future-proof**: Work factor can be increased in future migrations

**Alternatives Considered**:
- **Argon2**: Better security but requires additional library; overkill for P0
- **PBKDF2**: Older algorithm, less resistant to GPU attacks
- **Higher work factor (12-14)**: Login latency > 200ms (poor UX)

**Implementation Notes**:
- Store hash in `password_hash` column (VARCHAR(60) sufficient for BCrypt output)
- Never log password or hash
- Consider "password strength" validation in future phase (currently admin-set)

---

### 3. Route Guard Strategy (Frontend)

**Question**: How to implement role-based route guards in Angular 18?

**Decision**: Use `CanActivateFn` functional guards with role checking

**Rationale**:
- **Functional guards** (Angular 14+): Simpler than class-based guards
- **Inject AuthService** via `inject()` to check user roles
- **Compose guards**: Auth guard + Role guard chaining
- **Type-safe roles**: TypeScript enum for ADMIN, STAFF, AGENT

**Alternatives Considered**:
- **Class-based guards**: Deprecated pattern in Angular 15+
- **Single guard with role params**: Less flexible, harder to test
- **Backend-only auth**: Vulnerable to URL hacking (frontend guards are UX, not security)

**Implementation Notes**:
```typescript
// Example guard signature
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.hasRole('ADMIN') ? true : router.createUrlTree(['/forbidden']);
};
```

---

### 4. Token Storage Strategy (Frontend)

**Question**: localStorage vs sessionStorage vs httpOnly cookies?

**Decision**: Use `localStorage` with XSS mitigation (waive httpOnly cookies for speed)

**Rationale**:
- **localStorage**: Persists across browser sessions (better UX, no re-login)
- **XSS mitigation via Angular**:
  - Angular sanitizes all template bindings by default
  - Use `DomSanitizer` only for trusted content
  - No `innerHTML` with user data
- **HTTPS required**: Prevents token interception
- **Defer httpOnly cookies**: Requires backend session management (complexity not justified for P0)

**Alternatives Considered**:
- **sessionStorage**: Cleared on tab close (poor UX, users lose session frequently)
- **httpOnly cookies**: Best security but requires:
  - CORS configuration
  - CSRF tokens
  - Backend session tracking
  - More complex refresh flow
- **Memory-only storage**: Cleared on page refresh (terrible UX)

**Security Trade-off**:
- **Accepted Risk**: XSS vulnerability could steal token from localStorage
- **Mitigation**: Rely on Angular's XSS protection + input sanitization
- **Future Enhancement**: Migrate to httpOnly cookies in security hardening phase

---

### 5. Database Migration Strategy

**Question**: Flyway migration approach for RBAC tables?

**Decision**: Two migrations: V7 (tables + seed roles), V8 (default admin - dev only)

**Rationale**:
- **V7 creates tables + roles**: Atomic schema + fixed data (roles never change)
- **V8 seeds admin user**: Separate file for easy removal in production
- **Idempotent inserts**: Use `ON CONFLICT DO NOTHING` for safety
- **Nullable columns first**: `phone` nullable; can add constraints later if needed

**Alternatives Considered**:
- **Single migration**: Harder to manage dev-only data
- **Separate migration per table**: Overkill (only 3 tables, tightly coupled)
- **No default admin**: Forces manual database insert (poor developer experience)

**Implementation Notes**:
```sql
-- V7__create_rbac_tables.sql
CREATE TABLE users (...);
CREATE TABLE roles (...);
CREATE TABLE user_roles (...);
INSERT INTO roles (name, description) VALUES (...) ON CONFLICT (name) DO NOTHING;

-- V8__add_default_admin.sql (DEV ONLY - remove before prod deploy)
INSERT INTO users (...) VALUES ('admin', ...) ON CONFLICT (username) DO NOTHING;
INSERT INTO user_roles (...) SELECT ... ON CONFLICT DO NOTHING;
```

---

### 6. Agent-Scoped Delivery Sheet Queries

**Question**: How to efficiently scope DS queries for AGENT role?

**Decision**: Use Spring Data JPA query method with `assigned_agent_id` filter

**Rationale**:
- **Query method naming**: `findByAssignedAgentId(Long agentId)` generates SQL automatically
- **Index on assigned_agent_id**: Fast lookups (query plan uses index)
- **Service layer enforcement**: Check user role, apply filter conditionally
- **No N+1 queries**: Eager fetch assigned user details if needed

**Alternatives Considered**:
- **Database views**: Overkill for simple WHERE clause
- **Custom query with @Query**: Unnecessary (method naming sufficient)
- **Frontend filtering**: Insecure (agents could modify request to see all DS)

**Implementation Notes**:
```java
// DeliverySheetRepository
List<DeliverySheet> findByAssignedAgentId(Long agentId);

// DeliverySheetService
public List<DeliverySheet> getDeliverySheetsForUser(User user) {
  if (user.hasRole("AGENT")) {
    return repository.findByAssignedAgentId(user.getId());
  }
  return repository.findAll(); // ADMIN/STAFF see all
}
```

---

### 7. Role-Based Menu Visibility (Frontend)

**Question**: How to hide/show menu items based on roles?

**Decision**: Use `*ngIf` with `authService.hasRole()` helper in template

**Rationale**:
- **Simple and reactive**: Menu updates immediately when roles change
- **Type-safe**: TypeScript enum for role names
- **Testable**: Mock authService in component tests
- **No additional libraries**: Pure Angular directives

**Alternatives Considered**:
- **Custom structural directive**: Overkill for simple role check
- **CSS display:none**: Menu items still in DOM (poor security hygiene)
- **Dynamic menu configuration**: Adds complexity, hard to maintain

**Implementation Notes**:
```typescript
// Template
<mat-nav-list>
  <a mat-list-item routerLink="/dashboard">Dashboard</a>
  <a mat-list-item routerLink="/orders">Orders</a>
  <a mat-list-item routerLink="/admin/users" *ngIf="authService.hasRole('ADMIN')">
    User Management
  </a>
  <a mat-list-item routerLink="/my-delivery-sheets" *ngIf="authService.hasRole('AGENT')">
    My Delivery Sheets
  </a>
</mat-nav-list>
```

---

### 8. Minimal Testing Strategy

**Question**: Which tests are essential for fast implementation?

**Decision**: 3 minimal tests only (per user request for speed)

**Tests to Implement**:
1. **Contract Test - Login Endpoint**:
   - POST /api/v1/auth/login with valid credentials → 200 OK + JWT tokens
   - POST /api/v1/auth/login with invalid credentials → 401 Unauthorized
   - Validates request/response schemas

2. **Contract Test - Create User Endpoint**:
   - POST /api/v1/users as ADMIN → 201 Created + user object
   - POST /api/v1/users as STAFF → 403 Forbidden
   - Validates role enforcement + request/response schemas

3. **Smoke Integration Test - E2E Flow**:
   - Admin creates agent user → Agent logs in → Agent sees only own DS
   - Uses TestContainers for real PostgreSQL
   - Covers full authentication + authorization flow

**Rationale**:
- **Contract tests** catch API breaking changes (critical for frontend integration)
- **Smoke test** validates end-to-end flow (acceptance criteria verification)
- **Defer comprehensive tests**: Unit tests, edge cases, load tests post-launch
- **Speed over coverage**: Get to production faster, add tests iteratively

**Deferred Tests** (post-launch):
- All other endpoint contract tests (refresh, user update, role listing, etc.)
- Service layer unit tests (password validation, duplicate checks, etc.)
- Frontend component tests (login form, user list, etc.)
- Authorization edge cases (concurrent sessions, role changes, etc.)
- Performance tests (load, stress, token validation latency)

---

## Research Summary

**All technical unknowns resolved**:
- ✅ JWT strategy: jjwt library, dual tokens, HS256
- ✅ Password hashing: BCrypt work factor 10
- ✅ Frontend guards: Functional guards with role checking
- ✅ Token storage: localStorage (XSS mitigation via Angular)
- ✅ Database migrations: Two Flyway scripts (V7 + V8)
- ✅ Agent-scoped queries: JPA query methods with agent ID filter
- ✅ Role-based menus: *ngIf with hasRole() helper
- ✅ Testing strategy: 3 minimal tests (contract + smoke)

**No blockers identified**. Ready for Phase 1 (design & contracts).

---

**Research Status**: ✅ Complete  
**Next Phase**: Phase 1 - Design & Contracts (quickstart.md)
