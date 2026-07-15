# Plan: Milestone 4 — Dashboard & Progress Tracking

## Summary

Talent can update progress on assigned jobs through a step-by-step flow (absen, draft storyline, input link, insight). Admin can monitor all progress on a dashboard. Brand can view progress via access code.

## User Story

As a **Talent**, I want to update my job progress step by step, so that the admin and brand can track my work.

As an **Admin**, I want to see a dashboard of all job progress, so that I can monitor campaigns at a glance.

As a **Brand**, I want to view progress for my job via access code, so that I can see campaign status without logging in.

## Problem → Solution

**Current**: Progress tracked via WhatsApp + Google Sheets. No structured flow.  
**Desired**: Talent follows a 4-step progress flow. Admin sees dashboard. Brand sees progress via code.

## Metadata

- **Complexity**: Large
- **Source PRD**: `.claude/prds/aetherhub-job-talent-management.prd.md`
- **PRD Phase**: Milestone 4 — Dashboard & Progress Tracking
- **Estimated Files**: ~22 files (11 backend, 11 frontend)

---

## UX Design

### Before (Talent)
```
┌─────────────────────────────────────────────┐
│  Talent sees assigned jobs (M3 done)        │
│  but cannot update progress                 │
└─────────────────────────────────────────────┘
```

### After (Talent)
```
┌─────────────────────────────────────────────┐
│  Job Detail: Instagram Campaign             │
│  ┌─────────────────────────────────────┐    │
│  │ Step 1: Absen          [✅ Done]    │    │
│  │ Step 2: Draft Storyline [⬜ Pending] │    │
│  │ Step 3: Input Link      [⬜ Pending] │    │
│  │ Step 4: Insight         [⬜ Pending] │    │
│  └─────────────────────────────────────┘    │
│  [Mark as Done] button for current step     │
└─────────────────────────────────────────────┘
```

### After (Admin Dashboard)
```
┌─────────────────────────────────────────────┐
│  Dashboard                                  │
│  ┌─────────────────────────────────────┐    │
│  │ Active Jobs: 5   │ Assignments: 23  │    │
│  │ Completed: 3     │ In Progress: 15  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Job: Instagram Campaign (Nike)             │
│  ┌────────┬──────────┬────────┬────────┐    │
│  │ Talent │ Absen    │ Link   │ Insight│    │
│  ├────────┼──────────┼────────┼────────┤    │
│  │ Alice  │ ✅       │ ✅     │ ⬜     │    │
│  │ Bob    │ ✅       │ ⬜     │ ⬜     │    │
│  └────────┴──────────┴────────┴────────┘    │
└─────────────────────────────────────────────┘
```

### Interaction Changes

| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Talent → Job Detail | Shows assigned accounts | Shows progress steps + update button | New page |
| Admin → Dashboard | N/A | Summary cards + progress table | New page |
| Brand → Job View | Empty jobs array | Real progress data | Update existing |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `backend/internal/models/job.go` | all | Job + Assignment models |
| P0 | `backend/internal/handlers/job.go` | all | Handler pattern |
| P0 | `backend/internal/repository/job.go` | all | Repository pattern |
| P0 | `backend/cmd/server/main.go` | all | Route wiring |
| P1 | `frontend/src/app/admin/jobs/page.tsx` | all | Admin page pattern |
| P1 | `frontend/src/app/talent/jobs/page.tsx` | all | Talent page pattern |
| P1 | `frontend/src/lib/api.ts` | all | API client pattern |
| P2 | `backend/internal/handlers/brand.go` | all | Brand access pattern |

---

## Patterns to Mirror

### HANDLER_PATTERN
```go
// SOURCE: backend/internal/handlers/job.go:14-22
type JobHandler struct {
    repo repository.JobRepository
}
```

### REPOSITORY_PATTERN
```go
// SOURCE: backend/internal/repository/job.go:13-20
type JobRepository interface {
    Create(job *models.Job) error
    GetByID(id string) (*models.Job, error)
    List(offset, limit int) ([]*models.Job, int, error)
    Update(job *models.Job) error
    Delete(id string) error
}
```

### HANDLER_RESPONSE_PATTERN
```go
// SOURCE: backend/internal/handlers/job.go:44-50
return c.Status(http.StatusOK).JSON(fiber.Map{
    "success": true, "data": jobs, "total": total,
})
```

### DEEP_COPY_PATTERN
```go
// SOURCE: backend/internal/handlers/job.go:145-146
job := *existing  // Deep copy to avoid data race
```

