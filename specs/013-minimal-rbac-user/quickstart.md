# Quickstart Guide: Minimal RBAC Implementation

**Feature**: 013-minimal-rbac-user  
**Date**: October 6, 2025  
**Purpose**: Step-by-step guide to implement and verify RBAC functionality

---

## Prerequisites

- PostgreSQL 15+ running (docker compose up postgres)
- Java 17+ installed
- Node.js 20+ and npm installed
- Backend running on http://localhost:8080
- Frontend running on http://localhost:4200

---

## Phase 1: Database Setup

### Step 1.1: Create Flyway Migrations

Create two migration files:

**File**: `backend/src/main/resources/db/migration/V7__create_rbac_tables.sql`

```sql
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
    
    CONSTRAINT users_username_format CHECK (username ~ '^[a-zA-Z0-9._-]+$'),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT roles_name_format CHECK (name ~ '^[A-Z_]+$')
);

CREATE UNIQUE INDEX idx_roles_name ON roles(name);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Seed roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'Administrator with full access to all features including user management'),
    ('STAFF', 'Staff user with operational access but no user management privileges'),
    ('AGENT', 'Delivery agent with field access limited to assigned delivery sheets')
ON CONFLICT (name) DO NOTHING;
```

**File**: `backend/src/main/resources/db/migration/V8__add_default_admin.sql`

```sql
-- Default admin user for development (REMOVE IN PRODUCTION)
-- Password: 'Admin@123' (BCrypt hashed)
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
```

### Step 1.2: Run Migrations

```bash
cd backend
./gradlew flywayMigrate
```

**Verification**:
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'roles', 'user_roles');

-- Check roles seeded
SELECT * FROM roles;

-- Check default admin user
SELECT username, email, full_name, is_active FROM users WHERE username = 'admin';
```

---

## Phase 2: Backend Implementation

### Step 2.1: Add Dependencies

Add to `backend/build.gradle`:

```gradle
dependencies {
    // Existing dependencies...
    
    // Spring Security + JWT
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
}
```

### Step 2.2: Create Entities

**Minimal**: Create User, Role, UserRole entities (see project structure for file paths)

Key fields:
- User: id, username, email, passwordHash, fullName, phone, isActive, createdAt, lastLogin
- Role: id, name, description
- UserRole: userId, roleId (composite PK)

### Step 2.3: Create Repositories

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
```

### Step 2.4: Configure Security

