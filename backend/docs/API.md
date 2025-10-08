# FleetOps Backend API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:8081/api/v1`  
**Last Updated**: October 8, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Delivery Sheets](#delivery-sheets)
4. [Common Patterns](#common-patterns)

---

## Authentication

### POST /auth/login

Authenticate user and receive JWT tokens.

**Access**: Public

**Request Body**:
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 7200,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mailit.com",
    "fullName": "System Administrator",
    "roles": ["ADMIN", "STAFF", "AGENT"]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials or inactive account

---

### POST /auth/refresh

Refresh an expired access token using a valid refresh token.

**Access**: Public

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 7200
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

---

## User Management

All user management endpoints require **ADMIN** role unless otherwise specified.

### POST /users

Create a new user account.

**Access**: ADMIN only

**Request Body**:
```json
{
  "username": "amit.agent",
  "email": "amit@mailit.com",
  "fullName": "Amit Kumar",
  "phone": "+919876543211",
  "password": "Agent@123",
  "roles": ["AGENT"],
  "isActive": true
}
```

**Response** (201 Created):
```json
{
  "id": 5,
  "username": "amit.agent",
  "email": "amit@mailit.com",
  "fullName": "Amit Kumar",
  "phone": "+919876543211",
  "roles": ["AGENT"],
  "isActive": true,
  "createdAt": "2025-10-08T10:00:00Z",
  "lastLogin": null
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (username/email already exists)
- `403 Forbidden`: Non-admin user attempting to create user

---

### GET /users

List all users with pagination and filtering.

**Access**: ADMIN only

**Query Parameters**:
- `page` (number, optional, default: 0)
- `size` (number, optional, default: 20, max: 100)
- `role` (string, optional, filter by: ADMIN, STAFF, AGENT)
- `isActive` (boolean, optional, filter by active status)
- `search` (string, optional, search username, email, fullName)
- `sort` (string, optional, e.g., "createdAt,desc")

**Example Request**:
```
GET /api/v1/users?page=0&size=20&role=AGENT&isActive=true&sort=createdAt,desc
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 5,
      "username": "amit.agent",
      "email": "amit@mailit.com",
      "fullName": "Amit Kumar",
      "phone": "+919876543211",
      "roles": ["AGENT"],
      "isActive": true,
      "createdAt": "2025-10-08T10:00:00Z",
      "lastLogin": "2025-10-08T11:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

---

### GET /users/{id}

Get user details by ID.

**Access**: ADMIN only

**Response** (200 OK):
```json
{
  "id": 5,
  "username": "amit.agent",
  "email": "amit@mailit.com",
  "fullName": "Amit Kumar",
  "phone": "+919876543211",
  "roles": ["AGENT"],
  "isActive": true,
  "createdAt": "2025-10-08T10:00:00Z",
  "lastLogin": "2025-10-08T11:30:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User does not exist

---

### PUT /users/{id}

Update user details.

**Access**: ADMIN only

**Request Body**:
```json
{
  "fullName": "Amit Kumar Singh",
  "phone": "+919876543299",
  "email": "amit.updated@mailit.com",
  "roles": ["AGENT", "STAFF"],
  "isActive": true
}
```

**Response** (200 OK):
```json
{
  "id": 5,
  "username": "amit.agent",
  "email": "amit.updated@mailit.com",
  "fullName": "Amit Kumar Singh",
  "phone": "+919876543299",
  "roles": ["AGENT", "STAFF"],
  "isActive": true,
  "createdAt": "2025-10-08T10:00:00Z",
  "lastLogin": "2025-10-08T11:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (e.g., email already exists)
- `403 Forbidden`: Attempting to modify own account or last admin

---

### PATCH /users/{id}/password

Reset user password (admin-only manual reset).

**Access**: ADMIN only

**Request Body**:
```json
{
  "newPassword": "NewPassword@123"
}
```

**Response** (204 No Content):
```
(empty body)
```

**Note**: This invalidates all existing refresh tokens for the user.

---

### GET /users/agents

List all active agent users (for delivery sheet assignment).

**Access**: ADMIN, STAFF roles

**Query Parameters**:
- `isActive` (boolean, optional, default: true)
- `search` (string, optional, search in fullName)

**Example Request**:
```
GET /api/v1/users/agents?isActive=true
```

**Response** (200 OK):
```json
[
  {
    "id": 5,
    "username": "amit.agent",
    "email": "amit@mailit.com",
    "fullName": "Amit Kumar",
    "phone": "+919876543211",
    "roles": ["AGENT"],
    "isActive": true,
    "createdAt": "2025-10-08T10:00:00Z",
    "lastLogin": "2025-10-08T11:30:00Z"
  },
  {
    "id": 7,
    "username": "rajesh.agent",
    "email": "rajesh@mailit.com",
    "fullName": "Rajesh Sharma",
    "phone": "+919876543212",
    "roles": ["AGENT"],
    "isActive": true,
    "createdAt": "2025-10-08T10:15:00Z",
    "lastLogin": "2025-10-08T09:00:00Z"
  }
]
```

---

## Delivery Sheets

### POST /delivery-sheets

Create a new delivery sheet assigned to an agent.

**Access**: ADMIN, STAFF roles

**Request Body**:
```json
{
  "title": "Mumbai West Route - Oct 8, 2025",
  "assignedAgentId": 5,
  "scheduledDate": "2025-10-09",
  "notes": "Deliver before 5 PM",
  "orderIds": [101, 102, 103]
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "sheetNumber": "DS1A2B3C4D",
  "title": "Mumbai West Route - Oct 8, 2025",
  "status": "OPEN",
  "assignedAgentId": 5,
  "assignedAgentName": "Amit Kumar",
  "totalOrders": 3,
  "totalCodAmount": 5000.00,
  "scheduledDate": "2025-10-09",
  "notes": "Deliver before 5 PM",
  "createdAt": "2025-10-08T12:00:00Z",
  "updatedAt": "2025-10-08T12:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (e.g., agent not found, agent inactive, agent doesn't have AGENT role)
- `403 Forbidden`: Non-admin/staff user attempting to create DS

---

### GET /delivery-sheets

List all delivery sheets with filters (admin/staff view).

**Access**: ADMIN, STAFF roles

**Query Parameters**:
- `page` (number, optional, default: 0)
- `size` (number, optional, default: 20)
- `assignedAgentId` (number, optional, filter by agent)
- `status` (string, optional, filter by: OPEN, IN_PROGRESS, COMPLETED, CLOSED)
- `sort` (string, optional, default: "createdAt,desc")

**Example Request**:
```
GET /api/v1/delivery-sheets?assignedAgentId=5&status=OPEN&sort=createdAt,desc
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "sheetNumber": "DS1A2B3C4D",
      "title": "Mumbai West Route - Oct 8, 2025",
      "status": "OPEN",
      "assignedAgentId": 5,
      "assignedAgentName": "Amit Kumar",
      "totalOrders": 3,
      "totalCodAmount": 5000.00,
      "scheduledDate": "2025-10-09",
      "notes": "Deliver before 5 PM",
      "createdAt": "2025-10-08T12:00:00Z",
      "updatedAt": "2025-10-08T12:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

---

### GET /delivery-sheets/my

List delivery sheets scoped to authenticated user (agent sees only their own sheets).

**Access**: ADMIN, STAFF, AGENT roles

**Query Parameters**:
- `page` (number, optional, default: 0)
- `size` (number, optional, default: 20)
- `status` (string, optional, filter by status)
- `sort` (string, optional, default: "createdAt,desc")

**Example Request** (as agent):
```
GET /api/v1/delivery-sheets/my?status=OPEN&sort=createdAt,desc
Authorization: Bearer <agent_token>
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "sheetNumber": "DS1A2B3C4D",
      "title": "Mumbai West Route - Oct 8, 2025",
      "status": "OPEN",
      "assignedAgentId": 5,
      "assignedAgentName": "Amit Kumar",
      "totalOrders": 3,
      "totalCodAmount": 5000.00,
      "scheduledDate": "2025-10-09",
      "notes": "Deliver before 5 PM",
      "createdAt": "2025-10-08T12:00:00Z",
      "updatedAt": "2025-10-08T12:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

**Behavior**:
- **AGENT role**: Returns only delivery sheets assigned to the authenticated agent
- **ADMIN/STAFF roles**: Returns all delivery sheets (same as `/delivery-sheets`)

---

## Common Patterns

### Authorization Header

All authenticated endpoints require JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2025-10-08T10:30:00Z",
  "path": "/api/v1/users/123"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST (resource created)
- `204 No Content`: Successful DELETE or operation with no response body
- `400 Bad Request`: Validation error or malformed request
- `401 Unauthorized`: Missing, invalid, or expired authentication token
- `403 Forbidden`: Authenticated but lacks required role/permissions
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Duplicate resource
- `500 Internal Server Error`: Unexpected server error

### Pagination

List endpoints support pagination using query parameters:

```
GET /api/v1/users?page=0&size=20&sort=createdAt,desc
```

Response includes pagination metadata:

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {...}
  },
  "totalElements": 100,
  "totalPages": 5,
  "last": false,
  "first": true,
  "numberOfElements": 20,
  "empty": false
}
```

### JWT Token Structure

**Access Token** (2-hour expiry):
```json
{
  "sub": "1",
  "userId": 1,
  "username": "admin",
  "roles": ["ADMIN", "STAFF", "AGENT"],
  "iat": 1759942716,
  "exp": 1759949916
}
```

**Refresh Token** (7-day expiry):
```json
{
  "sub": "1",
  "userId": 1,
  "iat": 1759942716,
  "exp": 1760547516
}
```

### Role-Based Access Control

The system uses three roles with hierarchical permissions:

| Role | Description | Access Level |
|------|-------------|--------------|
| **ADMIN** | System administrator | Full access to all endpoints including user management |
| **STAFF** | Operations staff | Access to orders, delivery sheets, but no user management |
| **AGENT** | Field delivery agent | Limited to own delivery sheets and profile |

**Role Enforcement**:
- Implemented using Spring Security `@PreAuthorize` annotations
- JWT tokens include user roles
- Frontend guards prevent unauthorized route access

---

## Testing Examples

### Test Authentication

```bash
# Login as admin
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Extract accessToken from response
export TOKEN="eyJhbGciOiJIUzI1NiJ9..."
```

### Test User Creation

```bash
# Create agent user (requires admin token)
curl -X POST http://localhost:8081/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "test.agent",
    "email": "test@mailit.com",
    "fullName": "Test Agent",
    "password": "Agent@123",
    "roles": ["AGENT"],
    "isActive": true
  }'
```

### Test Agent Listing

```bash
# Get active agents (requires admin/staff token)
curl -X GET "http://localhost:8081/api/v1/users/agents?isActive=true" \
  -H "Authorization: Bearer $TOKEN"
```

### Test My Delivery Sheets

```bash
# Login as agent
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test.agent","password":"Agent@123"}'

export AGENT_TOKEN="..."

# Get my delivery sheets (agent sees only their own)
curl -X GET "http://localhost:8081/api/v1/delivery-sheets/my" \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

---

## Environment Configuration

### Development (Port 8081)

```properties
SERVER_PORT=8081
SPRING_PROFILES_ACTIVE=dev
```

### Production (Port 8080)

```properties
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

---

## Changelog

### Version 1.0.0 (October 8, 2025)

**Initial Release** - Epic E10: Minimal RBAC

- ✅ Authentication endpoints (login, refresh)
- ✅ User management CRUD operations (admin only)
- ✅ Role-based access control (ADMIN, STAFF, AGENT)
- ✅ Delivery sheet agent assignment
- ✅ Agent-scoped delivery sheet queries (`/my` endpoint)
- ✅ JWT token authentication with 2-hour access token, 7-day refresh token
- ✅ Password reset functionality (admin-only)
- ✅ Active agent listing for assignment dropdowns

---

**For more details, see**:
- Specification: `specs/013-minimal-rbac-user/spec.md`
- API Contracts: `specs/013-minimal-rbac-user/contracts/api-contracts.md`
- Quickstart Guide: `specs/013-minimal-rbac-user/quickstart.md`
