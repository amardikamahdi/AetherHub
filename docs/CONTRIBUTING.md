# Contributing to AetherHub

## Prerequisites

- Node.js 18+
- Go 1.25+
- npm or pnpm

## Project Structure

```
aetherhub/
├── frontend/              # Next.js 16 + ShadCN UI + TailwindCSS
│   └── src/
│       ├── app/           # App router pages
│       ├── components/    # React components
│       └── lib/           # Utilities (API client)
├── backend/               # Go Fiber API server
│   ├── cmd/server/        # Entry point
│   └── internal/          # Business logic
│       ├── handlers/      # HTTP handlers
│       ├── models/        # Data models
│       ├── repository/    # Data access (in-memory, Supabase planned)
│       ├── middleware/     # Auth, CORS
│       └── utils/         # JWT, password, codegen
├── docs/                  # Project documentation
└── supabase/              # Supabase config (planned)
```

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev        # http://localhost:3000

# Backend
cd backend
go run cmd/server/main.go   # http://localhost:8080
```

## Available Scripts

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `go run cmd/server/main.go` | Start dev server |
| `go build ./...` | Build all packages |
| `go test ./...` | Run all tests |
| `go vet ./...` | Run linter |

**Note:** Go must be in PATH: `export PATH=$PATH:/usr/local/go/bin`

## Testing

### TDD Workflow (MANDATORY)

1. **RED** — Write test first, verify it fails
2. **GREEN** — Implement minimal code, verify test passes
3. **REFACTOR** — Clean up, ensure no lint errors

### Running Tests

```bash
# Frontend (from frontend/)
./node_modules/.bin/vitest run

# Backend (from backend/)
export PATH=$PATH:/usr/local/go/bin
go test ./...
```

### Test Coverage Target: 80%+

### Writing Tests

- Use `@testing-library/react` for component tests
- Use `vitest` for test runner
- Mock external dependencies (`useAuth`, `useRouter`, `apiClient`)
- Use AAA pattern: Arrange, Act, Assert

## Code Style

- **TypeScript** — strict mode, no `any` in production code
- **Go** — `go fmt`, `go vet` enforced
- **Naming** — camelCase for JS/TS, snake_case for Go
- **Files** — max 400 lines, extract modules for larger files
- **Functions** — max 50 lines, single responsibility

## Roles

| Role | Access |
|------|--------|
| Superadmin | Platform owner, manages all users |
| Admin (KOL Specialist) | Manages jobs, assigns talents |
| Talent | Views assigned jobs, updates progress |
| Brand | Accesses via unique code, approves drafts |

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login (returns JWT) |
| `POST` | `/api/brand/validate/:code` | Validate brand access code |
| `GET` | `/api/brand/access/:code` | Brand dashboard data |

### Protected (JWT required)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/auth/me` | All | Current user profile |
| `GET` | `/api/users` | Admin, Superadmin | List users |
| `POST` | `/api/users` | Admin, Superadmin | Create user |
| `GET` | `/api/users/:id` | Admin, Superadmin | Get user by ID |
| `PUT` | `/api/users/:id` | Admin, Superadmin | Update user |
| `DELETE` | `/api/users/:id` | Admin, Superadmin | Delete user |
| `GET` | `/api/talents` | Admin, Superadmin | List talents |
| `POST` | `/api/talents` | Admin, Superadmin | Create talent |
| `GET` | `/api/talents/:id` | Admin, Superadmin | Get talent by ID |
| `PUT` | `/api/talents/:id` | Admin, Superadmin | Update talent |
| `DELETE` | `/api/talents/:id` | Admin, Superadmin | Delete talent |
| `GET` | `/api/talents/:talentId/social-media` | All | List social media accounts |
| `POST` | `/api/talents/:talentId/social-media` | Talent | Add social media account |
| `PUT` | `/api/social-media/:id` | Talent (owner) | Update social media account |
| `DELETE` | `/api/social-media/:id` | Talent (owner) | Delete social media account |
| `GET` | `/api/jobs` | Admin, Superadmin | List jobs |
| `POST` | `/api/jobs` | Admin, Superadmin | Create job |
| `GET` | `/api/jobs/:id` | Admin, Superadmin | Get job by ID |
| `PUT` | `/api/jobs/:id` | Admin, Superadmin | Update job |
| `DELETE` | `/api/jobs/:id` | Admin, Superadmin | Delete job |
| `POST` | `/api/jobs/:jobId/assignments` | Admin, Superadmin | Assign talent to job |
| `GET` | `/api/jobs/:jobId/assignments` | Admin, Superadmin | List job assignments |
| `DELETE` | `/api/assignments/:id` | Admin, Superadmin | Unassign talent |
| `GET` | `/api/progress/:assignment_id` | All | Get progress for assignment |
| `PUT` | `/api/progress/:assignment_id/step` | Talent | Update progress step |
| `GET` | `/api/jobs/:job_id/progress` | Admin, Superadmin | List job progress |
| `GET` | `/api/dashboard` | Admin, Superadmin | Dashboard summary |

## Frontend Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/admin/dashboard` | Admin | Dashboard with stats and progress overview |
| `/admin/users` | Admin | User management (CRUD) |
| `/admin/talents` | Admin | Talent management (CRUD) |
| `/admin/jobs` | Admin | Job management (CRUD) |
| `/talent/dashboard` | Talent | Talent dashboard |
| `/talent/jobs` | Talent | Assigned jobs list |
| `/talent/jobs/[id]` | Talent | Job detail with progress steps |
| `/talent/social-media` | Talent | Social media account management |
| `/brand/access` | Public | Brand code entry |
| `/brand/dashboard/[code]` | Public | Brand progress view via access code |

## PR Checklist

- [ ] All tests pass (`npm test` / `go test ./...`)
- [ ] No lint errors (`npm run lint` / `go vet ./...`)
- [ ] Build succeeds (`npm run build` / `go build ./...`)
- [ ] No hardcoded secrets
- [ ] No `console.log` in production code
- [ ] New features have tests
