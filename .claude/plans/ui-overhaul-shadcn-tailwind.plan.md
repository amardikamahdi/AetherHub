# Plan: UI Overhaul — ShadCN + TailwindCSS

**Source PRD**: `.claude/prds/ui-overhaul-shadcn-tailwind.prd.md`
**Selected Milestone**: 1 — Foundation
**Complexity**: Large

## Summary

The AetherHub frontend claims "ShadCN UI + TailwindCSS" in its tech stack but has **zero ShadCN infrastructure**. Every page uses raw HTML elements with copy-pasted Tailwind utility classes. This plan initializes ShadCN, replaces all hand-built primitives with proper components, establishes a design token system, and improves UX with toasts, skeletons, icons, and responsive layouts.

## Current State (Problems)

| Problem | Severity | Files Affected |
|---|---|---|
| No ShadCN installed — no `components.json`, no `components/ui/`, no Radix packages | CRITICAL | All |
| Raw `<input>`, `<select>`, `<button>` with copy-pasted Tailwind classes | HIGH | 15+ files |
| Hand-built modals (5 identical overlays) | HIGH | 5 modal files |
| Raw `<table>` with duplicated pagination | HIGH | 4 table files |
| `window.alert()` / `window.confirm()` for user feedback | HIGH | 10+ files |
| Plain text "Loading..." — no spinners or skeletons | MEDIUM | All pages |
| No icon library — emoji used as icons | MEDIUM | progress-steps |
| Hardcoded colors (`blue-600`, `gray-300`) — no semantic tokens | MEDIUM | All |
| Font mismatch: Geist loaded but Arial applied via body CSS | LOW | globals.css |
| No mobile responsiveness (fixed sidebar `w-64`) | MEDIUM | admin-layout |
| Landing page is default Next.js boilerplate | LOW | page.tsx |
| Orphaned `/admin/users` route (not in sidebar) | LOW | admin-layout |

## Available Skills

| Skill | Path | Relevance |
|---|---|---|
| `shadcn` | `/root/.agents/skills/shadcn/` | Component install, composition rules, styling rules, CLI usage |
| `tailwind-design-system` | `/root/.agents/skills/tailwind-design-system/` | CSS-first config, design tokens, OKLCH colors, v4 patterns |
| `design-system` | `/root/.claude/skills/ecc/design-system/` | Design audit, token generation |

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Naming | `shadcn` skill | PascalCase components in `components/ui/`, kebab-case file names |
| Styling | `shadcn/rules/styling.md` | Semantic colors via CSS variables, `cn()` for conditional classes, `gap-*` not `space-*` |
| Forms | `shadcn/rules/forms.md` | FieldGroup + Field + InputGroup pattern |
| Composition | `shadcn/rules/composition.md` | Card for content grouping, Dialog/Sheet for modals, Tabs for navigation |
| Icons | `shadcn/rules/icons.md` | `data-icon` attribute, Lucide icons, consistent sizing |
| Design Tokens | `tailwind-design-system` | OKLCH color palette, `@theme` block in CSS, semantic token hierarchy |

## Files to Change

### Phase 0: Foundation (ShadCN + Design Tokens)

| File | Action | Why |
|---|---|---|
| `frontend/components.json` | CREATE | ShadCN configuration file |
| `frontend/src/app/globals.css` | UPDATE | Add design tokens, OKLCH colors, semantic variables, fix font |
| `frontend/src/components/ui/*` | CREATE | ShadCN base components (button, input, select, dialog, table, card, badge, toast, tabs, dropdown-menu, label, textarea, separator, skeleton, avatar, sheet, sidebar) |
| `frontend/package.json` | UPDATE | Add ShadCN dependencies (Radix UI, CVA, clsx, tailwind-merge, lucide-react, sonner) |
| `frontend/src/lib/utils.ts` | CREATE | `cn()` utility function |

### Phase 1: Shared Layouts

| File | Action | Why |
|---|---|---|
| `frontend/src/components/admin/admin-layout.tsx` | UPDATE | ShadCN Sidebar component, responsive mobile sheet, proper nav with icons |
| `frontend/src/components/talent/talent-layout.tsx` | UPDATE | ShadCN Tabs + header with responsive mobile menu |
| `frontend/src/app/layout.tsx` | UPDATE | Add Toaster provider, fix font application |

### Phase 2: Replace Forms

| File | Action | Why |
|---|---|---|
| `frontend/src/components/admin/job-modal.tsx` | UPDATE | Use Dialog, FieldGroup, Input, Select, Button, Textarea |
| `frontend/src/components/admin/talent-modal.tsx` | UPDATE | Same pattern |
| `frontend/src/components/admin/user-modal.tsx` | UPDATE | Same pattern |
| `frontend/src/components/admin/assignment-modal.tsx` | UPDATE | Same pattern |
| `frontend/src/components/talent/social-media-modal.tsx` | UPDATE | Same pattern |
| `frontend/src/app/(auth)/login/page.tsx` | UPDATE | Card-based form with proper inputs |
| `frontend/src/app/(auth)/register/page.tsx` | UPDATE | Card-based form with proper inputs |
| `frontend/src/app/brand/access/page.tsx` | UPDATE | Card-based form with proper input |

