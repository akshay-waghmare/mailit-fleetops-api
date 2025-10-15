-- V12: Create RBAC tables (users, roles, user_roles)
-- Epic E10: Minimal RBAC (User Management)
-- Created: October 6, 2025

-- Create users table
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

-- Create roles table
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

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    PRIMARY KEY (user_id, role_id)
);

-- Indexes for junction table
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Comments
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';

-- Seed fixed roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'Administrator with full access to all features including user management'),
    ('STAFF', 'Staff user with operational access but no user management privileges'),
    ('AGENT', 'Delivery agent with field access limited to assigned delivery sheets')
ON CONFLICT (name) DO NOTHING;