### TEST_SETUP_PATTERN
```go
// SOURCE: backend/internal/handlers/job_test.go:15-27
func setupJobApp() (*fiber.App, *JobHandler) {
    app := fiber.New()
    repo := repository.NewInMemoryJobRepository()
    handler := NewJobHandler(repo)
    return app, handler
}
```

---

## Files to Change

### Backend

| File | Action | Justification |
|---|---|---|
| `backend/internal/models/progress.go` | CREATE | ProgressStep, ProgressUpdate models |
| `backend/internal/repository/progress.go` | CREATE | ProgressRepository + InMemory |
| `backend/internal/repository/progress_test.go` | CREATE | Repository tests |
| `backend/internal/handlers/progress.go` | CREATE | Progress CRUD handler |
| `backend/internal/handlers/progress_test.go` | CREATE | Handler tests |
| `backend/internal/handlers/dashboard.go` | CREATE | Dashboard summary handler |
| `backend/internal/handlers/dashboard_test.go` | CREATE | Handler tests |
| `backend/cmd/server/main.go` | UPDATE | Wire routes |

### Frontend

| File | Action | Justification |
|---|---|---|
| `frontend/src/lib/api.ts` | UPDATE | Add progress + dashboard methods |
| `frontend/src/app/talent/jobs/[id]/page.tsx` | CREATE | Talent job detail + progress |
| `frontend/src/components/talent/progress-steps.tsx` | CREATE | Progress step component |
| `frontend/src/app/admin/dashboard/page.tsx` | CREATE | Admin dashboard |
| `frontend/src/components/admin/dashboard-stats.tsx` | CREATE | Dashboard summary cards |
| `frontend/src/components/admin/progress-table.tsx` | CREATE | Progress overview table |
| `frontend/src/app/brand/dashboard/[code]/page.tsx` | UPDATE | Show real progress |

## NOT Building

- File uploads (photo proof)
- Real-time updates (WebSockets)
- Progress notifications
- Bulk progress updates
- Progress history/audit log

---

## Step-by-Step Tasks

### Task 1: Progress Model
- **ACTION**: Create `backend/internal/models/progress.go`
- **IMPLEMENT**: ProgressStep constants (absen, draft_storyline, input_link, insight), ProgressUpdate struct, ProgressStatus constants
- **MIRROR**: MODEL_PATTERN from `models/job.go`
- **GOTCHA**: Steps must be completed in order
- **VALIDATE**: `go build ./...`

### Task 2: Progress Repository
- **ACTION**: Create `backend/internal/repository/progress.go`
- **IMPLEMENT**: ProgressRepository interface + InMemoryProgressRepository
- **MIRROR**: REPOSITORY_PATTERN
- **GOTCHA**: Auto-create 4 steps when assignment is created
- **VALIDATE**: `go build ./...`

### Task 3: Progress Repository Tests
- **ACTION**: Create `backend/internal/repository/progress_test.go`
- **IMPLEMENT**: Test GetByAssignmentID, UpdateStep, ListByJobID, step ordering
- **MIRROR**: Test naming from `repository/job_test.go`
- **VALIDATE**: `go test ./internal/repository/... -v -run TestProgress`

### Task 4: Progress Handler
- **ACTION**: Create `backend/internal/handlers/progress.go`
- **IMPLEMENT**: GetByAssignmentID (GET), UpdateStep (PUT), ListByJobID (GET)
- **MIRROR**: HANDLER_PATTERN
- **GOTCHA**: Verify talent owns assignment before update
- **VALIDATE**: `go build ./...`

### Task 5: Progress Handler Tests
- **ACTION**: Create `backend/internal/handlers/progress_test.go`
- **IMPLEMENT**: Test get, update (success + out-of-order + unauthorized), list
- **MIRROR**: TEST_SETUP_PATTERN
- **VALIDATE**: `go test ./internal/handlers/... -v -run TestProgress`

### Task 6: Dashboard Handler
- **ACTION**: Create `backend/internal/handlers/dashboard.go`
- **IMPLEMENT**: GetSummary — job count, assignment count, completion stats
- **MIRROR**: HANDLER_RESPONSE_PATTERN
- **VALIDATE**: `go build ./...`

### Task 7: Dashboard Handler Tests
- **ACTION**: Create `backend/internal/handlers/dashboard_test.go`
- **IMPLEMENT**: Test GetSummary with various data states
- **MIRROR**: TEST_SETUP_PATTERN
- **VALIDATE**: `go test ./internal/handlers/... -v -run TestDashboard`

