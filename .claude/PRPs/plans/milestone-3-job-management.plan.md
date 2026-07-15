# Plan: Milestone 3 — Job Management

## Summary

Admin can CRUD jobs (title, description, brand, deadline, status) and assign talent social media accounts to each job. Talent can view their assigned jobs. Brand access codes link to jobs so brands can view progress.

## User Story

As an **Admin (KOL Specialist)**, I want to create jobs and assign talent social media accounts to them, so that I can track which talent is working on which campaign and monitor their progress.

As a **Talent**, I want to see all jobs assigned to my social media accounts, so that I know what campaigns I need to work on.

As a **Brand**, I want to access job progress via a unique code, so that I can monitor campaign status without logging in.

## Problem → Solution

**Current**: Jobs and assignments are tracked manually via WhatsApp + Google Sheets.  
**Desired**: Admin creates jobs in AetherHub, assigns talent social media accounts, and everyone tracks progress in one place.

## Metadata

- **Complexity**: Large
- **Source PRD**: `.claude/prds/aetherhub-job-talent-management.prd.md`
- **PRD Phase**: Milestone 3 — Job Management
- **Estimated Files**: ~20 files (10 backend, 10 frontend)

---

## UX Design

### Before (Admin)
```
┌─────────────────────────────────────────────┐
│  Admin Dashboard                            │
│  ├── Users (✅ done)                        │
│  ├── Talents (✅ done)                      │
│  └── Jobs ← NOT YET                         │
│      (no way to create/manage jobs)         │
└─────────────────────────────────────────────┘
```

### After (Admin)
```
┌─────────────────────────────────────────────┐
│  Admin Dashboard                            │
│  ├── Users                                  │
│  ├── Talents                                │
│  └── Jobs (NEW)                             │
│      ├── List jobs with status badges       │
│      ├── Create/Edit job modal              │
│      ├── Assign talent social media to job  │
│      └── View assignments per job           │
└─────────────────────────────────────────────┘
```

### After (Talent)
```
┌─────────────────────────────────────────────┐
│  Talent Dashboard                           │
│  ├── Social Media (✅ done)                 │
│  └── My Jobs (NEW)                          │
│      └── List jobs assigned to my accounts  │
└─────────────────────────────────────────────┘
```

### Interaction Changes

| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Admin → Jobs | N/A | New /admin/jobs page | CRUD table + modal |
| Admin → Assignments | N/A | Assign button on job detail | Select talent social media |
| Talent → Jobs | N/A | New /talent/jobs page | Read-only list of assigned jobs |
| Brand → Job view | Empty jobs array | Real job data | BrandAccessCode linked to job |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `backend/internal/models/talent.go` | all | Request/response pattern to follow |
| P0 | `backend/internal/models/user.go` | all | Model struct pattern with timestamps |
| P0 | `backend/internal/handlers/talent.go` | all | Handler CRUD pattern (deep-copy, validation) |
| P0 | `backend/internal/repository/talent.go` | all | Repository interface + in-memory pattern |
| P0 | `backend/cmd/server/main.go` | all | Route wiring pattern |
| P1 | `backend/internal/handlers/social_media.go` | all | Ownership check pattern |
| P1 | `backend/internal/handlers/talent_test.go` | all | Test setup pattern (setupTalentApp) |
| P1 | `backend/internal/handlers/social_media_test.go` | all | Mock middleware pattern |
| P1 | `frontend/src/lib/api.ts` | all | API client method pattern |
| P1 | `frontend/src/app/admin/talents/page.tsx` | all | Admin page pattern |
| P1 | `frontend/src/components/admin/talent-table.tsx` | all | Table component pattern |
| P1 | `frontend/src/components/admin/talent-modal.tsx` | all | Modal component pattern |
| P2 | `backend/internal/middleware/auth.go` | all | Auth + Role middleware |
| P2 | `backend/internal/models/user.go:69-77` | BrandAccessCode | Already has JobID field |

## External Documentation

No external research needed — feature uses established internal patterns (Fiber handlers, in-memory repos, Next.js pages).

---

## Patterns to Mirror

### HANDLER_PATTERN
```go
// SOURCE: backend/internal/handlers/talent.go:13-23
type TalentHandler struct {
    repo repository.TalentRepository
}

func NewTalentHandler(repo repository.TalentRepository) *TalentHandler {
    return &TalentHandler{repo: repo}
}
```

