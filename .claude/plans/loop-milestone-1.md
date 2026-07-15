# Loop Runbook: Milestone 1 Completion

## Pattern
Sequential (safe mode)

## Stop Condition
All 10 phases of Milestone 1 complete, or test failure blocks progress.

## Phases

| # | Phase | Status | Tests |
|---|-------|--------|-------|
| 1 | Project Setup | ✅ done | 16 |
| 2 | Database & Models | ✅ done | 14 |
| 3 | Auth Backend | ✅ done | 8 |
| 4 | User Management | ✅ done | 10 |
| 5 | Brand Access Backend | ✅ done | 8 |
| 6 | Frontend Auth | ✅ done | — |
| 7 | Frontend Admin | ✅ done | 25 |
| 8 | Frontend Talent | ✅ done | 13 |
| 9 | Frontend Brand | ✅ done | 15 |
| 10 | Testing & Polish | ✅ done | 6 |

## Quality Gates (per phase)

1. **RED**: Write tests first, verify they fail
2. **GREEN**: Implement minimal code, verify tests pass
3. **REFACTOR**: Clean up, ensure no lint errors
4. **REVIEW**: Code review — no CRITICAL/HIGH issues
5. **COMMIT**: Checkpoint commit with evidence

## Phase 7 Tasks (Frontend Admin)

- [ ] TDD: Admin layout tests (sidebar renders, nav links, role guard)
- [ ] Create admin layout with sidebar (Dashboard, Jobs, Talents, Settings)
- [ ] TDD: Dashboard page tests (stats display, quick actions)
- [ ] Create dashboard page (overview stats)
- [ ] TDD: User table tests (table renders, pagination, role filter)
- [ ] Create user management table (list users, filters, actions)
- [ ] TDD: Create/Edit modal tests (form validation, submit handler)
- [ ] Create modals (create/edit user, delete confirmation)
- [ ] Commit: `feat: add frontend admin layout and user management (Phase 7)`

## Phase 8 Tasks (Frontend Talent)

- [ ] TDD: Talent layout tests (layout renders, talent nav)
- [ ] Create talent layout (simplified for talent role)
- [ ] TDD: Talent dashboard tests (assigned jobs list, quick access)
- [ ] Create talent dashboard (assigned jobs, pending tasks)
- [ ] Commit: `feat: add frontend talent layout and dashboard (Phase 8)`

## Phase 9 Tasks (Frontend Brand)

- [ ] TDD: Brand access page tests (code input, validation, redirect)
- [ ] Create brand access page (input unique code, validate via API)
- [ ] TDD: Brand dashboard tests (job list, basic info display)
- [ ] Create brand dashboard (view assigned jobs, brand info)
- [ ] Commit: `feat: add frontend brand access and dashboard (Phase 9)`

## Phase 10 Tasks (Testing & Polish)

- [ ] Protected route wrapper (test + implement route guards by role)
- [ ] Role-based redirect (test + implement post-login redirect)
- [ ] Integration tests (full auth flow: register → login → redirect)
- [ ] Bug fixes — address issues found during testing
- [ ] Code cleanup — remove dead code, fix lint warnings
- [ ] Final verification — all tests pass, build succeeds
- [ ] Commit: `test: add frontend integration tests and polish (Phase 10)`

## Environment Notes

- **Go PATH:** `export PATH=$PATH:/usr/local/go/bin` before running `go test`
- **Frontend tests:** `cd frontend && npm test`
- **Backend tests:** `cd backend && go test ./...`