### Task 8: Wire Routes
- **ACTION**: Update `backend/cmd/server/main.go`
- **IMPLEMENT**: Add progress + dashboard routes
- **MIRROR**: ROUTE_WIRING_PATTERN
- **VALIDATE**: `go build ./...` && `go vet ./...`

### Task 9: Frontend API Methods
- **ACTION**: Update `frontend/src/lib/api.ts`
- **IMPLEMENT**: Add getProgress, updateProgressStep, getJobProgress, getDashboard
- **MIRROR**: FRONTEND_API_METHOD_PATTERN
- **VALIDATE**: `npm run build`

### Task 10: Progress Steps Component
- **ACTION**: Create `frontend/src/components/talent/progress-steps.tsx`
- **IMPLEMENT**: 4-step indicator with status, "Complete" button for current step
- **MIRROR**: Component pattern from job-table.tsx
- **VALIDATE**: `npm run build`

### Task 11: Talent Job Detail Page
- **ACTION**: Create `frontend/src/app/talent/jobs/[id]/page.tsx`
- **IMPLEMENT**: Job info + progress steps, talent can mark steps complete
- **MIRROR**: FRONTEND_PAGE_PATTERN
- **VALIDATE**: `npm run build`

### Task 12: Dashboard Stats Component
- **ACTION**: Create `frontend/src/components/admin/dashboard-stats.tsx`
- **IMPLEMENT**: Summary cards: Active Jobs, Assignments, Completed, In Progress
- **MIRROR**: Card pattern
- **VALIDATE**: `npm run build`

### Task 13: Progress Table Component
- **ACTION**: Create `frontend/src/components/admin/progress-table.tsx`
- **IMPLEMENT**: Per-job progress table with step status columns
- **MIRROR**: FRONTEND_TABLE_PATTERN
- **VALIDATE**: `npm run build`

### Task 14: Admin Dashboard Page
- **ACTION**: Create `frontend/src/app/admin/dashboard/page.tsx`
- **IMPLEMENT**: Stats cards + progress table
- **MIRROR**: FRONTEND_PAGE_PATTERN
- **VALIDATE**: `npm run build`

### Task 15: Brand Dashboard Update
- **ACTION**: Update `frontend/src/app/brand/dashboard/[code]/page.tsx`
- **IMPLEMENT**: Show real job progress data
- **MIRROR**: Existing brand page pattern
- **VALIDATE**: `npm run build`

### Task 16: Frontend Tests
- **ACTION**: Create test files for progress-steps, dashboard-stats, progress-table
- **IMPLEMENT**: Unit tests for step rendering, status indicators
- **MIRROR**: Test patterns from job-table.test.tsx
- **VALIDATE**: `cd frontend && ./node_modules/.bin/vitest run`

---

## Testing Strategy

### Unit Tests (Backend)

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| GetProgressByAssignment | valid ID | 4 steps | No |
| UpdateStep valid | step 1 | completed | No |
| UpdateStep out-of-order | skip to 3 | 400 | Yes |
| UpdateStep idempotent | re-complete | 200 | Yes |
| ListByJobID | valid job | all progress | No |
| DashboardSummary | data | stats | No |

### Edge Cases Checklist
- [ ] Complete step out of order
- [ ] Re-complete already done step
- [ ] Assignment with no progress (auto-create)
- [ ] Talent updates another's progress (403)
- [ ] Brand code for non-existent job (404)
- [ ] Dashboard with zero jobs

---

## Validation Commands

```bash
# Backend
cd /root/project/AetherHub/backend && export PATH=$PATH:/usr/local/go/bin && go vet ./... && go test ./...

# Frontend
cd /root/project/AetherHub/frontend && npm run build && ./node_modules/.bin/vitest run
```

---

## Acceptance Criteria

- [ ] Talent can view and update progress steps
- [ ] Steps must be completed in order
- [ ] Admin dashboard shows progress overview
- [ ] Brand can view progress via access code
- [ ] All tests pass
- [ ] `go vet` and `npm run build` clean

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Step ordering complexity | Medium | Medium | Validate in handler |
| Dashboard performance | Low | Medium | Paginate |
| Brand code security | Low | High | Validate code active |

## Notes

- Progress is per-assignment (each social media account has its own progress)
- 4 steps match PRD: Absen, Draft Storyline, Input Link, Insight
- BrandAccessCode already has JobID — wiring is straightforward
