# Code Review: Milestone 2 — Talent Management

**Reviewed**: 2026-07-16
**Branch**: feature/milestone-2-talent-management
**Decision**: APPROVE (after fixes)

## Summary
Milestone 2 adds talent management CRUD for admin and social media account management for talents. Backend uses Go/Fiber with in-memory repos. Frontend uses Next.js + React. All CRITICAL and HIGH issues have been fixed.

## Findings

### CRITICAL (Fixed)
1. **Hardcoded JWT secret fallback** — `main.go:27` silently used "default-secret-change-me" when env var missing. Fixed: now fails at startup with `log.Fatal`.
2. **Data race in Update handlers** — `talent.go`, `social_media.go`, `user.go` mutated live map pointers without write lock. Fixed: deep-copy before mutation.

### HIGH (Fixed)
3. **Missing authz on social media Create** — any authenticated user could write to any talent. Fixed: added ownership check matching Update/Delete handlers.
4. **Hardcoded superadmin credentials** — password "admin123" logged in plaintext. Fixed: generate random password or read from `SEED_ADMIN_PASSWORD` env var.
5. **Unsafe type assertion** — `c.Locals("userID").(string)` could panic. Fixed: use two-value form with ok check.

### MEDIUM (Fixed)
6. **Negative offset accepted** — could panic on slice. Fixed: added `if offset < 0 { offset = 0 }` guard.

### MEDIUM (Noted, not fixed)
7. **Pervasive `any` types in api.ts** — 12 occurrences. Low risk for MVP, fix in polish phase.
8. **Silent error swallowing in tables** — `.catch(() => {})`. Low impact, add error states later.
9. **API call with empty talentId** — wasted request before auth loads. Low impact.
10. **Missing modal accessibility** — no `role="dialog"`, no Escape key. Add in polish phase.
11. **No URL validation** — `type="text"` instead of `type="url"`. Minor.

## Validation Results

| Check | Result |
|---|---|
| Go Build | ✅ Pass |
| Go Tests | ✅ Pass (58 tests) |
| Frontend Build | ✅ Pass (12 routes) |
| Frontend Tests | ✅ Pass (109 tests) |

## Files Reviewed
- `backend/cmd/server/main.go` — Modified (JWT, seed password, type assertion)
- `backend/internal/handlers/talent.go` — Modified (deep-copy, offset guard)
- `backend/internal/handlers/social_media.go` — Modified (deep-copy, ownership check)
- `backend/internal/handlers/user.go` — Modified (deep-copy, offset guard)
- `backend/internal/handlers/social_media_test.go` — Modified (ownership test URLs)
- `frontend/src/lib/api.ts` — Added (8 new API methods)
- `frontend/src/components/admin/talent-table.tsx` — Added
- `frontend/src/components/admin/talent-modal.tsx` — Added
- `frontend/src/components/talent/social-media-table.tsx` — Added
- `frontend/src/components/talent/social-media-modal.tsx` — Added
- `frontend/src/app/admin/talents/page.tsx` — Added
- `frontend/src/app/talent/social-media/page.tsx` — Added
- `frontend/src/components/talent/talent-layout.tsx` — Modified (nav links)

## Next Steps
- Create PR via `/pr`
- Address MEDIUM issues in polish phase