### HANDLER_RESPONSE_PATTERN
```go
// SOURCE: backend/internal/handlers/talent.go:37-49
return c.Status(http.StatusOK).JSON(fiber.Map{
    "success": true,
    "data":    talents,
    "total":   total,
    "offset":  offset,
    "limit":   limit,
})
```

### DEEP_COPY_PATTERN
```go
// SOURCE: backend/internal/handlers/talent.go:144-145
// Deep copy to avoid mutating the live map entry (data race)
talent := *existing
```

### REPOSITORY_INTERFACE_PATTERN
```go
// SOURCE: backend/internal/repository/talent.go:13-20
type TalentRepository interface {
    Create(talent *models.TalentProfile) error
    GetByID(id string) (*models.TalentProfile, error)
    List(offset, limit int) ([]*models.TalentProfile, int, error)
    Update(talent *models.TalentProfile) error
    Delete(id string) error
}
```

### INMEMORY_REPO_PATTERN
```go
// SOURCE: backend/internal/repository/talent.go:23-33
type InMemoryTalentRepository struct {
    mu      sync.RWMutex
    talents map[string]*models.TalentProfile
}
```

### MODEL_PATTERN
```go
// SOURCE: backend/internal/models/user.go:13-22
type User struct {
    ID        string     `json:"id"`
    CreatedAt time.Time  `json:"created_at"`
    UpdatedAt time.Time  `json:"updated_at"`
    DeletedAt *time.Time `json:"deleted_at,omitempty"`
}
```

### REQUEST_MODEL_PATTERN
```go
// SOURCE: backend/internal/models/talent.go:4-11
type CreateTalentRequest struct {
    UserID string `json:"user_id"`
    Name   string `json:"name"`
    Email  string `json:"email"`
    Phone  string `json:"phone,omitempty"`
}
```

### TEST_SETUP_PATTERN
```go
// SOURCE: backend/internal/handlers/talent_test.go:15-27
func setupTalentApp() (*fiber.App, *TalentHandler) {
    app := fiber.New()
    repo := repository.NewInMemoryTalentRepository()
    handler := NewTalentHandler(repo)
    app.Get("/api/talents", handler.List)
    // ... routes
    return app, handler
}
```

### TEST_MOCK_MIDDLEWARE_PATTERN
```go
// SOURCE: backend/internal/handlers/social_media_test.go:21-30
app.Use("/api/talents/:talentId/social-media", func(c *fiber.Ctx) error {
    c.Locals("userID", "user-1")
    c.Locals("role", models.RoleTalent)
    return c.Next()
})
```

### ROUTE_WIRING_PATTERN
```go
// SOURCE: backend/cmd/server/main.go:108-114
talents := protected.Group("/talents", middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin))
talents.Get("", talentHandler.List)
talents.Post("", talentHandler.Create)
```

### FRONTEND_API_METHOD_PATTERN
```typescript
// SOURCE: frontend/src/lib/api.ts:113-119
async listTalents(offset = 0, limit = 20) {
    const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit),
    })
    return this.request<{ success: boolean; data: any[]; total: number }>(`/api/talents?${params}`)
}
```

### FRONTEND_PAGE_PATTERN
```tsx
// SOURCE: frontend/src/app/admin/talents/page.tsx:17-84
export default function TalentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTalent, setEditingTalent] = useState<Talent | undefined>(undefined)
    const [refreshKey, setRefreshKey] = useState(0)
    // ... CRUD handlers with apiClient calls
}
```

### FRONTEND_TABLE_PATTERN
```tsx
// SOURCE: frontend/src/components/admin/talent-table.tsx:22-113
export function TalentTable({ onEdit, onDelete, refreshKey }: TalentTableProps) {
    // ... fetch with apiClient, pagination, loading/empty states
}
```

### FRONTEND_MODAL_PATTERN
```tsx
// SOURCE: frontend/src/components/admin/talent-modal.tsx:20-118
export function TalentModal({ isOpen, onClose, onSubmit, talent }: TalentModalProps) {
    // ... form state, useEffect for edit mode, submit handler
}
```

---

## Files to Change

### Backend

