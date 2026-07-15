# Milestone 1: User Journeys

## Source
`.claude/plans/milestone-1-auth-user-management.md`

## User Journeys

### UJ-1: Talent Registration
As a **Talent**, I want to **register with my name, email, and password**, so that **I can create an account and access the platform**.

**Acceptance Criteria:**
- Talent provides name, email, password
- Password is hashed with bcrypt before storage
- Account created with role `talent`
- Returns success response
- Duplicate email returns error

### UJ-2: User Login
As a **User (any role)**, I want to **login with my email and password**, so that **I can access my role-specific dashboard**.

**Acceptance Criteria:**
- User provides email and password
- Returns JWT token on success
- Invalid credentials return error
- Token contains user ID and role

### UJ-3: Get Current User
As a **User**, I want to **retrieve my profile information**, so that **I can see my account details**.

**Acceptance Criteria:**
- Requires valid JWT token
- Returns user profile (id, name, email, role)
- Invalid/expired token returns 401

### UJ-4: Role-Based Access
As a **Superadmin**, I want to **manage all users**, so that **I can control platform access**.

**Acceptance Criteria:**
- Superadmin can list all users with pagination
- Superadmin can view user details
- Superadmin can update user info
- Superadmin can soft-delete users
- Non-superadmin gets 403 on these endpoints

### UJ-5: Brand Access via Code
As a **Brand**, I want to **access my dashboard using a unique code**, so that **I can view assigned jobs without creating an account**.

**Acceptance Criteria:**
- Brand enters unique code
- System validates code is active
- Returns brand dashboard data
- Invalid code returns error
