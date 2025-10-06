-- V13: Add default admin user for development
-- Epic E10: Minimal RBAC (User Management)
-- Created: October 6, 2025
-- WARNING: Remove this migration in production! Default admin is for development only.

-- Default admin user for development
-- Password: 'Admin@123' (BCrypt hashed with work factor 10)
INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES (
    'admin',
    'admin@mailit.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye1HGtY6PnQzpuMzUKgDbJfGKZ8YOjNYu',
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