| File | Action | Justification |
|---|---|---|
| `backend/internal/models/job.go` | CREATE | Job, Assignment, JobStatus models |
| `backend/internal/repository/job.go` | CREATE | JobRepository + InMemoryJobRepository |
| `backend/internal/repository/job_test.go` | CREATE | Repository unit tests |
| `backend/internal/repository/assignment.go` | CREATE | AssignmentRepository + InMemoryAssignmentRepository |
| `backend/internal/repository/assignment_test.go` | CREATE | Repository unit tests |
| `backend/internal/handlers/job.go` | CREATE | Job CRUD handler |
| `backend/internal/handlers/job_test.go` | CREATE | Handler tests |
| `backend/internal/handlers/assignment.go` | CREATE | Assignment handler (assign/unassign) |
| `backend/internal/handlers/assignment_test.go` | CREATE | Handler tests |
| `backend/cmd/server/main.go` | UPDATE | Wire job + assignment routes |

### Frontend

| File | Action | Justification |
|---|---|---|
| `frontend/src/lib/api.ts` | UPDATE | Add job + assignment API methods |
| `frontend/src/app/admin/jobs/page.tsx` | CREATE | Admin jobs page |
| `frontend/src/components/admin/job-table.tsx` | CREATE | Jobs list table |
| `frontend/src/components/admin/job-modal.tsx` | CREATE | Create/edit job modal |
| `frontend/src/components/admin/assignment-modal.tsx` | CREATE | Assign talent social media modal |
| `frontend/src/components/admin/admin-layout.tsx` | UPDATE | Add Jobs nav link |
| `frontend/src/app/talent/jobs/page.tsx` | CREATE | Talent jobs page |
| `frontend/src/components/talent/talent-layout.tsx` | UPDATE | Add My Jobs nav link |

## NOT Building

- **Progress tracking** — that's Milestone 4
- **Brand dashboard with real job data** — deferred; BrandAccessCode already has JobID, wiring is a follow-up
- **Supabase integration** — still using in-memory repos
- **E2E tests (Playwright)** — not in this milestone
- **Job status workflow automation** — manual status changes only
- **Pagination on frontend assignment list** — small dataset per job

---

## Step-by-Step Tasks

### Task 1: Job Model
- **ACTION**: Create `backend/internal/models/job.go`
- **IMPLEMENT**: Define Job struct, CreateJobRequest, UpdateJobRequest, JobAssignment struct, JobStatus constants
- **MIRROR**: MODEL_PATTERN and REQUEST_MODEL_PATTERN from `models/user.go` and `models/talent.go`
- **IMPORTS**: `time`
- **GOTCHA**: Use `*time.Time` for optional fields (Deadline, DeletedAt). Use string constants for status (draft, active, completed, cancelled).
- **VALIDATE**: `go build ./...` passes

