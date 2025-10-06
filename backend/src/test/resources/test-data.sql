-- Test data seeder - Replicates V12 and V13 migrations for test environment
-- Epic E10: Minimal RBAC (User Management)

-- Create roles (from V12__create_rbac_tables.sql)
INSERT INTO roles (name, description, created_at) VALUES
    ('ADMIN', 'Administrator with full system access', CURRENT_TIMESTAMP),
    ('STAFF', 'Staff user with standard permissions', CURRENT_TIMESTAMP),
    ('AGENT', 'Delivery agent with limited permissions', CURRENT_TIMESTAMP);

-- Create default admin user (from V13__add_default_admin.sql)
-- Password: Admin@123 (BCrypt hashed)
INSERT INTO users (username, email, password_hash, full_name, is_active, created_at, updated_at)
VALUES ('admin', 'admin@mailit.com', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMye1M7tPmzGBjthJd0Y3qhHqJ.bZx3gR5K',
        'System Administrator', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN';
