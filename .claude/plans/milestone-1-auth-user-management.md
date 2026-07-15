# Milestone 1: Auth & User Management

## Objective

Implementasi sistem autentikasi dan manajemen user untuk 4 role: Superadmin, Administrator, Talent, dan Brand.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 14, ShadCN UI, TailwindCSS |
| Backend | Go (Fiber/Gin) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| State Management | React Context / Zustand |

## Data Model

### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'talent') NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. talent_profiles
```sql
CREATE TABLE talent_profiles (
    id UUID PRIMARY KEY REFERENCES users(id),
    phone VARCHAR(20),
    photo_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. social_media_accounts
```sql
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- instagram, tiktok, youtube, twitter, etc
    username VARCHAR(255) NOT NULL,
    url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. brand_access_codes
```sql
CREATE TABLE brand_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id), -- untuk milestone 3
    brand_name VARCHAR(255) NOT NULL,
    unique_code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Auth Routes
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register talent baru |
| `/api/auth/login` | POST | Public | Login (superadmin, admin, talent) |
| `/api/auth/me` | GET | JWT | Get current user info |
| `/api/auth/logout` | POST | JWT | Invalidate token |

### User Management Routes (Superadmin only)
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/users` | GET | Superadmin | List semua users dengan filter & pagination |
| `/api/users/:id` | GET | Superadmin | Detail user |
| `/api/users/:id` | PUT | Superadmin | Update user |
| `/api/users/:id` | DELETE | Superadmin | Soft delete user |

### Brand Access Routes
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/brand/validate/:code` | POST | Public | Validasi kode unik brand |
| `/api/brand/access/:code` | GET | Code Valid | Akses data brand via kode |

## Frontend Pages

### 1. `/login` — Login Page
- Form: email, password
- Role-based redirect setelah login
- Error handling untuk invalid credentials

### 2. `/register` — Register Talent
- Form: name, email, password, phone
- Auto-redirect ke login setelah register

### 3. `/admin/dashboard` — Admin Dashboard
- Sidebar dengan menu: Dashboard, Jobs, Talents, Settings
- Statistik overview (total jobs, talents, active jobs)
- Quick actions

### 4. `/admin/users` — User Management (Superadmin only)
- Table: list users dengan filter by role
- Actions: edit, delete, create new admin
- Form modal untuk create/edit admin

### 5. `/talent/dashboard` — Talent Dashboard
- Overview: assigned jobs, pending tasks
- Quick access ke job details

### 6. `/brand/access` — Brand Access Page
- Input unique code
- Validate dan redirect ke brand dashboard

### 7. `/brand/dashboard/:code` — Brand Dashboard
- View assigned jobs untuk brand ini
- Approve/reject drafts (untuk milestone 2)

## Project Structure

```
aetherhub/
├── frontend/                    # Next.js
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   └── users/
│   │   ├── talent/
│   │   │   └── dashboard/
│   │   ├── brand/
│   │   │   └── access/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # ShadCN components
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── talent/
│   │   └── brand/
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── auth.ts              # Auth utilities
│   │   └── utils.ts
│   └── providers/
│       └── auth-provider.tsx
│
└── backend/                     # Go
    ├── cmd/
    │   └── server/
    │       └── main.go
    ├── internal/
    │   ├── config/
    │   ├── handlers/
    │   │   ├── auth.go
    │   │   ├── user.go
    │   │   └── brand.go
    │   ├── middleware/
    │   │   ├── auth.go
    │   │   └── cors.go
    │   ├── models/
    │   │   ├── user.go
    │   │   └── brand.go
    │   ├── repository/
    │   │   ├── user.go
    │   │   └── brand.go
    │   ├── services/
    │   │   ├── auth.go
    │   │   ├── user.go
    │   │   └── brand.go
    │   └── utils/
    │       ├── jwt.go
    │       └── password.go
    ├── migrations/
    ├── go.mod
    └── go.sum
```

## Implementation Tasks

### Phase 1: Project Setup (Day 1)
- [ ] Initialize Next.js project dengan ShadCN UI
- [ ] Initialize Go project dengan Fiber/Gin
- [ ] Setup Supabase project dan dapatkan credentials
- [ ] Setup environment variables
- [ ] Setup project structure

### Phase 2: Database & Models (Day 1-2)
- [ ] Create database schema di Supabase
- [ ] Implement Go models (User, TalentProfile, SocialMediaAccount, BrandAccessCode)
- [ ] Setup Supabase client di Go
- [ ] Create migration files

### Phase 3: Auth Backend (Day 2-3)
- [ ] Implement JWT utilities (generate, validate, refresh)
- [ ] Implement password hashing (bcrypt)
- [ ] Create auth middleware (JWT validation, role-based)
- [ ] Implement register endpoint (talent only)
- [ ] Implement login endpoint (all roles)
- [ ] Implement get current user endpoint
- [ ] Create CORS middleware

### Phase 4: User Management Backend (Day 3)
- [ ] Implement list users endpoint (with filter, pagination)
- [ ] Implement get user detail endpoint
- [ ] Implement update user endpoint
- [ ] Implement delete user endpoint (soft delete)
- [ ] Add role-based access control middleware

### Phase 5: Brand Access Backend (Day 3-4)
- [ ] Implement generate unique code utility
- [ ] Implement validate brand code endpoint
- [ ] Implement brand access endpoint

### Phase 6: Frontend Auth (Day 4-5)
- [ ] Create auth provider (context)
- [ ] Create API client dengan interceptors
- [ ] Implement login page
- [ ] Implement register page
- [ ] Implement protected route wrapper
- [ ] Implement role-based redirect

### Phase 7: Frontend Admin (Day 5-6)
- [ ] Create admin layout dengan sidebar
- [ ] Implement admin dashboard page
- [ ] Implement user management table
- [ ] Implement create/edit user modal
- [ ] Implement delete user confirmation

### Phase 8: Frontend Talent (Day 6)
- [ ] Create talent layout
- [ ] Implement talent dashboard page

### Phase 9: Frontend Brand (Day 6-7)
- [ ] Implement brand access page
- [ ] Implement brand dashboard page (basic)

### Phase 10: Testing & Polish (Day 7)
- [ ] Test all auth flows
- [ ] Test role-based access
- [ ] Test brand access flow
- [ ] Fix bugs
- [ ] Code cleanup

## Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest",
    "axios": "latest",
    "zustand": "latest"
  }
}
```

### Backend (go.mod)
```go
require (
    github.com/gofiber/fiber/v2 // atau github.com/gin-gonic/gin
    github.com/supabase-community/supabase-go
    github.com/golang-jwt/jwt/v5
    golang.org/x/crypto
    github.com/google/uuid
    github.com/joho/godotenv
)
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Backend (.env)
```
PORT=8080
SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
JWT_SECRET=xxx
JWT_EXPIRY=24h
```

## Success Criteria

- [ ] Talent bisa register dan login
- [ ] Superadmin dan Admin bisa login
- [ ] Role-based redirect berfungsi
- [ ] Superadmin bisa manage users
- [ ] Brand bisa akses via unique code
- [ ] Protected routes tidak bisa diakses tanpa auth
- [ ] API endpoints terproteksi sesuai role

## Estimated Time

7-8 hari untuk implementasi milestone 1.

---

*Milestone 1 dari 4 — Auth & User Management*
*PRD: .claude/prds/aetherhub-job-talent-management.prd.md*
