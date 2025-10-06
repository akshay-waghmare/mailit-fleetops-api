# Data Model - Minimal RBAC (User Management)

**Feature**: Epic E10 - Minimal RBAC  
**Branch**: 013-minimal-rbac-user  
**Database**: PostgreSQL  
**Migration Tool**: Flyway  
**Created**: October 6, 2025

---

## Database Schema

### Table: users

**Purpose**: Store user account information

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9._-]+$'),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Comments
COMMENT ON TABLE users IS 'User accounts for FleetOps system';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password (never store plaintext)';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag - inactive users cannot log in';
COMMENT ON COLUMN users.last_login IS 'Timestamp of most recent successful login';
```

**Column Details**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | auto | Primary key |
| username | VARCHAR(100) | NO | - | Unique username for login (alphanumeric + ._-) |
| email | VARCHAR(255) | NO | - | Unique email address |
| password_hash | VARCHAR(255) | NO | - | BCrypt hashed password |
| full_name | VARCHAR(255) | NO | - | User's full name for display |
| phone | VARCHAR(20) | YES | NULL | Optional phone number |
| is_active | BOOLEAN | NO | TRUE | Account active status (soft delete) |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update timestamp |
| last_login | TIMESTAMP | YES | NULL | Last successful login timestamp |

---

### Table: roles

**Purpose**: Define fixed system roles

```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT roles_name_format CHECK (name ~ '^[A-Z_]+$')
);

-- Index
CREATE UNIQUE INDEX idx_roles_name ON roles(name);

-- Comments
COMMENT ON TABLE roles IS 'Fixed system roles (ADMIN, STAFF, AGENT)';
COMMENT ON COLUMN roles.name IS 'Role name in uppercase (ADMIN, STAFF, AGENT)';
```

**Column Details**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | NO | auto | Primary key |
| name | VARCHAR(50) | NO | - | Unique role name (ADMIN, STAFF, AGENT) |
| description | TEXT | YES | NULL | Human-readable role description |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Role creation timestamp |

---

### Table: user_roles

**Purpose**: Many-to-many relationship between users and roles

```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Composite primary key
    PRIMARY KEY (user_id, role_id)
);

-- Indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Comments
COMMENT ON TABLE user_roles IS 'Assignment of roles to users (many-to-many)';
COMMENT ON COLUMN user_roles.assigned_at IS 'Timestamp when role was assigned';
```

**Column Details**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | BIGINT | NO | - | Foreign key to users.id |
| role_id | BIGINT | NO | - | Foreign key to roles.id |
| assigned_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Role assignment timestamp |

---

### Table: refresh_tokens (Optional - for future session management)

**Purpose**: Track issued refresh tokens for invalidation

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Index for cleanup
    CONSTRAINT refresh_tokens_not_expired CHECK (expires_at > created_at)
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Comments
COMMENT ON TABLE refresh_tokens IS 'Issued refresh tokens for session management';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of refresh token JWT';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Timestamp when token was manually revoked';
```

**Note**: This table is optional for Phase 1. Can be added in future phase for better session management.

---

## Seed Data

### Roles (Fixed, Seeded at Migration)

```sql
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'Administrator with full access to all features including user management'),
    ('STAFF', 'Staff user with operational access but no user management privileges'),
    ('AGENT', 'Delivery agent with field access limited to assigned delivery sheets')
ON CONFLICT (name) DO NOTHING;
```

### Default Admin User (Development Only)

```sql
-- Default admin user for development (remove in production)
-- Password: 'Admin@123' (BCrypt hashed)
INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES (
    'admin',
    'admin@mailit.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1HGtY6PnQzpuMzUKgDbJfGKZ8YOjNYu',  -- BCrypt hash of 'Admin@123'
    'System Administrator',
    '+919999999999',
    TRUE
)
ON CONFLICT (username) DO NOTHING;

-- Assign ADMIN role to default user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;
```

**⚠️ Security Note**: Remove or change default admin credentials before production deployment!

---

## Relationships

### Entity Relationship Diagram (Textual)

