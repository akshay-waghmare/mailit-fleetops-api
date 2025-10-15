# RBAC Default Credentials

## Development/Testing Admin Account

**⚠️ WARNING: For Development and Testing ONLY! Change in Production!**

### Credentials

```
Username: admin
Password: Admin@123
```

### Details

- **Email**: admin@mailit.com
- **Role**: ADMIN (full system access)
- **Created By**: Flyway migration V13
- **Source Files**: 
  - `backend/src/main/resources/db/migration/V13__add_default_admin.sql`
  - `backend/src/test/resources/test-data.sql` (deprecated)

### Password Hash Information

```
Algorithm: BCrypt
Work Factor: 10
Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

**Verification**: This hash has been tested and verified to correctly match the password "Admin@123" using Spring Security's `BCryptPasswordEncoder`.

### How to Regenerate Hash (if needed)

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String password = "Admin@123";
        String hash = encoder.encode(password);
        
        System.out.println("Hash: " + hash);
        System.out.println("Verification: " + encoder.matches(password, hash));
    }
}
```

### Testing

The auth tests expect this exact username/password combination:
- `AuthControllerTest.java` - Tests login endpoint
- `UserControllerTest.java` - Tests user management with admin privileges
- `RBACIntegrationTest.java` - Tests end-to-end auth flow

### Production Deployment

**CRITICAL**: Before deploying to production:

1. Remove or modify V13 migration
2. Create admin user with strong, unique password
3. Never commit production credentials to version control
4. Use environment variables or secrets management for production passwords

### Troubleshooting

If login fails with status 401:

1. Verify the password hash in the database matches exactly:
   ```sql
   SELECT username, password_hash FROM users WHERE username = 'admin';
   ```

2. The hash should be:
   ```
   $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
   ```

3. If hash doesn't match, re-apply migrations:
   ```bash
   ./gradlew flywayClean flywayMigrate
   ```

4. Test password verification:
   ```bash
   # In backend directory
   ./gradlew bootRun
   # Then test login via curl or Postman
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin@123"}'
   ```

---

**Last Updated**: October 7, 2025  
**Epic**: E10 - Minimal RBAC (User Management)  
**Related Spec**: `specs/013-minimal-rbac-user/`
