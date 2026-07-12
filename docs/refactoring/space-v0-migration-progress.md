# Space-v0 Migration Progress

## 2026-05-20 — Phase 0/1 Checkpoint

Files touched:

- `packages/supabase-data/src/actions/preferences/update-general-preferences.ts`
- `packages/supabase-data/src/actions/preferences/update-notifications-preferences.ts`
- `packages/supabase-data/src/actions/preferences/update-security-preferences.ts`
- `packages/supabase-data/src/actions/subscriptions/create-checkout-session.ts`
- `packages/brand/src/components/fluri-logo.component.tsx`
- package manifests for `space-v1`, `web-v1`, `brand`, `forms`, and `supabase-data`
- deleted copied app-local action files under `apps/web-v1/app/[locale]/onboarding/_actions`,
  `apps/space-v1/app/[locale]/(flows)/onboarding/_actions`, and
  `apps/space-v1/app/[locale]/(workspace)/(settings)/preferences/_actions`

Routes closed:

- None verified as fully Done in this pass. This checkpoint removed architecture
  violations that prevented the copied onboarding, subscription, and preferences
  flows from being eligible for Done status.

Verification:

- `pnpm install` completed; Supabase CLI binary still reports ignored build-script
  warnings for the local `supabase` package.
- `pnpm supabase:start` reports the local stack is already running.
- `pnpm exec dotenv -e .env.local -- tsx scripts/qa/seed-local-test-users.ts`
  failed because local `app_roles` lacks the `psychologist` role row.
- `pnpm --filter web-v1 typecheck`, `pnpm --filter space-v1 typecheck`, and
  `pnpm --filter @workspace/supabase-data typecheck` still fail.

Next 10 files/areas to port or replace:

- Replace `@workspace/supabase-data/hooks/*` reads in `space-v1` with app-local
  `_hooks/*.hook.ts` backed by read Server Actions.
- Replace mutation hooks in patients, sessions, finances, documents, activities,
  and calendar with Server Actions only.
- Port `@workspace/supabase/utils/*` helpers used by presence/patients into app
  local `_utils` or target packages with explicit imports.
- Port `@workspace/ui/lib/linktree-links`, `slug-validation`, `timezone-datetime`,
  `errors`, and `format` callers to target utilities.
- Port `@workspace/features/patients/*` and `@workspace/features/public-profile/*`
  UI into `apps/space-v1`.
- Fix `@workspace@/app/...` broken calendar import specifiers.
- Move or remove app-tree test files so tests live under `/tests`.
- Complete DB/schema parity for tables referenced by copied modules:
  `session_events`, `psychologist_generated_documents`,
  `psychologist_registered_specialties`, and calendar snapshot columns.
- Regenerate Supabase types with `pnpm supabase:types:local` after schema parity.
- Re-run seed script after ensuring `app_roles` contains `psychologist`.