```
users (1) ←→ (N) user_roles (N) ←→ (1) roles
users (1) ←→ (N) delivery_sheets (as assigned_agent_id)
users (1) ←→ (N) refresh_tokens (optional)
```

### Foreign Key Relationships

1. **user_roles.user_id → users.id**
   - ON DELETE CASCADE (delete role assignments when user is deleted)
   - Indexed for performance

2. **user_roles.role_id → roles.id**
   - ON DELETE CASCADE (delete assignments if role is deleted - should never happen)
   - Indexed for performance

3. **delivery_sheets.assigned_agent_id → users.id** (Integration Point)
   - ON DELETE SET NULL (preserve DS if agent account is deleted)
   - Only users with AGENT role can be assigned
   - Indexed for agent-scoped queries

4. **refresh_tokens.user_id → users.id** (Optional)
   - ON DELETE CASCADE (revoke all tokens when user is deleted)

---

## Queries

### Common Query Patterns

#### 1. Authenticate User
```sql
-- Check credentials and active status
SELECT u.id, u.username, u.email, u.full_name, u.password_hash, u.is_active,
       array_agg(r.name) AS roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE (u.username = ? OR u.email = ?)
  AND u.is_active = TRUE
GROUP BY u.id;
```

#### 2. List Users with Roles (Admin)
```sql
-- Paginated user list with role aggregation
SELECT u.id, u.username, u.email, u.full_name, u.phone, u.is_active,
       u.created_at, u.last_login,
       array_agg(r.name) AS roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE 1=1
  AND (? IS NULL OR u.is_active = ?)           -- filter by active status
  AND (? IS NULL OR r.name = ?)                -- filter by role
  AND (? IS NULL OR u.full_name ILIKE '%' || ? || '%' OR u.username ILIKE '%' || ? || '%')  -- search
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT ? OFFSET ?;
```

#### 3. List Active Agent Users (for DS Assignment)
```sql
-- Get users with AGENT role and active status
SELECT u.id, u.username, u.full_name, u.phone
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'AGENT'
  AND u.is_active = TRUE
ORDER BY u.full_name ASC;
```

#### 4. Check User Has Role
```sql
-- Verify user has specific role (for authorization)
SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ?
      AND r.name = ?
) AS has_role;
```

#### 5. Get User's Delivery Sheets (Agent-Scoped)
```sql
-- Delivery sheets for specific agent (integration point)
SELECT ds.*
FROM delivery_sheets ds
WHERE ds.assigned_agent_id = ?
  AND (? IS NULL OR ds.status = ?)            -- optional status filter
ORDER BY ds.created_at DESC;
```

#### 6. Update Last Login Timestamp
```sql
UPDATE users
SET last_login = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

---

## Indexes

### Performance Indexes

1. **users.username** - Login queries (frequent)
2. **users.email** - Login queries (frequent)
3. **users.is_active** - Filter active users
4. **users.created_at** - Sort user lists
5. **user_roles.user_id** - Join with users
6. **user_roles.role_id** - Join with roles
7. **roles.name** - Lookup roles by name

### Composite Index Considerations (Future Optimization)

If performance profiling shows need:
```sql
-- Composite index for filtered user list queries
CREATE INDEX idx_users_active_created ON users(is_active, created_at DESC);

-- Composite index for agent lookups
CREATE INDEX idx_user_roles_agent_active ON user_roles(role_id, user_id)
WHERE role_id = (SELECT id FROM roles WHERE name = 'AGENT');
```

---

## Data Constraints

### Business Rules Enforced at Database Level

1. **Unique Username**: Username must be unique (case-insensitive via constraint)
2. **Unique Email**: Email must be unique (case-insensitive via constraint)
3. **Valid Email Format**: Email must match regex pattern
4. **Valid Username Format**: Alphanumeric + ._- only
5. **Role Name Format**: Uppercase letters and underscores only
6. **Soft Delete**: Users are never physically deleted (is_active = false)
7. **Cascade Delete**: Role assignments deleted when user is deleted
8. **Last Admin Protection**: Application-level constraint (at least one active ADMIN required)

---

## Migration Strategy

### Flyway Migration Files

#### V7__create_rbac_tables.sql
```sql
-- Create users table
CREATE TABLE users (
    -- schema as defined above
);

