# Minimal RBAC (User Management) - Epic E10

**Feature Number**: 013  
**Branch**: `013-minimal-rbac-user`  
**Priority**: 🔴 P0 Critical  
**Status**: Specification Complete - Ready for Planning  
**Created**: October 6, 2025

---

## 📋 Overview

This feature implements minimal role-based access control (RBAC) for the FleetOps system, enabling:
- **User Authentication**: JWT-based login and token refresh
- **Three Fixed Roles**: ADMIN, STAFF, AGENT with clear permission boundaries
- **Agent-Scoped Delivery Sheets**: Agents see only their assigned work
- **User Management**: Admin-only user creation, role assignment, activation/deactivation

**Business Value**: Unblocks Epic E4 (Delivery Sheet Module) by providing authenticated agent identities for DS assignment and scoped access control.

---

## 📁 Specification Files

### 1. [spec.md](./spec.md) - Feature Specification
**Purpose**: Business requirements and user scenarios  
**Audience**: Product owners, stakeholders, business analysts  
**Contains**:
- Problem statement and business impact
- 5 main user scenarios with acceptance criteria
- 6 edge cases and error scenarios
- 50+ functional requirements across 8 categories
- Success metrics and risk analysis

**Status**: ✅ Complete

---

### 2. [contracts/api-contracts.md](./contracts/api-contracts.md) - REST API Contracts
**Purpose**: HTTP endpoint definitions for backend implementation  
**Audience**: Backend developers, frontend developers, QA engineers  
**Contains**:
- Authentication endpoints (login, refresh, logout)
- User management endpoints (CRUD, password reset, list)
- Role management endpoints
- Delivery sheet integration endpoints (agent listing)
- JWT token structure
- Error response formats
- HTTP status codes

**Status**: ✅ Complete

---

### 3. [data-model.md](./data-model.md) - Database Schema
**Purpose**: PostgreSQL schema design and migration strategy  
**Audience**: Backend developers, database administrators  
**Contains**:
- Table definitions: `users`, `roles`, `user_roles`, `refresh_tokens`
- Foreign key relationships
- Indexes for performance
- Seed data for roles and default admin user
- Sample queries for common operations
- Migration strategy (Flyway)
- Integration with `delivery_sheets` table

**Status**: ✅ Complete

---

## 🎯 Quick Start

### For Spec Review
1. Read [spec.md](./spec.md) to understand business requirements
2. Review user scenarios and acceptance criteria
3. Validate that all non-goals are acceptable exclusions

### For Implementation Planning
1. Review [contracts/api-contracts.md](./contracts/api-contracts.md) for API design
2. Review [data-model.md](./data-model.md) for database schema
3. Run `/plan` command to generate implementation tasks
4. Run `/tasks` command to create failing-first test list

### For Implementation
1. Create Flyway migration: `V7__create_rbac_tables.sql` (from data-model.md)
2. Implement Spring Security + JWT (backend)
3. Create entities, repositories, services (backend)
4. Implement REST endpoints (backend)
5. Create login page + auth service (frontend)
6. Implement HTTP interceptor + route guards (frontend)
7. Create user management UI (frontend - admin only)
8. Write acceptance tests

---

## 🚀 Next Steps

### Phase 1: Specification ✅ COMPLETE
- [x] Create feature spec (spec.md)
- [x] Define API contracts
- [x] Design database schema
- [x] Update copilot instructions

### Phase 2: Planning 🔄 NEXT
- [ ] Run `/plan` command to generate implementation roadmap
- [ ] Run `/tasks` command to create task breakdown
- [ ] Estimate effort per task
- [ ] Identify parallel work streams

### Phase 3: Implementation 📋 PENDING
- [ ] Database migrations (Flyway)
- [ ] Backend implementation (Spring Boot + Spring Security)
- [ ] Frontend implementation (Angular + route guards)
- [ ] Testing (unit + integration + E2E)

### Phase 4: Testing & Deployment 📋 PENDING
- [ ] Run acceptance tests
- [ ] Deploy to staging
- [ ] User acceptance testing (UAT)
- [ ] Deploy to production

---

## 📊 Metrics & Success Criteria

### Quantitative
- ✅ Login success rate > 98%
- ✅ Token validation < 10ms per API call
- ✅ User creation < 2 minutes per user
- ✅ 0% agent data leakage (agents never see other agents' DS)

### Qualitative
- ✅ Admin feedback: "User management is simple and fast"
- ✅ Agent feedback: "I only see my work, no confusion"
- ✅ No unauthorized access incidents in first 30 days

---

## 🔗 Dependencies

### Blocker For
- **Epic E4**: Delivery Sheet Module (requires agent user accounts)

### Depends On
- PostgreSQL database (already running)
- Flyway migrations (already configured)
- Spring Boot backend (already running)
- Angular frontend (already running)

---

## 👥 Roles & Permissions

| Role | User Management | DS Creation | DS View | DS Update | Agent-Scoped |
|------|----------------|-------------|---------|-----------|--------------|
| **ADMIN** | ✅ Full | ✅ | ✅ All DS | ✅ | ❌ |
| **STAFF** | ❌ | ✅ | ✅ All DS | ✅ | ❌ |
| **AGENT** | ❌ | ❌ | ✅ Own DS only | ✅ Own DS only | ✅ |

---

## 📝 Acceptance Demo Script

```
1. Admin logs in → creates Agent user "Amit Kumar"
2. Admin creates DS with 15 orders → assigns to "Amit Kumar"
3. Amit logs in → sees "My Delivery Sheets" with 1 DS
4. Amit updates 2 items:
   - Item 1: Delivered (OTP: 456789, COD: ₹500)
   - Item 2: Failed (Reason: "Customer not available")
5. Amit tries to access another agent's DS via URL hack → 403 Forbidden
6. Admin views DS → sees updates by Amit
7. Admin deactivates Amit's account
8. Amit tries to log in → "Account is inactive" error
```

---

## 🔒 Security Considerations

- ✅ BCrypt password hashing (work factor ≥ 10)
- ✅ JWT tokens (short-lived: 2-4 hours access, 7 days refresh)
- ✅ HTTPS required in production
- ✅ No plaintext passwords in logs or responses
- ✅ Generic login error messages (don't reveal username vs password)
- ⚠️ XSS prevention required (token storage in localStorage)
- ⚠️ CSRF protection via JWT (stateless auth)

---

## 📞 Contact & Review

**Spec Author**: GitHub Copilot + FleetOps Team  
**Last Updated**: October 6, 2025  
**Next Review**: After planning phase  
**Questions**: See [spec.md](./spec.md) or raise in planning discussion

---

## 🎉 Checklist Before Planning

- [x] Spec reviewed and approved
- [x] API contracts defined
- [x] Data model designed
- [x] Non-goals clearly documented
- [x] Acceptance criteria testable
- [x] Dependencies identified
- [ ] Ready to run `/plan` command ← **YOU ARE HERE**

---

**Ready for Planning Phase** ✅