### Phase 3: Replace Tables

| File | Action | Why |
|---|---|---|
| `frontend/src/components/admin/job-table.tsx` | UPDATE | ShadCN Table, Badge for status, DropdownMenu for actions |
| `frontend/src/components/admin/talent-table.tsx` | UPDATE | Same pattern |
| `frontend/src/components/admin/user-table.tsx` | UPDATE | Same pattern |
| `frontend/src/components/talent/social-media-table.tsx` | UPDATE | Same pattern |

### Phase 4: Replace Dashboards + Pages

| File | Action | Why |
|---|---|---|
| `frontend/src/components/admin/dashboard-stats.tsx` | UPDATE | Card components with icons, proper stat display |
| `frontend/src/components/admin/progress-table.tsx` | UPDATE | ShadCN Table with progress indicators |
| `frontend/src/components/talent/progress-steps.tsx` | UPDATE | Proper step indicator with icons instead of emoji |
| `frontend/src/app/admin/dashboard/page.tsx` | UPDATE | Use updated components |
| `frontend/src/app/admin/jobs/page.tsx` | UPDATE | Use updated components |
| `frontend/src/app/admin/talents/page.tsx` | UPDATE | Use updated components |
| `frontend/src/app/admin/users/page.tsx` | UPDATE | Use updated components |
| `frontend/src/app/talent/dashboard/page.tsx` | UPDATE | Card-based layout |
| `frontend/src/app/talent/jobs/page.tsx` | UPDATE | Card-based job list with badges |
| `frontend/src/app/talent/jobs/[id]/page.tsx` | UPDATE | Card-based detail with progress |
| `frontend/src/app/talent/social-media/page.tsx` | UPDATE | Card-based layout |
| `frontend/src/app/brand/dashboard/[code]/page.tsx` | UPDATE | Card-based progress view |

### Phase 5: Landing Page + Polish

| File | Action | Why |
|---|---|---|
| `frontend/src/app/page.tsx` | UPDATE | Proper landing page with hero, features, CTA |
| `frontend/src/components/auth/protected-route.tsx` | UPDATE | Use Skeleton for loading states |
| `frontend/src/lib/api.ts` | UPDATE | (minor) Add toast-friendly error handling helpers |

### Phase 6: Cleanup

| File | Action | Why |
|---|---|---|
| Various files | UPDATE | Remove duplicate STATUS_COLORS, extract to shared constants |
| `frontend/src/lib/constants.ts` | CREATE | Shared status colors, role labels, config |

## Tasks

### Task 0: Initialize ShadCN + Design Tokens
- **Action**: Install ShadCN UI, configure `components.json`, set up design tokens in `globals.css` with OKLCH colors, create `cn()` utility
- **Mirror**: `shadcn` skill CLI setup + `tailwind-design-system` token hierarchy
- **Validate**: `npx shadcn@latest init`, verify `components.json` exists, verify `cn()` works

### Task 1: Install Core ShadCN Components
- **Action**: Add button, input, select, dialog, table, card, badge, toast/sonner, tabs, dropdown-menu, label, textarea, separator, skeleton, avatar, sheet, sidebar, form
- **Mirror**: `shadcn` skill CLI (`npx shadcn@latest add <component>`)
- **Validate**: Verify `components/ui/` contains all expected files, `npm run build` passes

### Task 2: Fix Global Styles + Fonts
- **Action**: Update `globals.css` with full design token system (OKLCH palette, semantic colors, radius, shadows). Fix body font to use Geist. Add dark mode support.
- **Mirror**: `tailwind-design-system` CSS-first config patterns
- **Validate**: Visual check — fonts render correctly, colors use tokens

### Task 3: Rewrite Admin Layout with ShadCN Sidebar
- **Action**: Replace hand-built sidebar with ShadCN Sidebar component. Add Lucide icons for nav items. Add mobile responsive Sheet. Link orphaned `/admin/users` route.
- **Mirror**: `shadcn/rules/composition.md` sidebar patterns
- **Validate**: Navigate all admin routes, test mobile collapse

### Task 4: Rewrite Talent Layout
- **Action**: Replace header nav with ShadCN Tabs or proper nav. Add responsive mobile menu. Add Lucide icons.
- **Mirror**: `shadcn/rules/composition.md` navigation patterns
- **Validate**: Navigate all talent routes, test mobile

### Task 5: Add Toast System
- **Action**: Add Sonner Toaster to root layout. Replace all `window.alert()` calls with `toast()` calls. Replace `window.confirm()` with Dialog-based confirmations.
- **Mirror**: `shadcn` skill toast patterns
- **Validate**: Trigger success/error/info toasts, verify visual appearance

