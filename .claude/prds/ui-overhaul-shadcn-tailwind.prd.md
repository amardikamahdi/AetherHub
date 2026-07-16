# UI Overhaul — ShadCN + TailwindCSS

## Problem

AetherHub's frontend is built with raw HTML and copy-pasted Tailwind utility classes despite claiming "ShadCN UI + TailwindCSS" in its tech stack. The UI looks unprofessional and inconsistent — users across all roles (Admin, Talent, Brand) find it unusable. Duplicated code across 15+ files makes the frontend unmaintainable, and there are no design tokens, no component library, and no UX primitives (toasts, skeletons, icons). The app cannot ship to production in this state.

## Evidence

- Assumption — needs validation via user testing or demo feedback
- The codebase audit confirms: zero ShadCN infrastructure, 5 identical hand-built modals, 4 raw HTML tables with duplicated pagination, `window.alert()` for all feedback, emoji as icons, no responsive design

## Users

- **Primary**: Admin (KOL Specialist) — manages jobs, assigns talents, monitors progress. Uses the app daily. Needs a professional, efficient interface.
- **Primary**: Talent — views assigned jobs, updates progress steps. Needs clear navigation and mobile-friendly design.
- **Primary**: Brand — accesses via unique code to approve drafts and view progress. First impression matters — unprofessional UI erodes trust.
- **Not for**: Superadmin (platform management, separate concern)

## Hypothesis

We believe **replacing raw HTML with ShadCN components, establishing a design token system, and adding proper UX primitives** will **make the app professional enough for users to adopt and trust** for **all roles (Admin, Talent, Brand)**. We'll know we're right when **users complete their workflows without UI-related friction and the frontend passes a visual quality audit**.

## Success Metrics

| Metric | Target | How measured |
|---|---|---|
| ShadCN component coverage | 100% of UI primitives | No raw `<input>`, `<select>`, `<button>`, `<table>` in source |
| Zero `window.alert()` / `window.confirm()` | 0 occurrences | `grep -r "window.alert\|window.confirm" src/` |
| Build passes clean | 0 errors, 0 warnings | `npm run build && npm run lint` |
| Mobile responsive | All pages usable at 375px | Manual QA at 375px, 768px, 1024px, 1440px |
| Design token usage | No hardcoded color values | `grep -r "blue-600\|gray-300\|green-100" src/` returns 0 |
| Landing page | Custom design, not boilerplate | Visual inspection |

## Scope

**MVP** — Initialize ShadCN, replace all raw HTML primitives with ShadCN components, establish design tokens, add toast notifications, make layouts responsive, create a proper landing page.

**Out of scope**
- Dark mode support — defer to a future iteration
- Visual regression testing (Playwright) — defer until UI is stable
- Form validation library (react-hook-form + zod) — forms work today, just ugly
- Animation/motion design — functional first, polish later
- Accessibility audit (WCAG) — important but separate effort
- Backend API changes — UI-only overhaul, no API modifications

## Delivery Milestones

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Foundation | ShadCN initialized, design tokens in `globals.css`, `cn()` utility, all core UI components installed | in-progress | `.claude/plans/ui-overhaul-shadcn-tailwind.plan.md` |
| 2 | Layouts + Navigation | Admin sidebar and talent nav rebuilt with ShadCN, responsive on mobile, Lucide icons throughout | pending | — |
| 3 | Forms + Feedback | All 5 modals and 3 auth pages use ShadCN Dialog + form components; `window.alert()`/`confirm()` replaced with toasts | pending | — |
| 4 | Tables + Data Display | All 4 tables use ShadCN Table + Badge + DropdownMenu; shared pagination extracted | pending | — |
| 5 | Pages + Dashboards | All dashboard, talent, and brand pages use Card-based layouts with icons and proper loading states | pending | — |
| 6 | Landing Page + Polish | Custom landing page with hero/CTA; shared constants extracted; responsive pass across all pages | pending | — |

## Open Questions

- [ ] Should we support dark mode in this overhaul, or defer?
- [ ] Should the landing page include a demo/preview, or just marketing copy?
- [ ] Any specific color palette or brand guidelines to follow?

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Breaking existing API integration during UI rewrite | MEDIUM | HIGH | Keep all `api.ts` calls unchanged; only modify UI layer |
| ShadCN incompatibility with Tailwind v4 | LOW | MEDIUM | Both are current; `shadcn` skill handles v4 |
| Time underestimation (30+ files to modify) | HIGH | MEDIUM | Prioritize milestones 1-4 (core); 5-6 are polish |
| Visual regression without automated testing | MEDIUM | MEDIUM | Manual QA at each milestone; add Playwright later |
| Form submission behavior changes | MEDIUM | HIGH | Test each modal/form after rewrite; keep same API calls |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
