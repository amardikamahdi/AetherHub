# Contributing to AetherHub

## Prerequisites

- Node.js 18+
- Go 1.22+
- npm or pnpm

## Project Structure

```
aetherhub/
├── frontend/          # Next.js 14 + ShadCN UI + TailwindCSS
│   ├── src/app/       # App router pages
│   ├── src/components/# React components
│   └── src/lib/       # Utilities (API client)
└── backend/           # Go Fiber API server
    ├── cmd/server/    # Entry point
    └── internal/      # Business logic
        ├── handlers/  # HTTP handlers
        ├── models/    # Data models
        ├── repository/# Data access (in-memory, Supabase planned)
        ├── middleware/# Auth, CORS
        └── utils/     # JWT, password, codegen
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

## PR Checklist

- [ ] All tests pass (`npm test` / `go test ./...`)
- [ ] No lint errors (`npm run lint` / `go vet ./...`)
- [ ] Build succeeds (`npm run build` / `go build ./...`)
- [ ] No hardcoded secrets
- [ ] No `console.log` in production code
- [ ] New features have tests