### Task 2: Job Repository
- **ACTION**: Create `backend/internal/repository/job.go`
- **IMPLEMENT**: JobRepository interface (Create, GetByID, List, Update, Delete, ListByStatus) + InMemoryJobRepository
- **MIRROR**: REPOSITORY_INTERFACE_PATTERN and INMEMORY_REPO_PATTERN from `repository/talent.go`
- **IMPORTS**: `errors`, `fmt`, `sync`, `time`, `models`
- **GOTCHA**: Use `sync.RWMutex` for thread safety. Soft-delete pattern (set DeletedAt, don't delete from map). Deep-copy in Update to avoid data race.
- **VALIDATE**: `go build ./...` passes

### Task 3: Job Repository Tests
- **ACTION**: Create `backend/internal/repository/job_test.go`
- **IMPLEMENT**: Test Create, GetByID, List pagination, Update, Delete (soft-delete), ListByStatus
- **MIRROR**: Test naming pattern from `repository/talent_test.go`
- **IMPORTS**: `testing`, `models`
- **GOTCHA**: Test that deleted jobs don't appear in List. Test that Update doesn't mutate the original pointer.
- **VALIDATE**: `go test ./internal/repository/... -v -run TestJob` passes

### Task 4: Assignment Repository
- **ACTION**: Create `backend/internal/repository/assignment.go`
- **IMPLEMENT**: AssignmentRepository interface (Assign, Unassign, ListByJobID, ListBySocialMediaID, GetByID) + InMemoryAssignmentRepository
- **MIRROR**: REPOSITORY_INTERFACE_PATTERN from `repository/talent.go`
- **IMPORTS**: `errors`, `fmt`, `sync`, `time`, `models`
- **GOTCHA**: An assignment links a SocialMediaAccount to a Job. Prevent duplicate assignments (same social_media_id + job_id). ListBySocialMediaID is needed for talent to see their jobs.
- **VALIDATE**: `go build ./...` passes

### Task 5: Assignment Repository Tests
- **ACTION**: Create `backend/internal/repository/assignment_test.go`
- **IMPLEMENT**: Test Assign, Unassign, ListByJobID, ListBySocialMediaID, duplicate prevention
- **MIRROR**: Test naming pattern
- **IMPORTS**: `testing`, `models`
- **GOTCHA**: Test that unassigning a non-existent assignment returns error
- **VALIDATE**: `go test ./internal/repository/... -v -run TestAssignment` passes

### Task 6: Job Handler
- **ACTION**: Create `backend/internal/handlers/job.go`
- **IMPLEMENT**: JobHandler with List, GetByID, Create, Update, Delete. Admin-only for CRUD.
- **MIRROR**: HANDLER_PATTERN, HANDLER_RESPONSE_PATTERN, DEEP_COPY_PATTERN from `handlers/talent.go`
- **IMPORTS**: `net/http`, `strconv`, `models`, `repository`, `fiber`, `uuid`
- **GOTCHA**: Validate required fields (title, brand_name). Status must be valid if provided. Deep-copy before mutation in Update.
- **VALIDATE**: `go build ./...` passes

### Task 7: Job Handler Tests
- **ACTION**: Create `backend/internal/handlers/job_test.go`
- **IMPLEMENT**: Test List, GetByID, Create (success + validation), Update (success + 404), Delete (success + 404)
- **MIRROR**: TEST_SETUP_PATTERN and TEST_MOCK_MIDDLEWARE_PATTERN from `handlers/talent_test.go` and `handlers/social_media_test.go`
- **IMPORTS**: `testing`, `models`, `repository`, `fiber`, `net/http`, `net/http/httptest`, `encoding/json`, `bytes`
- **GOTCHA**: Mock admin middleware (set role to RoleAdmin). Use unique IDs per test to avoid cross-test pollution.
- **VALIDATE**: `go test ./internal/handlers/... -v -run TestJob` passes

### Task 8: Assignment Handler
- **ACTION**: Create `backend/internal/handlers/assignment.go`
- **IMPLEMENT**: AssignmentHandler with Assign (POST), Unassign (DELETE), ListByJobID (GET). Admin-only for assign/unassign. Talent can view their own.
- **MIRROR**: HANDLER_PATTERN, HANDLER_RESPONSE_PATTERN from `handlers/talent.go`. Ownership check from `handlers/social_media.go`.
- **IMPORTS**: `net/http`, `models`, `repository`, `fiber`, `uuid`
- **GOTCHA**: Validate that social_media_id and job_id exist before assigning. Prevent duplicate assignments (return 409 Conflict).
- **VALIDATE**: `go build ./...` passes

### Task 9: Assignment Handler Tests
- **ACTION**: Create `backend/internal/handlers/assignment_test.go`
- **IMPLEMENT**: Test Assign (success + duplicate + invalid IDs), Unassign (success + 404), ListByJobID
- **MIRROR**: TEST_SETUP_PATTERN with mock middleware
- **IMPORTS**: `testing`, `models`, `repository`, `fiber`, `net/http`, `net/http/httptest`, `encoding/json`, `bytes`
- **GOTCHA**: Need to seed social media accounts and jobs in test setup before testing assignments
- **VALIDATE**: `go test ./internal/handlers/... -v -run TestAssignment` passes

### Task 10: Wire Routes in main.go
- **ACTION**: Update `backend/cmd/server/main.go`
- **IMPLEMENT**: Add jobRepo, assignmentRepo initialization. Add jobHandler, assignmentHandler initialization. Add protected routes for jobs and assignments.
- **MIRROR**: ROUTE_WIRING_PATTERN from `main.go:108-124`
- **IMPORTS**: No new imports needed (already has all deps)
- **GOTCHA**: Jobs are admin-only for CRUD. Assignments are admin-only for create/delete. Talent can list jobs by their social media IDs.
- **VALIDATE**: `go build ./...` passes, `go vet ./...` clean

### Task 11: Frontend API Methods
- **ACTION**: Update `frontend/src/lib/api.ts`
- **IMPLEMENT**: Add methods: listJobs, createJob, updateJob, deleteJob, assignTalentToJob, unassignTalentFromJob, listAssignmentsByJob, listJobsByTalent
- **MIRROR**: FRONTEND_API_METHOD_PATTERN from `api.ts:113-164`
- **IMPORTS**: None (ApiClient class method)
- **GOTCHA**: Assignment endpoints use `/api/jobs/:jobId/assignments` for list/assign, and `/api/assignments/:id` for unassign
- **VALIDATE**: `npm run build` passes (no type errors)

### Task 12: Admin Jobs Page
- **ACTION**: Create `frontend/src/app/admin/jobs/page.tsx`
- **IMPLEMENT**: Admin jobs page with JobTable, JobModal, AssignmentModal. Handle create/edit/delete/assign.
- **MIRROR**: FRONTEND_PAGE_PATTERN from `app/admin/talents/page.tsx`
- **IMPORTS**: `useState`, `AdminLayout`, `JobTable`, `JobModal`, `AssignmentModal`, `apiClient`
- **GOTCHA**: Use refreshKey pattern to trigger table re-fetch after mutations. Assignment modal opens from job row.
- **VALIDATE**: `npm run build` generates `/admin/jobs` route

### Task 13: Job Table Component
- **ACTION**: Create `frontend/src/components/admin/job-table.tsx`
- **IMPLEMENT**: Table with columns: Title, Brand, Status (badge), Deadline, Actions (Edit, Delete, Assign)
- **MIRROR**: FRONTEND_TABLE_PATTERN from `components/admin/talent-table.tsx`
- **IMPORTS**: `useEffect`, `useState`, `apiClient`
- **GOTCHA**: Status badge colors: draft=gray, active=green, completed=blue, cancelled=red. Show "Assign" button only for active jobs.
- **VALIDATE**: `npm run build` passes

### Task 14: Job Modal Component
- **ACTION**: Create `frontend/src/components/admin/job-modal.tsx`
- **IMPLEMENT**: Form with fields: title, description, brand_name, status (select), deadline (date input)
- **MIRROR**: FRONTEND_MODAL_PATTERN from `components/admin/talent-modal.tsx`
- **IMPORTS**: `useState`, `useEffect`
- **GOTCHA**: Status select should only show valid transitions. Deadline is optional.
- **VALIDATE**: `npm run build` passes

### Task 15: Assignment Modal Component
- **ACTION**: Create `frontend/src/components/admin/assignment-modal.tsx`
- **IMPLEMENT**: Modal showing list of talent social media accounts with checkboxes to assign/unassign
- **MIRROR**: FRONTEND_MODAL_PATTERN from `components/admin/talent-modal.tsx`
- **IMPORTS**: `useState`, `useEffect`, `apiClient`
- **GOTCHA**: Fetch all talents, then their social media accounts. Show platform + username. Check already-assigned accounts.
- **VALIDATE**: `npm run build` passes

### Task 16: Update Admin Layout
- **ACTION**: Update `frontend/src/components/admin/admin-layout.tsx`
- **IMPLEMENT**: Add "Jobs" nav link between "Talents" and any existing links
- **MIRROR**: Existing nav link pattern in admin-layout
- **IMPORTS**: None
- **GOTCHA**: Use `Link` from `next/link`, highlight active route
- **VALIDATE**: `npm run build` passes

### Task 17: Talent Jobs Page
- **ACTION**: Create `frontend/src/app/talent/jobs/page.tsx`
- **IMPLEMENT**: Read-only list of jobs assigned to the talent's social media accounts
- **MIRROR**: FRONTEND_PAGE_PATTERN from `app/admin/talents/page.tsx` (simpler, no create/edit)
- **IMPORTS**: `useEffect`, `useState`, `TalentLayout`, `apiClient`
- **GOTCHA**: Talent sees jobs via their social media assignments. Group by job, show which social media account is assigned.
- **VALIDATE**: `npm run build` generates `/talent/jobs` route

### Task 18: Update Talent Layout
- **ACTION**: Update `frontend/src/components/talent/talent-layout.tsx`
- **IMPLEMENT**: Add "My Jobs" nav link
- **MIRROR**: Existing nav link pattern in talent-layout
- **IMPORTS**: None
- **GOTCHA**: Same pattern as admin layout update
- **VALIDATE**: `npm run build` passes

### Task 19: Frontend Tests
- **ACTION**: Create test files for new components: `job-table.test.tsx`, `job-modal.test.tsx`, `assignment-modal.test.tsx`
- **IMPLEMENT**: Unit tests for table rendering, modal open/close, form submission
- **MIRROR**: Test patterns from `talent-table.test.tsx`, `talent-modal.test.tsx`
- **IMPORTS**: `@testing-library/react`, `vitest`
- **GOTCHA**: Mock apiClient in tests. Test loading/empty/error states.
- **VALIDATE**: `cd frontend && ./node_modules/.bin/vitest run` passes

---

## Testing Strategy

### Unit Tests (Backend)

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| CreateJob | valid request | 201 + job object | No |
| CreateJob missing title | empty title | 400 + error | Yes |
| ListJobs pagination | offset=0, limit=3 | 3 jobs | No |
| UpdateJob | valid fields | 200 + updated job | No |
| UpdateJob not found | bad ID | 404 | Yes |
| DeleteJob | valid ID | 200 + soft-deleted | No |
| AssignTalent | valid IDs | 201 + assignment | No |
| AssignTalent duplicate | same IDs | 409 conflict | Yes |
| UnassignTalent | valid ID | 200 | No |
| ListByJobID | valid job ID | list of assignments | No |

### Unit Tests (Frontend)

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| JobTable renders | mock data | table rows | No |
| JobTable empty | no jobs | "No jobs found" | Yes |
| JobModal create mode | no talent prop | empty form | No |
| JobModal edit mode | talent prop | pre-filled form | No |
| JobModal submit | valid data | onSubmit called | No |

### Edge Cases Checklist
- [ ] Empty job title
- [ ] Job with no assignments
- [ ] Duplicate assignment (same social media + job)
- [ ] Assign to non-existent job
- [ ] Assign non-existent social media
- [ ] Delete job with assignments (cascade delete)
- [ ] Talent with no social media accounts
- [ ] Concurrent assignment creation

---

## Validation Commands

### Static Analysis
```bash
cd /root/project/AetherHub/backend && go vet ./...
```
EXPECT: No issues

### Backend Tests
```bash
cd /root/project/AetherHub/backend && export PATH=$PATH:/usr/local/go/bin && go test ./... -v
```
EXPECT: All tests pass (existing 58 + new ~30)

### Frontend Build
```bash
cd /root/project/AetherHub/frontend && npm run build
```
EXPECT: Build succeeds, new routes generated

### Frontend Tests
```bash
cd /root/project/AetherHub/frontend && ./node_modules/.bin/vitest run
```
EXPECT: All tests pass (existing 109 + new ~15)

### Full Test Suite
```bash
cd /root/project/AetherHub/backend && export PATH=$PATH:/usr/local/go/bin && go test ./... && cd ../frontend && npm run build && ./node_modules/.bin/vitest run
```
EXPECT: All backend + frontend tests pass

---

## Acceptance Criteria

- [ ] Admin can create, edit, delete jobs via /admin/jobs
- [ ] Admin can assign/unassign talent social media accounts to jobs
- [ ] Talent can view assigned jobs at /talent/jobs
- [ ] Jobs have status: draft, active, completed, cancelled
- [ ] Assignments prevent duplicates
- [ ] All backend tests pass (existing + new)
- [ ] All frontend tests pass (existing + new)
- [ ] `go vet ./...` clean
- [ ] `npm run build` succeeds

## Completion Checklist

- [ ] Code follows discovered patterns (deep-copy, response envelope, repo interface)
- [ ] Error handling matches codebase style (fiber.Map with success/error)
- [ ] Tests follow test patterns (setupApp, mock middleware, httptest)
- [ ] No hardcoded values
- [ ] No unnecessary scope additions (no progress tracking, no Supabase)
- [ ] Self-contained — no questions needed during implementation

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Assignment modal UX complexity | Medium | Medium | Keep simple — checkbox list, no drag-drop |
| Talent has many social media accounts | Low | Medium | Paginate assignment list if >20 |
| Delete job with existing assignments | Medium | High | Cascade delete assignments when job is deleted |

## Notes

- BrandAccessCode already has a `JobID` field — wiring brand access to show real job data is a natural follow-up but NOT in this milestone
- Progress tracking (absen, draft storyline, input link, insight) is Milestone 4 — do not build here
- The in-memory repos will be replaced with Supabase in a future milestone — keep interfaces clean for swappability
- Job statuses follow a simple enum pattern — no complex state machine needed for MVP
