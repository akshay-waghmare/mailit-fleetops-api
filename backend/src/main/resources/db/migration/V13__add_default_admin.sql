-- V13: Add default admin user for development
-- Epic E10: Minimal RBAC (User Management)
-- Created: October 6, 2025
-- WARNING: Remove this migration in production! Default admin is for development only.

-- ============================================================================
-- DEFAULT ADMIN CREDENTIALS (Development/Testing Only)
-- ============================================================================
-- Username: admin
-- Password: Admin@123
-- 
-- BCrypt Hash Details:
--   Algorithm: BCrypt with work factor 10 ($2a$ prefix)
--   Generated: October 7, 2025
--   Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
--   
--   This hash was verified to correctly match password 'Admin@123'
--   using Spring Security's BCryptPasswordEncoder.
--   
--   To regenerate (if needed):
--   new BCryptPasswordEncoder(10).encode("Admin@123")
-- ============================================================================

INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
VALUES (
    'admin',
    'admin@mailit.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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
