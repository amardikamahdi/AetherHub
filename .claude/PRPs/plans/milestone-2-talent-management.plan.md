# Plan: Milestone 2 — Talent Management

## Summary
Add talent management capabilities: Admin can create, view, edit, and delete talent profiles. Talent can add and manage their social media accounts (Instagram, TikTok, YouTube, etc.). Backend APIs + frontend pages for both roles.

## User Story
As an **Admin (KOL Specialist)**, I want to manage talent profiles and see their social media accounts, so that I can assign them to jobs later.

As a **Talent**, I want to add my social media accounts to my profile, so that Admin can assign me to relevant jobs.

## Problem → Solution
**Current**: Admin manages talent via WhatsApp + Google Sheets. No centralized talent directory.
**Solution**: CRUD talent profiles in AetherHub. Talent self-manages social media accounts.

## Metadata
- **Complexity**: Large
- **Source PRD**: `.claude/prds/aetherhub-job-talent-management.prd.md`
- **PRD Phase**: Milestone 2 — Talent Management
- **Estimated Files**: ~20 files

---

## UX Design

### Before
```
┌─────────────────────────────────────────────┐
│  Admin: WhatsApp + Google Sheets            │
│  - Manually track talent info               │
│  - No social media account directory        │
│  - No way for talent to self-serve          │
└─────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────┐
│  Admin Dashboard                            │
│  ┌─────────────────────────────────────┐    │
│  │ Talents  [Create Talent]            │    │
│  │ ┌──────┬──────┬───────┬────────┐    │    │
│  │ │ Name │Email │Phone  │Actions │    │    │
│  │ ├──────┼──────┼───────┼────────┤    │    │
│  │ │ Alice│a@.com│0812.. │E D     │    │    │
│  │ └──────┴──────┴───────┴────────┘    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Talent Dashboard                           │
│  ┌─────────────────────────────────────┐    │
│  │ My Social Media Accounts            │    │
│  │ [+ Add Account]                     │    │
│  │ ┌──────────┬──────────┬────────┐    │    │
│  │ │ Platform │ Username │Actions │    │    │
│  │ ├──────────┼──────────┼────────┤    │    │
│  │ │Instagram │ @alice   │ E D    │    │    │
│  │ │TikTok    │ @alice_tt│ E D    │    │    │
│  │ └──────────┴──────────┴────────┘    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Talent directory | Google Sheets | Admin talent table | CRUD with search/filter |
| Social media tracking | Manual in Sheets | Talent self-manages | Platform + username |
| Talent profile | None | Talent dashboard | View profile + social accounts |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `backend/internal/models/user.go` | all | TalentProfile & SocialMediaAccount models already defined |
| P0 | `backend/internal/repository/user.go` | all | Repository pattern + interface to follow |
| P0 | `backend/internal/handlers/user.go` | all | Handler pattern: repo injection, error responses, pagination |
| P0 | `frontend/src/lib/api.ts` | all | API client pattern to extend |
| P0 | `frontend/src/components/admin/user-table.tsx` | all | Table component pattern to follow |
| P0 | `frontend/src/components/admin/user-modal.tsx` | all | Modal form pattern to follow |
| P0 | `frontend/src/app/admin/users/page.tsx` | all | Admin page pattern: layout, CRUD orchestration |
| P1 | `backend/internal/handlers/user_test.go` | all | Handler test pattern: setupUserApp, httptest |
| P1 | `frontend/src/components/admin/user-table.test.tsx` | all | Frontend test pattern: mock apiClient, waitFor |
| P1 | `backend/internal/middleware/auth.go` | all | Auth + Role middleware |
| P2 | `frontend/src/components/admin/admin-layout.tsx` | all | Nav items — add Talents link |
| P2 | `frontend/src/app/talent/dashboard/page.tsx` | all | Talent dashboard — extend with social accounts |

---

## External Documentation

No external research needed — feature uses established internal patterns (Fiber handlers, in-memory repos, React + Vitest).

---

## Patterns to Mirror

### HANDLER_PATTERN
// SOURCE: backend/internal/handlers/user.go:14-20
```go
type UserHandler struct {
    repo repository.UserRepository
}