Create `SecurityConfig.java`:
- Disable CSRF (stateless JWT)
- Configure public endpoints: /api/v1/auth/**
- Require authentication for all other endpoints
- Add JWT filter before UsernamePasswordAuthenticationFilter

Create `JwtTokenProvider.java`:
- generateAccessToken(User) → JWT (2 hours expiry)
- generateRefreshToken(User) → JWT (7 days expiry)
- validateToken(String token) → boolean
- getUserIdFromToken(String token) → Long
- getRolesFromToken(String token) → List<String>

### Step 2.5: Implement Auth Endpoints

**POST /api/v1/auth/login**:
```
1. Validate username/email + password
2. Check user.isActive == true
3. Generate access + refresh tokens
4. Update user.lastLogin
5. Return LoginResponse with tokens + user info
```

**POST /api/v1/auth/refresh**:
```
1. Validate refresh token
2. Extract userId from token
3. Generate new access token
4. Return new access token (keep refresh token same)
```

### Step 2.6: Implement User Management Endpoints

**POST /api/v1/users** (ADMIN only):
```
1. Validate request (username unique, email unique, roles exist)
2. Hash password with BCrypt
3. Create user entity
4. Assign roles via user_roles junction
5. Return UserResponse
```

**GET /api/v1/users** (ADMIN only):
```
1. Apply filters (role, isActive, search)
2. Paginate results
3. Return Page<UserResponse>
```

### Step 2.7: Test Backend

```bash
# Start backend
cd backend
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun

# Test login (in separate terminal)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Expected: 200 OK with accessToken, refreshToken, user object
```

---

## Phase 3: Frontend Implementation

### Step 3.1: Create Auth Models

**File**: `frontend/apps/console-app/src/app/core/models/auth.model.ts`

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}
```

### Step 3.2: Create Auth Service

**File**: `frontend/apps/console-app/src/app/auth/services/auth.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';
  
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role) ?? false;
  }

  private getUserFromStorage(): UserInfo | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
```

### Step 3.3: Create HTTP Interceptor

**File**: `frontend/apps/console-app/src/app/auth/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
```

Register in `app.config.ts`:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    // ...other providers
  ]
};
```

### Step 3.4: Create Route Guards

**File**: `frontend/apps/console-app/src/app/auth/guards/auth.guard.ts`

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

**File**: `frontend/apps/console-app/src/app/auth/guards/role.guard.ts`

```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('ADMIN')) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

export const agentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.hasRole('AGENT') ? true : inject(Router).createUrlTree(['/forbidden']);
};
```

### Step 3.5: Create Login Component

**File**: `frontend/apps/console-app/src/app/auth/login/login.component.ts`

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value as LoginRequest).subscribe({
      next: (response) => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        
        // Redirect based on role
        if (response.user.roles.includes('AGENT')) {
          this.router.navigate(['/my-delivery-sheets']);
        } else {
          this.router.navigate([returnUrl]);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
```

### Step 3.6: Update App Routes

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  
  // Admin-only routes
  {
    path: 'admin/users',
    component: UserListComponent,
    canActivate: [authGuard, adminGuard]
  },
  
  // Agent-only routes
  {
    path: 'my-delivery-sheets',
    component: MyDeliverySheetsComponent,
    canActivate: [authGuard, agentGuard]
  },
  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
```

### Step 3.7: Add Role-Based Menu

Update navigation component template:

```html
<mat-nav-list>
  <a mat-list-item routerLink="/dashboard" *ngIf="authService.isAuthenticated()">
    <mat-icon>dashboard</mat-icon>
    Dashboard
  </a>
  
  <a mat-list-item routerLink="/orders" *ngIf="authService.hasRole('ADMIN') || authService.hasRole('STAFF')">
    <mat-icon>shopping_cart</mat-icon>
    Orders
  </a>
  
  <a mat-list-item routerLink="/delivery-sheets" *ngIf="authService.hasRole('ADMIN') || authService.hasRole('STAFF')">
    <mat-icon>local_shipping</mat-icon>
    Delivery Sheets
  </a>
  
  <a mat-list-item routerLink="/my-delivery-sheets" *ngIf="authService.hasRole('AGENT')">
    <mat-icon>assignment</mat-icon>
    My Delivery Sheets
  </a>
  
  <a mat-list-item routerLink="/admin/users" *ngIf="authService.hasRole('ADMIN')">
    <mat-icon>people</mat-icon>
    User Management
  </a>
  
  <a mat-list-item (click)="authService.logout()" *ngIf="authService.isAuthenticated()">
    <mat-icon>logout</mat-icon>
    Logout
  </a>
</mat-nav-list>
```

---

## Phase 4: Integration & Testing

### Step 4.1: Manual Test Flow

1. **Start services**:
   ```bash
   # Terminal 1: Backend
   cd backend && SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
   
   # Terminal 2: Frontend
   cd frontend && ng serve console-app --port 4200
   ```

2. **Test Admin Login**:
   - Navigate to http://localhost:4200/login
   - Login with username: `admin`, password: `Admin@123`
   - Should redirect to dashboard
   - Check menu: Should see "User Management" link

3. **Create Agent User**:
   - Click "User Management" in menu
   - Click "Create New User" button
   - Fill form:
     - Username: `amit.agent`
     - Email: `amit@mailit.com`
     - Full Name: `Amit Kumar`
     - Password: `Agent@123`
     - Role: AGENT (checkbox)
   - Click "Create User"
   - Should see success message

4. **Test Agent Login**:
   - Logout from admin account
   - Login with username: `amit.agent`, password: `Agent@123`
   - Should redirect to "My Delivery Sheets" page
   - Check menu: Should NOT see "User Management" link
   - Should only see "My Delivery Sheets" and "Profile"

5. **Test Agent Access Control**:
   - While logged in as agent, try to access http://localhost:4200/admin/users
   - Should redirect to "/forbidden" page (403)

### Step 4.2: Minimal Automated Tests

**Test 1: Contract Test - Login Endpoint**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void login_withValidCredentials_returnsTokens() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"Admin@123\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(jsonPath("$.refreshToken").exists())
            .andExpect(jsonPath("$.user.username").value("admin"))
            .andExpect(jsonPath("$.user.roles").isArray());
    }

    @Test
    void login_withInvalidCredentials_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"wrongpass\"}"))
            .andExpect(status().isUnauthorized());
    }
}
```

**Test 2: Contract Test - Create User Endpoint**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@WithMockUser(roles = "ADMIN")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createUser_asAdmin_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test.user\",\"email\":\"test@mail.com\",\"fullName\":\"Test User\",\"password\":\"Test@123\",\"roles\":[\"STAFF\"]}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username").value("test.user"))
            .andExpect(jsonPath("$.roles[0]").value("STAFF"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void createUser_asStaff_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test.user\",\"email\":\"test@mail.com\",\"fullName\":\"Test User\",\"password\":\"Test@123\",\"roles\":[\"STAFF\"]}"))
            .andExpect(status().isForbidden());
    }
}
```

**Test 3: Smoke Integration Test**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class RBACIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void fullFlow_adminCreatesAgent_agentSeesOwnDSOnly() {
        // 1. Admin logs in
        LoginRequest adminLogin = new LoginRequest("admin", "Admin@123");
        ResponseEntity<LoginResponse> adminAuth = restTemplate.postForEntity("/api/v1/auth/login", adminLogin, LoginResponse.class);
        assertThat(adminAuth.getStatusCode()).isEqualTo(HttpStatus.OK);
        String adminToken = adminAuth.getBody().getAccessToken();

        // 2. Admin creates agent user
        CreateUserRequest createAgent = new CreateUserRequest("test.agent", "agent@mail.com", "Test Agent", "Agent@123", List.of("AGENT"));
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        HttpEntity<CreateUserRequest> request = new HttpEntity<>(createAgent, headers);
        ResponseEntity<UserResponse> createResponse = restTemplate.exchange("/api/v1/users", HttpMethod.POST, request, UserResponse.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // 3. Agent logs in
        LoginRequest agentLogin = new LoginRequest("test.agent", "Agent@123");
        ResponseEntity<LoginResponse> agentAuth = restTemplate.postForEntity("/api/v1/auth/login", agentLogin, LoginResponse.class);
        assertThat(agentAuth.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(agentAuth.getBody().getUser().getRoles()).contains("AGENT");

        // 4. Verify agent cannot access admin endpoints
        headers.setBearerAuth(agentAuth.getBody().getAccessToken());
        HttpEntity<?> agentRequest = new HttpEntity<>(headers);
        ResponseEntity<String> forbidden = restTemplate.exchange("/api/v1/users", HttpMethod.GET, agentRequest, String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
```

### Step 4.3: Run Tests

```bash
cd backend
./gradlew test

# Expected: 3 tests pass (2 contract + 1 integration smoke)
```

---

## Phase 5: Delivery Sheet Integration

### Step 5.1: Add Agent Dropdown to DS Creation

Update DeliverySheetService:

```java
public List<UserResponse> getActiveAgents() {
    return userRepository.findByIsActiveAndRoles_Name(true, "AGENT")
        .stream()
        .map(userMapper::toResponse)
        .collect(Collectors.toList());
}
```

Update DS creation form component:

```typescript
export class DeliverySheetFormComponent implements OnInit {
  agents: UserInfo[] = [];

  ngOnInit(): void {
    this.userService.getAgents().subscribe(agents => {
      this.agents = agents;
    });
  }
}
```

Template:
```html
<mat-form-field>
  <mat-label>Assign Agent</mat-label>
  <mat-select formControlName="assignedAgentId">
    <mat-option *ngFor="let agent of agents" [value]="agent.id">
      {{ agent.fullName }} ({{ agent.username }})
    </mat-option>
  </mat-select>
</mat-form-field>
```

### Step 5.2: Implement Agent-Scoped DS Queries

Backend:

```java
@GetMapping("/my-delivery-sheets")
public ResponseEntity<Page<DeliverySheetResponse>> getMyDeliverySheets(
    @AuthenticationPrincipal User currentUser,
    Pageable pageable
) {
    Page<DeliverySheet> sheets = deliverySheetService.getDeliverySheetsForUser(currentUser, pageable);
    return ResponseEntity.ok(sheets.map(deliverySheetMapper::toResponse));
}
```

Service:

```java
public Page<DeliverySheet> getDeliverySheetsForUser(User user, Pageable pageable) {
    if (user.hasRole("AGENT")) {
        return deliverySheetRepository.findByAssignedAgentId(user.getId(), pageable);
    }
    return deliverySheetRepository.findAll(pageable); // ADMIN/STAFF see all
}
```

Frontend:

```typescript
@Component({...})
export class MyDeliverySheetsComponent implements OnInit {
  deliverySheets$: Observable<DeliverySheet[]>;

  ngOnInit(): void {
    this.deliverySheets$ = this.deliverySheetService.getMyDeliverySheets();
  }
}
```

---

## Verification Checklist

✅ **Database**:
- [ ] V7 migration applied (users, roles, user_roles tables exist)
- [ ] V8 migration applied (default admin user exists)
- [ ] 3 roles seeded (ADMIN, STAFF, AGENT)

✅ **Backend**:
- [ ] Login endpoint returns JWT tokens
- [ ] Token validation works (401 on invalid token)
- [ ] ADMIN can create users
- [ ] STAFF cannot create users (403)
- [ ] Agent can only see own DS (scoped queries)
- [ ] 3 minimal tests pass

✅ **Frontend**:
- [ ] Login page works
- [ ] JWT token stored in localStorage
- [ ] Token attached to all HTTP requests
- [ ] Route guards block unauthorized access
- [ ] Admin sees all menu items
- [ ] Agent sees only "My Delivery Sheets"
- [ ] Logout clears tokens

✅ **Integration**:
- [ ] Admin can create agent users
- [ ] DS creation form shows agent dropdown
- [ ] Agents see only their assigned DS
- [ ] Role changes require re-login to take effect

---

## Troubleshooting

### Issue: "401 Unauthorized" on all requests

**Solution**: Check token is being sent in Authorization header:
```bash
# In browser DevTools > Network tab
# Check request headers for: Authorization: Bearer <token>
```

### Issue: Agent sees all delivery sheets

**Solution**: Check backend service applies agent filter:
```java
// DeliverySheetService.java
if (user.hasRole("AGENT")) {
    return repository.findByAssignedAgentId(user.getId());
}
```

### Issue: Flyway migration fails

**Solution**: Drop and recreate database:
```bash
docker compose down -v
docker compose up -d postgres
./gradlew flywayMigrate
```

### Issue: BCrypt password doesn't match

**Solution**: Regenerate hash:
```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("Admin@123");
System.out.println(hash); // Use this in V8 migration
```

---

## Next Steps

After quickstart verification:
1. Run `/tasks` command to generate implementation task list
2. Execute tasks in dependency order
3. Deploy to staging environment
4. Conduct user acceptance testing (UAT)
5. Deploy to production (remember to remove V8 default admin!)

---

**Quickstart Status**: ✅ Complete  
**Next Command**: `/tasks` to generate task breakdown