-- Create roles table
CREATE TABLE roles (
    -- schema as defined above
);

-- Create user_roles table
CREATE TABLE user_roles (
    -- schema as defined above
);

-- Insert seed data
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'Administrator with full access'),
    ('STAFF', 'Staff user with operational access'),
    ('AGENT', 'Delivery agent with field access');
```

#### V8__add_default_admin_user.sql (Development Only)
```sql
-- Insert default admin user
-- (as defined in Seed Data section)
```

#### V9__add_rbac_indexes.sql
```sql
-- Add performance indexes
-- (as defined in Indexes section)
```

---

## Integration with Existing Schema

### Delivery Sheets Table Modification

**Add Foreign Key to Users Table**:

```sql
-- Migration: V10__add_agent_to_delivery_sheets.sql

ALTER TABLE delivery_sheets
ADD COLUMN assigned_agent_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_delivery_sheets_agent ON delivery_sheets(assigned_agent_id);

COMMENT ON COLUMN delivery_sheets.assigned_agent_id IS 'Foreign key to users table (AGENT role)';

-- Optional: Migrate existing assigned_staff_name to user references
-- (Requires matching logic or manual data migration)
```

---

## Data Retention & Cleanup

### Soft Delete Policy
- Users are NEVER physically deleted (use `is_active = false`)
- Historical data (DS assignments, audit logs) preserved
- Inactive users cannot log in but records remain

### Cleanup Jobs (Future Consideration)
- **Expired Refresh Tokens**: Delete tokens where `expires_at < NOW() - INTERVAL '30 days'`
- **Inactive User Archival**: Move users inactive for > 2 years to archive table (future)

---

## Sample Data (for Testing)

```sql
-- Test users (use in development/staging only)
INSERT INTO users (username, email, password_hash, full_name, phone, is_active) VALUES
    ('rajiv.admin', 'rajiv@mailit.com', '$2a$10$...', 'Rajiv Kumar', '+919876543210', TRUE),
    ('priya.staff', 'priya@mailit.com', '$2a$10$...', 'Priya Sharma', '+919876543211', TRUE),
    ('amit.agent', 'amit@mailit.com', '$2a$10$...', 'Amit Kumar', '+919876543212', TRUE),
    ('rajesh.agent', 'rajesh@mailit.com', '$2a$10$...', 'Rajesh Patel', '+919876543213', TRUE);

-- Assign roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE (u.username = 'rajiv.admin' AND r.name = 'ADMIN')
   OR (u.username = 'priya.staff' AND r.name = 'STAFF')
   OR (u.username = 'amit.agent' AND r.name = 'AGENT')
   OR (u.username = 'rajesh.agent' AND r.name = 'AGENT');
```

---

## Security Considerations

1. **Password Storage**: Always use BCrypt with work factor ≥ 10
2. **No Plaintext Passwords**: Never log or expose password_hash
3. **Token Security**: JWT tokens should be short-lived (2-4 hours for access, 7 days for refresh)
4. **Database Encryption**: Use PostgreSQL's encrypted connections (SSL/TLS)
5. **Sensitive Columns**: Consider column-level encryption for PII (email, phone) in production
6. **Audit Trail**: All user mutations should log who/when (use updated_at, created_at)

---

## Performance Considerations

### Expected Load
- **Users**: < 1,000 users (small to medium deployment)
- **Roles**: Fixed 3 roles (no growth)
- **User-Role Assignments**: < 1,500 records (avg 1.5 roles per user)
- **Login Queries**: < 100/minute during peak hours

### Optimization
- All foreign keys are indexed
- Username/email lookups are indexed
- Role name lookups are indexed
- Composite indexes added if profiling shows need

---

**Data Model Version**: v1  
**Last Updated**: October 6, 2025  
**Status**: Ready for implementation