func NewUserHandler(repo repository.UserRepository) *UserHandler {
    return &UserHandler{repo: repo}
}
```

### REPOSITORY_INTERFACE
// SOURCE: backend/internal/repository/user.go:13-20
```go
type UserRepository interface {
    Create(user *models.User) error
    GetByID(id string) (*models.User, error)
    GetByEmail(email string) (*models.User, error)
    List(offset, limit int) ([]*models.User, int, error)
    Update(user *models.User) error
    Delete(id string) error
}
```

### INMEMORY_REPO
// SOURCE: backend/internal/repository/user.go:23-33
```go
type InMemoryUserRepository struct {
    mu    sync.RWMutex
    users map[string]*models.User
}

func NewInMemoryUserRepository() *InMemoryUserRepository {
    return &InMemoryUserRepository{
        users: make(map[string]*models.User),
    }
}
```

### ERROR_RESPONSE
// SOURCE: backend/internal/handlers/user.go:33-36
```go
return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
    "success": false,
    "error":   "Failed to list users",
})
```

### SUCCESS_RESPONSE
// SOURCE: backend/internal/handlers/user.go:39-45
```go
return c.Status(http.StatusOK).JSON(fiber.Map{
    "success": true,
    "data":    users,
    "total":   total,
    "offset":  offset,
    "limit":   limit,
})
```

### FRONTEND_TABLE
// SOURCE: frontend/src/components/admin/user-table.tsx
- useState for data, pagination, filters
- useEffect to fetch on page/filter change
- Loading/empty states
- Edit/Delete callbacks via props

### FRONTEND_MODAL
// SOURCE: frontend/src/components/admin/user-modal.tsx
- isOpen, onClose, onSubmit props
- useEffect to populate form on edit
- Controlled inputs with useState
- Cancel + Submit buttons

### FRONTEND_PAGE
// SOURCE: frontend/src/app/admin/users/page.tsx
- AdminLayout wrapper
- Modal open/close state
- refreshKey pattern to re-fetch table after CRUD
- Error handling with alert()

### FRONTEND_TEST
// SOURCE: frontend/src/components/admin/user-table.test.tsx
```typescript
const mockListUsers = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    listUsers: (...args: any[]) => mockListUsers(...args),
  },
}))
```

### HANDLER_TEST
// SOURCE: backend/internal/handlers/user_test.go:15-26
```go
func setupUserApp() (*fiber.App, *UserHandler) {
    app := fiber.New()
    repo := repository.NewInMemoryUserRepository()
    handler := NewUserHandler(repo)
    app.Get("/api/users", handler.List)
    // ...
    return app, handler
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/internal/models/talent.go` | CREATE | Talent-specific request/response types |
| `backend/internal/repository/talent.go` | CREATE | TalentProfile + SocialMediaAccount repos |
| `backend/internal/repository/talent_test.go` | CREATE | Repo unit tests |
| `backend/internal/handlers/talent.go` | CREATE | Talent CRUD endpoints |
| `backend/internal/handlers/talent_test.go` | CREATE | Handler tests |
| `backend/internal/handlers/social_media.go` | CREATE | Social media account CRUD endpoints |
| `backend/internal/handlers/social_media_test.go` | CREATE | Handler tests |
| `backend/cmd/server/main.go` | CREATE | Server entry point (routes + DI) |
| `frontend/src/lib/api.ts` | UPDATE | Add talent + social media API methods |
| `frontend/src/components/admin/talent-table.tsx` | CREATE | Talent list table component |
| `frontend/src/components/admin/talent-table.test.tsx` | CREATE | Table tests |
| `frontend/src/components/admin/talent-modal.tsx` | CREATE | Create/edit talent modal |
| `frontend/src/components/admin/talent-modal.test.tsx` | CREATE | Modal tests |
| `frontend/src/app/admin/talents/page.tsx` | CREATE | Admin talents page |
| `frontend/src/app/admin/talents/page.test.tsx` | CREATE | Page tests |
| `frontend/src/components/talent/social-media-table.tsx` | CREATE | Social media accounts table |
| `frontend/src/components/talent/social-media-table.test.tsx` | CREATE | Table tests |
| `frontend/src/components/talent/social-media-modal.tsx` | CREATE | Add/edit social media modal |
| `frontend/src/components/talent/social-media-modal.test.tsx` | CREATE | Modal tests |
| `frontend/src/app/talent/social-media/page.tsx` | CREATE | Talent social media page |
| `frontend/src/app/talent/social-media/page.test.tsx` | CREATE | Page tests |
| `frontend/src/components/admin/admin-layout.tsx` | UPDATE | Ensure Talents nav link active |
| `frontend/src/components/talent/talent-layout.tsx` | UPDATE | Add Social Media nav link |

---

## NOT Building

- Talent registration flow (already done in Milestone 1)
- Social media verification (manual admin approval for now)
- File upload for talent photos (future milestone)
- Talent search/filter by social media platform (future)
- Bulk talent import (future)

---

## Step-by-Step Tasks

### Task 1: Backend — Talent Models
- **ACTION**: Create talent-specific request/response types
- **IMPLEMENT**: Define `CreateTalentRequest`, `UpdateTalentRequest`, `CreateSocialMediaRequest` in `models/talent.go`
- **MIRROR**: `models/user.go` struct patterns
- **IMPORTS**: `time` package
- **GOTCHA**: TalentProfile already exists in `models/user.go` — extend, don't duplicate
- **VALIDATE**: `go build ./...` passes

### Task 2: Backend — Talent Repository
- **ACTION**: Create `TalentRepository` interface + in-memory implementation
- **IMPLEMENT**: CRUD for TalentProfile (Create, GetByID, GetByUserID, List, Update, Delete). Separate `SocialMediaRepository` for accounts (Create, GetByID, ListByTalentID, Update, Delete)
- **MIRROR**: `repository/user.go` patterns (mutex, map, soft delete, pagination)
- **IMPORTS**: `sync`, `time`, `errors`, `fmt`, `models`
- **GOTCHA**: Use `sync.RWMutex` for thread safety. Soft delete with `DeletedAt`.
- **VALIDATE**: Write `talent_test.go` — Create, GetByID, List pagination, Update, Delete

### Task 3: Backend — Talent Handler
- **ACTION**: Create `TalentHandler` with CRUD endpoints
- **IMPLEMENT**: List (paginated), GetByID, Create (admin only), Update, Delete. Validate required fields (name, email). Only admin/superadmin can create.
- **MIRROR**: `handlers/user.go` patterns (repo injection, error responses, pagination)
- **IMPORTS**: `net/http`, `strconv`, `fiber`, `models`, `repository`, `uuid`
- **GOTCHA**: Use `uuid.New().String()` for IDs. Validate email format with `emailRegex`.
- **VALIDATE**: Write `talent_test.go` — List, GetByID, Create, Update, Delete, 404 cases

### Task 4: Backend — Social Media Handler
- **ACTION**: Create `SocialMediaHandler` for talent's social media accounts
- **IMPLEMENT**: ListByTalentID, Create, Update, Delete. Platform validation (instagram, tiktok, youtube, twitter, facebook). Only the owning talent can modify their accounts.
- **MIRROR**: `handlers/user.go` patterns
- **IMPORTS**: `net/http`, `fiber`, `models`, `repository`, `uuid`
- **GOTCHA**: Verify talent ownership — talent can only manage their own accounts. Use `c.Locals("userID")` from auth middleware.
- **VALIDATE**: Write `social_media_test.go` — CRUD + ownership check

### Task 5: Backend — Server Entry Point
- **ACTION**: Create `cmd/server/main.go` with routes and dependency injection
- **IMPLEMENT**: Initialize repos, handlers, middleware. Wire routes:
  - `POST /api/auth/register` — public
  - `POST /api/auth/login` — public
  - `GET /api/auth/me` — authenticated
  - `GET/POST /api/users` — admin only
  - `GET/PUT/DELETE /api/users/:id` — admin only
  - `GET/POST /api/talents` — admin only
  - `GET/PUT/DELETE /api/talents/:id` — admin only
  - `GET/POST /api/talents/:id/social-media` — talent owns, admin can view
  - `PUT/DELETE /api/social-media/:id` — talent owns
- **MIRROR**: Existing handler/wire patterns
- **IMPORTS**: `fiber`, `godotenv`, `handlers`, `middleware`, `repository`
- **GOTCHA**: Load JWT_SECRET from env. Use `os.Getenv`.
- **VALIDATE**: `go run cmd/server/main.go` starts without error

### Task 6: Frontend — API Client Extensions
- **ACTION**: Add talent and social media methods to `api.ts`
- **IMPLEMENT**:
  - `listTalents(offset, limit)` — GET /api/talents
  - `createTalent(data)` — POST /api/talents
  - `updateTalent(id, data)` — PUT /api/talents/:id
  - `deleteTalent(id)` — DELETE /api/talents/:id
  - `listSocialMedia(talentId)` — GET /api/talents/:id/social-media
  - `createSocialMedia(talentId, data)` — POST /api/talents/:id/social-media
  - `updateSocialMedia(id, data)` — PUT /api/social-media/:id
  - `deleteSocialMedia(id)` — DELETE /api/social-media/:id
- **MIRROR**: Existing `listUsers`, `createUser` patterns
- **IMPORTS**: None — extend existing class
- **GOTCHA**: Keep `any` types consistent with existing code (fix later in polish)
- **VALIDATE**: `npm run build` passes

### Task 7: Frontend — Talent Table Component
- **ACTION**: Create `talent-table.tsx` for admin view
- **IMPLEMENT**: Table with Name, Email, Phone, Actions columns. Pagination. Fetch via `apiClient.listTalents`.
- **MIRROR**: `user-table.tsx` patterns (useState, useEffect, loading/empty states)
- **IMPORTS**: `react`, `@/lib/api`
- **GOTCHA**: Use same PAGE_SIZE (20) pattern
- **VALIDATE**: Write `talent-table.test.tsx` — renders data, pagination, edit/delete callbacks

### Task 8: Frontend — Talent Modal Component
- **ACTION**: Create `talent-modal.tsx` for create/edit
- **IMPLEMENT**: Form with Name, Email, Phone fields. Password only on create.
- **MIRROR**: `user-modal.tsx` patterns (isOpen, onClose, onSubmit, useEffect populate)
- **IMPORTS**: `react`
- **GOTCHA**: Email validation on submit
- **VALIDATE**: Write `talent-modal.test.tsx` — create mode, edit mode, validation

### Task 9: Frontend — Admin Talents Page
- **ACTION**: Create `/admin/talents/page.tsx`
- **IMPLEMENT**: AdminLayout + TalentTable + TalentModal. CRUD orchestration with refreshKey.
- **MIRROR**: `app/admin/users/page.tsx` patterns
- **IMPORTS**: `AdminLayout`, `TalentTable`, `TalentModal`, `apiClient`
- **GOTCHA**: Handle create/edit/delete with try/catch + alert
- **VALIDATE**: Write `page.test.tsx` — create, edit, delete flows

### Task 10: Frontend — Social Media Table Component
- **ACTION**: Create `social-media-table.tsx` for talent view
- **IMPLEMENT**: Table with Platform, Username, URL, Actions columns. Fetch via `apiClient.listSocialMedia`.
- **MIRROR**: `user-table.tsx` patterns
- **IMPORTS**: `react`, `@/lib/api`
- **GOTCHA**: Platform display should be capitalized (Instagram, TikTok)
- **VALIDATE**: Write `social-media-table.test.tsx` — renders, edit/delete

### Task 11: Frontend — Social Media Modal Component
- **ACTION**: Create `social-media-modal.tsx` for add/edit
- **IMPLEMENT**: Form with Platform dropdown (instagram, tiktok, youtube, twitter, facebook), Username, URL (optional).
- **MIRROR**: `user-modal.tsx` patterns
- **IMPORTS**: `react`
- **GOTCHA**: Username required, URL optional
- **VALIDATE**: Write `social-media-modal.test.tsx` — create, edit

### Task 12: Frontend — Talent Social Media Page
- **ACTION**: Create `/talent/social-media/page.tsx`
- **IMPLEMENT**: TalentLayout + SocialMediaTable + SocialMediaModal. Only shows current user's accounts.
- **MIRROR**: `app/admin/users/page.tsx` patterns
- **IMPORTS**: `TalentLayout`, `SocialMediaTable`, `SocialMediaModal`, `apiClient`, `useAuth`
- **GOTCHA**: Get talentId from `useAuth().user.id`
- **VALIDATE**: Write `page.test.tsx` — add, edit, delete flows

### Task 13: Frontend — Update Layouts
- **ACTION**: Update admin and talent layouts with correct nav links
- **IMPLEMENT**:
  - `admin-layout.tsx`: Ensure "Talents" link points to `/admin/talents`
  - `talent-layout.tsx`: Add "Social Media" nav link to `/talent/social-media`
- **MIRROR**: Existing NAV_ITEMS pattern
- **IMPORTS**: None — update existing
- **GOTCHA**: Don't break existing nav items
- **VALIDATE**: `npm run build` passes

### Task 14: Integration — Wire Backend Routes
- **ACTION**: Ensure all routes are wired in `main.go` with correct middleware
- **IMPLEMENT**:
  - Public: register, login
  - Auth required: /api/auth/me
  - Admin only: /api/users/*, /api/talents/* (list, create, update, delete)
  - Talent + Admin: /api/talents/:id/social-media (GET), /api/social-media/* (PUT, DELETE)
- **MIRROR**: Existing middleware patterns
- **IMPORTS**: `middleware.AuthMiddleware`, `middleware.RoleMiddleware`
- **GOTCHA**: Order matters — auth middleware before role middleware
- **VALIDATE**: Manual test with curl — admin can CRUD talents, talent can manage own social media

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| TalentRepo_Create | valid TalentProfile | stored, no error | — |
| TalentRepo_Create | duplicate email | ErrDuplicateEmail | yes |
| TalentRepo_List | offset=0, limit=20 | paginated results | — |
| TalentRepo_List | offset > total | empty list | yes |
| TalentRepo_Delete | existing ID | soft deleted | — |
| TalentRepo_Delete | non-existent ID | ErrNotFound | yes |
| SocialMediaRepo_Create | valid account | stored | — |
| SocialMediaRepo_ListByTalentID | 3 accounts | all 3 returned | — |
| SocialMediaRepo_Delete | existing ID | deleted | — |
| TalentHandler_List | GET /api/talents | 200 + paginated | — |
| TalentHandler_Create | POST /api/talents | 201 + created | — |
| TalentHandler_Create | missing name | 400 | yes |
| TalentHandler_Create | invalid email | 400 | yes |
| SocialMediaHandler_Create | POST /api/talents/:id/social-media | 201 | — |
| SocialMediaHandler_Create | invalid platform | 400 | yes |
| SocialMediaHandler_Create | wrong owner | 403 | yes |

### Edge Cases Checklist
- [ ] Empty talent list
- [ ] Talent with 0 social media accounts
- [ ] Talent with 10+ social media accounts
- [ ] Duplicate email for talent
- [ ] Invalid platform name
- [ ] Social media URL with special characters
- [ ] Concurrent updates to same talent

---

## Validation Commands

### Static Analysis
```bash
cd /root/project/AetherHub/backend && go vet ./...
```
EXPECT: Zero errors

### Unit Tests — Backend
```bash
cd /root/project/AetherHub/backend && export PATH=$PATH:/usr/local/go/bin && go test ./...
```
EXPECT: All tests pass

### Unit Tests — Frontend
```bash
cd /root/project/AetherHub/frontend && ./node_modules/.bin/vitest run
```
EXPECT: All tests pass

### Build Verification
```bash
cd /root/project/AetherHub/frontend && npm run build
```
EXPECT: Build succeeds, all routes generated

### Manual Validation
- [ ] Start backend: `cd backend && go run cmd/server/main.go`
- [ ] Register talent via POST /api/auth/register
- [ ] Login as talent, get token
- [ ] Login as admin, create talent via POST /api/talents
- [ ] Add social media account via POST /api/talents/:id/social-media
- [ ] List talents as admin
- [ ] Edit social media as talent
- [ ] Delete social media as talent

---

## Acceptance Criteria
- [ ] All 14 tasks completed
- [ ] Backend: 50+ new tests passing
- [ ] Frontend: 30+ new tests passing
- [ ] `go vet ./...` — zero errors
- [ ] `npm run build` — succeeds
- [ ] `go test ./...` — all pass
- [ ] `vitest run` — all pass
- [ ] Admin can CRUD talents
- [ ] Talent can CRUD own social media accounts
- [ ] Role-based access enforced

## Completion Checklist
- [ ] Code follows discovered patterns
- [ ] Error handling matches codebase style
- [ ] Logging follows codebase conventions
- [ ] Tests follow test patterns
- [ ] No hardcoded values
- [ ] No `main.go` without routes wired
- [ ] No unnecessary scope additions

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| No main.go exists yet — first time wiring all routes | Medium | High | Start with Task 5 early, test incrementally |
| Talent ownership check for social media | Medium | Medium | Write explicit ownership tests |
| Admin nav link for Talents may conflict | Low | Low | Check existing NAV_ITEMS before modifying |

## Notes
- `TalentProfile` and `SocialMediaAccount` models already exist in `models/user.go` — reuse them
- No Supabase integration yet — all in-memory repos
- `main.go` doesn't exist yet — this milestone creates it
- Frontend test mocking pattern is well-established — follow it exactly
