# Space-v0 → space-v1 route gap matrix

**Source:** `/Users/noasantos/Documents/startapse/refator-test/fluri-v0/apps/space-v0`  
**Target:** `apps/space-v1` (locale prefix: `/[locale]/…`)  
**Related:** Phase-1 onboarding lives in `fluri-v0/apps/web-v0` → must map to `apps/web-v1`.

Legend: **Done** = route exists with real or near-real UI · **Partial** = route exists, scaffold/English copy/missing data layer · **Missing** = no route · **Blocked** = depends on backend not in template yet.

## App shell (`(app-shell)` → `(workspace)`)

| fluri-v0 route | space-v1 route | Status | Notes |
| --- | --- | --- | --- |
| `/home` | `/dashboard` | Partial | v0: welcome, stats, upcoming sessions, todo, calendar sidebar. v1: overview view-model slice, not full home port. |
| `/calendar` | `/calendar` | Partial | v0: full calendar controller, Google sync, event creation. v1: route + scaffold. |
| `/sessions` | `/sessions`, `/sessions/[sessionId]` | Partial | v0: list + dialogs/sheets. v1: list + detail shells. |
| `/patients` | `/patients`, `/patients/[patientId]` | Partial | v0: `PatientsPageView`, create/invite. v1: directory shell + filters (mock/server VM). |
| `/billing` | `/billing` | Partial | v0: charges UI. v1: scaffold. |
| `/documents` | `/documents`, `/documents/[documentId]` | Partial | v0: create modal/sheet, templates. v1: list + detail scaffold. |
| `/activities` | — | Missing | Clinical activities grid. |
| `/finances` | — | Missing | Financial summary (distinct from billing). |
| `/chat` | — | Missing | Fluri Chat. |
| `/community` | — | Missing | Coming-soon community. |
| `/interview-template` | — | Missing | Interview templates (coming soon in nav). |
| `/preferences` | `/preferences` | Partial | v0: tabbed settings + subscription section. v1: sub-routes (general, availability, notifications, security). |
| `/preferences/(tabs)/subscription` | — | Missing | Stripe portal / plan management section. |
| `/preferences/(tabs)/referral` | — | Missing | Referral tab. |
| `/personal-website` | `/presence` | Partial | v0: site hub. v1: presence hub. |
| `/personal-website/profile-data` | `/presence/profile` | Partial | |
| `/personal-website/links` | `/presence/links` | Partial | |
| `/personal-website/preferences` | `/presence/preferences` | Partial | |
| `/settings-mobile` | — | Missing | Mobile settings container. |
| `/all` | — | Missing | Dev/nav utility. |
| `/brand-buttons-showcase` | — | Missing | Dev-only. |

## Bare / flows (`(app-bare)` → `(flows)` or dedicated routes)

| fluri-v0 route | space-v1 route | Status | Notes |
| --- | --- | --- | --- |
| `/onboarding` (router) | `/onboarding` | Partial | v0: redirects via `getCurrentOnboardingStepAction`. v1: **scaffold only**. |
| `/onboarding/services` | — | Missing | Config step 1. |
| `/onboarding/locations` | — | Missing | |
| `/onboarding/availability` | — | Missing | |
| `/onboarding/slug` | — | Missing | |
| `/onboarding/links` | — | Missing | |
| `/onboarding/visual` | — | Missing | |
| `/onboarding/specialties` | — | Missing | |
| `/onboarding/education` | — | Missing | |
| `/onboarding/experience` | — | Missing | |
| `/onboarding/publish` | — | Missing | |
| `/onboarding/success` | `/onboarding/success` | Partial | v0: checkout processor + success/error states. v1: scaffold. |
| `/pricing` | — | Missing | Plan picker + Stripe checkout CTA. |
| `/subscription/success` | — | Missing | Post-checkout session refresh. |
| `/notes/new` | `/notes/new` | Partial | v0: Lexical editor + autosave. v1: scaffold (package exists). |
| `/notes/[noteId]` | `/notes/[noteId]` | Partial | |
| `/documents/[documentId]/edit` | `/documents/[documentId]/edit` (flows) | Partial | v0: full editor. v1: flow route exists. |
| `/internal/templates` | — | Missing | Internal admin templates. |
| `/fields` | — | Missing | Form fields playground. |

## Auth / infra

| fluri-v0 | space-v1 / web-v1 | Status | Notes |
| --- | --- | --- | --- |
| `app/auth/provision/route.ts` | web-v1 auth handlers | Partial | Template uses shared `@workspace/supabase-auth` route handlers. |
| Phase 1 onboarding (`web-v0`) | `web-v1` | **Missing** | identity, professional, subscription, select-plan, configuration — **no routes in web-v1**. |

## Backend / packages (blockers for “complete” port)

| Capability | fluri-v0 | nextjs-template | Status |
| --- | --- | --- | --- |
| Onboarding flow RPCs | `get_current_onboarding_step`, `update_onboarding_step` | Not in `supabase/migrations/` | **Blocked** — port migrations from `fluri-v0/supabase/migrations/20260310140450_simplify_onboarding_ssot.sql` (CLI workflow). |
| Flow controller actions | `@workspace/supabase/actions/onboarding/flow-controller` | Not present | **Blocked** — add hand-written actions under `packages/supabase-data/src/actions/onboarding/` (`authActionClient`). |
| Onboarding progress actions | `get-onboarding-progress`, etc. | Codegen CRUD on `psychologist_onboarding_state` only | Partial |
| Stripe checkout | `web-v0` subscription actions + `checkout-webhook` edge fn | Schema/types exist; **no app wiring** | **Blocked** — `STRIPE_*` keys, edge function deploy, webhook URL. |
| Pricing hooks | `usePricingPlans` | Not in template hooks | **Blocked** — port query layer or use `subscription-plans` codegen + hook. |
| Patient/session hooks | `@workspace/supabase/hooks/*` | App-local / server VMs in v1 | Partial — v1 uses view-models, not full hooks port. |
| `@workspace/features/onboarding` | OnboardingBanner, step registry | Not migrated (per package matrix) | **Blocked** for shell banner. |

## Hydration / ThemeProvider (template fix)

| Issue | Cause | Fix |
| --- | --- | --- |
| `Cannot render a sync or defer <script> outside the main document` | `AppProviders` (next-themes) in root `app/layout.tsx` **outside** `<html>` | Root layout pass-through; providers only in `app/[locale]/layout.tsx` `<body>`. |
| Theme hydration | class on `<html>` from next-themes | `suppressHydrationWarning` on `<html>` and `<body>`. |

## Priority port order (recommended)

1. DB: onboarding RPC migrations (stamped CLI).  
2. `packages/supabase-data`: `flow-controller` actions (+ progress helpers).  
3. `web-v1`: phase-1 onboarding routes (identity → professional → subscription).  
4. `space-v1`: phase-2 onboarding tree (`services` … `publish`) + `success`.  
5. `space-v1`: `/pricing`, `/subscription/success`.  
6. Shell: port `/home` → `/dashboard` components.  
7. Domain routes: calendar, patients, sessions, documents, notes (wire to supabase-data).  
8. Remaining: finances, activities, chat, community, settings-mobile.

## Verify locally

```bash
# Space app
pnpm --filter space-v1 dev   # :3001

# Auth / phase-1 onboarding (after web-v1 port)
pnpm --filter web-v1 dev      # :3002

# Types
pnpm --filter space-v1 typecheck

# After migration port
pnpm supabase:types:local
pnpm test:rls
```