### Task 6: Rewrite All Modals as ShadCN Dialogs
- **Action**: Replace 5 hand-built modals (job, talent, user, assignment, social-media) with ShadCN Dialog component. Use FieldGroup + Field pattern for form layout.
- **Mirror**: `shadcn/rules/forms.md` FieldGroup pattern, `shadcn/rules/composition.md` Dialog patterns
- **Validate**: Open each modal, verify form submission still works

### Task 7: Rewrite All Tables as ShadCN Tables
- **Action**: Replace 4 raw HTML tables (jobs, talents, users, social-media) with ShadCN Table. Use Badge for status. Use DropdownMenu for row actions. Extract shared pagination component.
- **Mirror**: `shadcn` skill table patterns
- **Validate**: Verify sorting, pagination, actions work

### Task 8: Rewrite Auth Pages
- **Action**: Replace login/register/brand-access pages with Card-based forms using ShadCN Input, Button, Label.
- **Mirror**: `shadcn/rules/forms.md` form layout
- **Validate**: Login, register, brand access flows work end-to-end

### Task 9: Rewrite Dashboard + Stats
- **Action**: Replace dashboard-stats with Card components + Lucide icons. Rewrite progress-table with ShadCN Table.
- **Mirror**: `shadcn/rules/composition.md` Card patterns
- **Validate**: Dashboard loads with correct data

### Task 10: Rewrite Talent Pages
- **Action**: Replace talent dashboard, jobs list, job detail, social media pages with Card-based layouts. Replace emoji icons in progress-steps with Lucide icons.
- **Mirror**: `shadcn/rules/icons.md` icon patterns
- **Validate**: All talent pages render correctly

### Task 11: Rewrite Brand Dashboard
- **Action**: Replace brand dashboard with Card-based progress view.
- **Mirror**: Same Card patterns
- **Validate**: Brand access code flow works end-to-end

### Task 12: Create Landing Page
- **Action**: Replace Next.js boilerplate with proper landing page — hero section, features grid, role descriptions, CTA buttons.
- **Mirror**: ShadCN landing page patterns with Card + Button
- **Validate**: Landing page renders, CTA links work

### Task 13: Extract Shared Constants + Cleanup
- **Action**: Create `lib/constants.ts` with STATUS_COLORS, ROLE_LABELS. Remove all duplicate definitions. Remove unused `protected-route.tsx` if confirmed unused.
- **Mirror**: DRY principle
- **Validate**: `grep -r "STATUS_COLORS"` shows single source, `npm run build` passes

### Task 14: Responsive Pass
- **Action**: Audit all pages for mobile responsiveness. Add breakpoints where missing. Ensure tables are scrollable on mobile. Ensure modals are full-screen on mobile.
- **Mirror**: `tailwind-design-system` responsive patterns
- **Validate**: Test at 375px, 768px, 1024px, 1440px viewports

### Task 15: Final Build + Lint
- **Action**: Run full build, fix any TypeScript errors, run lint, verify all pages load without console errors.
- **Mirror**: N/A
- **Validate**: `npm run build && npm run lint` passes clean

## Validation

```bash
cd frontend

# Build check
npm run build

# Lint check
npm run lint

# Type check
npx tsc --noEmit

# Verify ShadCN components exist
ls src/components/ui/

# Verify no raw alert/confirm remaining
grep -r "window.alert\|window.confirm" src/ --include="*.tsx" --include="*.ts"

# Verify no duplicate STATUS_COLORS
grep -r "STATUS_COLORS" src/ --include="*.tsx" --include="*.ts" | wc -l

# Verify cn() utility exists
cat src/lib/utils.ts

# Verify design tokens in globals.css
grep "@theme" src/app/globals.css
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Breaking existing API integration during UI rewrite | MEDIUM | Keep all `api.ts` calls unchanged; only modify UI layer |
| ShadCN v2 incompatibility with Tailwind v4 | LOW | Both are current; shadcn skill handles v4 |
| Time estimate underestimation (16 tasks) | HIGH | Prioritize phases 0-5 (core); phases 6+ are polish |
| Visual regression without visual testing | MEDIUM | Manual QA at each phase; consider adding Playwright later |
| Form submission behavior changes | MEDIUM | Test each modal/form after rewrite; keep same API calls |

## Acceptance

- [ ] ShadCN initialized with `components.json` and all core components installed
- [ ] All raw HTML inputs replaced with ShadCN Input/Select/Textarea
- [ ] All hand-built modals replaced with ShadCN Dialog
- [ ] All raw tables replaced with ShadCN Table + Badge + DropdownMenu
- [ ] All `window.alert()` / `window.confirm()` replaced with Toast/Dialog
- [ ] Loading states use Skeleton components
- [ ] Lucide icons used consistently (no emoji icons)
- [ ] Design tokens defined in `globals.css` (OKLCH palette)
- [ ] Semantic colors used (no hardcoded `blue-600` etc.)
- [ ] Admin sidebar responsive (Sheet on mobile)
- [ ] Landing page is custom (not Next.js boilerplate)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] All existing functionality preserved (login, CRUD, progress tracking)

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
