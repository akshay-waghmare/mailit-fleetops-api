# API Contracts - Minimal RBAC (User Management)

**Feature**: Epic E10 - Minimal RBAC  
**Branch**: 013-minimal-rbac-user  
**Version**: v1  
**Created**: October 6, 2025

---

## Authentication Endpoints

### POST /api/v1/auth/login
**Purpose**: Authenticate user and issue JWT tokens  
**Access**: Public (no authentication required)

**Request**:
```json
{
  "username": "string (required, email or username)",
  "password": "string (required)"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)",
  "expiresIn": "number (seconds)",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "roles": ["ADMIN" | "STAFF" | "AGENT"]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials or inactive account
  ```json
  {
    "error": "AUTHENTICATION_FAILED",
    "message": "Invalid username or password"
  }
  ```
- `403 Forbidden`: Account inactive
  ```json
  {
    "error": "ACCOUNT_INACTIVE",
    "message": "Account is inactive. Contact administrator."
  }
  ```

---

### POST /api/v1/auth/refresh
**Purpose**: Refresh expired access token using valid refresh token  
**Access**: Public (no authentication required, but requires valid refresh token)

**Request**:
```json
{
  "refreshToken": "string (JWT)"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "string (new JWT)",
  "expiresIn": "number (seconds)"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token
  ```json
  {
    "error": "INVALID_TOKEN",
    "message": "Refresh token is invalid or expired"
  }
  ```

---

### POST /api/v1/auth/logout
**Purpose**: Invalidate refresh token (optional - for future session management)  
**Access**: Authenticated (any role)

**Request**:
```json
{
  "refreshToken": "string (JWT)"
}
```

**Response (204 No Content)**:
```
(empty body)
```

---

## User Management Endpoints (ADMIN only)

### POST /api/v1/users
**Purpose**: Create new user account  
**Access**: ADMIN role only

**Request**:
```json
{
  "username": "string (required, alphanumeric + underscore/dot)",
  "email": "string (required, valid email)",
  "fullName": "string (required)",
  "phone": "string (optional)",
  "password": "string (required, will be hashed)",
  "roles": ["ADMIN" | "STAFF" | "AGENT"] (required, array of role names),
  "isActive": "boolean (optional, default: true)"
}
```

**Response (201 Created)**:
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string | null",
  "roles": ["ADMIN"],
  "isActive": true,
  "createdAt": "string (ISO 8601 timestamp)",
  "lastLogin": null
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Username already exists",
    "fields": {
      "username": "Username 'amit.kumar' is already taken"
    }
  }
  ```
- `403 Forbidden`: Non-admin user
  ```json
  {
    "error": "ACCESS_DENIED",
    "message": "User management requires ADMIN role"
  }
  ```

---

### GET /api/v1/users
**Purpose**: List all users with pagination and filters  
**Access**: ADMIN role only

**Query Parameters**:
- `page` (number, optional, default: 0)
- `size` (number, optional, default: 20, max: 100)
- `role` (string, optional, filter by role: ADMIN, STAFF, AGENT)
- `isActive` (boolean, optional, filter by active status)
- `search` (string, optional, search in username, email, fullName)
- `sort` (string, optional, e.g., "createdAt,desc" or "username,asc")

**Response (200 OK)**:
```json
{
  "content": [
    {
      "id": 1,
      "username": "rajiv.admin",
      "email": "rajiv@mailit.com",
      "fullName": "Rajiv Kumar",
      "phone": "+919876543210",
      "roles": ["ADMIN"],
      "isActive": true,
      "createdAt": "2025-10-01T10:00:00Z",
      "lastLogin": "2025-10-06T09:30:00Z"
    },
    {
      "id": 2,
      "username": "amit.agent",
      "email": "amit@mailit.com",
      "fullName": "Amit Kumar",
      "phone": "+919876543211",
      "roles": ["AGENT"],
      "isActive": true,
      "createdAt": "2025-10-02T11:00:00Z",
      "lastLogin": "2025-10-06T08:00:00Z"
    }
  ],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 25,
    "totalPages": 2
  }
}
```

---

### GET /api/v1/users/{id}
**Purpose**: Get user details by ID  
**Access**: ADMIN role only

**Response (200 OK)**:
```json
{
  "id": 1,
  "username": "rajiv.admin",
  "email": "rajiv@mailit.com",
  "fullName": "Rajiv Kumar",
  "phone": "+919876543210",
  "roles": ["ADMIN", "STAFF"],
  "isActive": true,
  "createdAt": "2025-10-01T10:00:00Z",
  "lastLogin": "2025-10-06T09:30:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User does not exist
  ```json
  {
    "error": "USER_NOT_FOUND",
    "message": "User with ID 999 not found"
  }
  ```

---

### PUT /api/v1/users/{id}
**Purpose**: Update user details  
**Access**: ADMIN role only

**Request**:
```json
{
  "fullName": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "roles": ["ADMIN" | "STAFF" | "AGENT"] (optional),
  "isActive": "boolean (optional)"
}
```

**Response (200 OK)**:
```json
{
  "id": 2,
  "username": "amit.agent",
  "email": "amit.updated@mailit.com",
  "fullName": "Amit Kumar Singh",
  "phone": "+919876543299",
  "roles": ["AGENT"],
  "isActive": true,
  "createdAt": "2025-10-02T11:00:00Z",
  "lastLogin": "2025-10-06T08:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (e.g., email already exists)
- `403 Forbidden`: Attempting to modify own account or last admin
  ```json
  {
    "error": "OPERATION_NOT_ALLOWED",
    "message": "Cannot deactivate your own admin account"
  }
  ```

---

### PATCH /api/v1/users/{id}/password
**Purpose**: Reset user password (admin-only, manual reset)  
**Access**: ADMIN role only

**Request**:
```json
{
  "newPassword": "string (required)"
}
```

**Response (204 No Content)**:
```
(empty body)
```

**Note**: This invalidates all existing refresh tokens for the user.

---

### DELETE /api/v1/users/{id}
**Purpose**: Deactivate user account (soft delete)  
**Access**: ADMIN role only

**Response (204 No Content)**:
```
(empty body)
```

**Error Responses**:
- `403 Forbidden`: Attempting to delete own account or last admin
  ```json
  {
    "error": "OPERATION_NOT_ALLOWED",
    "message": "Cannot delete your own admin account"
  }
  ```

---

## Role Management Endpoints

### GET /api/v1/roles
**Purpose**: List all available roles  
**Access**: ADMIN, STAFF roles

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "ADMIN",
    "description": "Administrator with full access"
  },
  {
    "id": 2,
    "name": "STAFF",
    "description": "Staff user with operational access"
  },
  {
    "id": 3,
    "name": "AGENT",
    "description": "Delivery agent with field access"
  }
]
```

---

## User Profile Endpoints

### GET /api/v1/users/me
**Purpose**: Get current authenticated user's profile  
**Access**: Authenticated (any role)

**Response (200 OK)**:
```json
{
  "id": 5,
  "username": "amit.agent",
  "email": "amit@mailit.com",
  "fullName": "Amit Kumar",
  "phone": "+919876543211",
  "roles": ["AGENT"],
  "isActive": true,
  "createdAt": "2025-10-02T11:00:00Z",
  "lastLogin": "2025-10-06T08:00:00Z"
}
```

---

### PATCH /api/v1/users/me/password
**Purpose**: Change own password (self-service)  
**Access**: Authenticated (any role)

**Request**:
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required)"
}
```

**Response (204 No Content)**:
```
(empty body)
```

**Error Responses**:
- `401 Unauthorized`: Current password incorrect
  ```json
  {
    "error": "INVALID_PASSWORD",
    "message": "Current password is incorrect"
  }
  ```

---

## Delivery Sheet Integration Endpoints

### GET /api/v1/users/agents
**Purpose**: List all active agent users (for DS assignment dropdown)  
**Access**: ADMIN, STAFF roles

**Query Parameters**:
- `isActive` (boolean, optional, default: true)
- `search` (string, optional, search in fullName)

**Response (200 OK)**:
```json
[
  {
    "id": 5,
    "username": "amit.agent",
    "fullName": "Amit Kumar",
    "phone": "+919876543211",
    "isActive": true
  },
  {
    "id": 7,
    "username": "rajesh.agent",
    "fullName": "Rajesh Sharma",
    "phone": "+919876543212",
    "isActive": true
  }
]
```

---

## JWT Token Structure

### Access Token Claims
```json
{
  "sub": "amit.agent",           // username
  "userId": 5,                   // user ID
  "roles": ["AGENT"],            // list of role names
  "email": "amit@mailit.com",
  "iat": 1696575600,             // issued at (Unix timestamp)
  "exp": 1696590000              // expiration (Unix timestamp)
}
```

### Refresh Token Claims
```json
{
  "sub": "amit.agent",
  "userId": 5,
  "tokenType": "refresh",
  "iat": 1696575600,
  "exp": 1697180400              // longer expiration (e.g., 7 days)
}
```

---

## Common Error Response Format

All error responses follow this structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2025-10-06T10:30:00Z",
  "path": "/api/v1/users/123",
  "fields": {                    // optional, for validation errors
    "fieldName": "Field-specific error message"
  }
}
```

---

## HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST (resource created)
- `204 No Content`: Successful DELETE or operation with no response body
- `400 Bad Request`: Validation error or malformed request
- `401 Unauthorized`: Missing, invalid, or expired authentication token
- `403 Forbidden`: Authenticated but lacks required role/permissions
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Duplicate resource (e.g., username already exists)
- `500 Internal Server Error`: Unexpected server error

---

## Authorization Header

All authenticated endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting (Future Consideration)

Not implemented in this phase, but recommended for production:
- Login endpoint: 5 attempts per 15 minutes per IP
- User creation: 10 requests per hour per admin user
- All other endpoints: 100 requests per minute per user

---

**Contract Version**: v1  
**Last Updated**: October 6, 2025  
**Status**: Ready for implementation
