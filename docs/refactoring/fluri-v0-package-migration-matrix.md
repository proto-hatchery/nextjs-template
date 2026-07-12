# Fluri-v0 Package Migration Matrix

Source repository: `../fluri-v0` on `develop`.
Target repository: `nextjs-template` on `fluri`.

This migration is packages-first. The original `fluri-v0` repository stays read-only and no legacy
shim packages are introduced for `@workspace/auth`, `@workspace/supabase`, or `@workspace/ui-kit`.

## Package Mapping

| Source package | Target package | Status | Notes |
| --- | --- | --- | --- |
| `@workspace/auth` | `@workspace/supabase-auth`, `@workspace/auth-config` | Template-owned | Do not copy as a package. Auth/session/proxy/guards live in `supabase-auth`; static auth configuration lives in `auth-config`. |
| `@workspace/supabase` | `@workspace/supabase-auth`, `@workspace/supabase-infra`, `@workspace/supabase-data`, `@workspace/logging`, `@workspace/safe-action`, `@workspace/test-utils` | Template-owned decomposition | Existing template packages are the destination and define the contracts. Generated actions stay in `supabase-data/src/actions/*.codegen.ts`; DB clients/types/env stay in `supabase-infra`; session/auth stays in `supabase-auth`. Client hooks/query helpers that depend on app UI remain app-local future work. |
| `@workspace/forms` | `@workspace/forms` | Migrated | v2 RHF/Zod kernel, schema, RHF helpers, types, utils, fields, form components, and form styles were migrated under the template scripts and exports. |
| `@workspace/ui` | `@workspace/ui` | Template-owned shadcn only | `packages/ui/src/components` is not manually edited or populated from v0. Missing base components must be installed/updated through the shadcn CLI only. Hand-written compositions from v0 stay out of `ui`. |
| `@workspace/ui-kit/patterns/privacy/*` | `@workspace/core/privacy/*` | Migrated | Privacy mode provider, PHI masking helpers, sensitive content wrapper, hook, and CSS moved to `core` as cross-app behavior. |
| `@workspace/ui-kit/brand/*` | `@workspace/brand` | Migrated | `BrandButton` moved to `brand`; theme provider remains a compatibility re-export to `core`. |
| `@workspace/ui-kit/forms/*` | `@workspace/forms` | Migrated by domain | Form components are owned by `forms`. The duplicate copied `ui/src/forms` tree was removed to avoid `ui <-> forms` cycles. |
| `@workspace/ui-kit/overlays/*` | App-local future or future composition package | Not migrated | These are hand-written compositions and must not be copied into `@workspace/ui`. |
| `@workspace/ui-kit/patterns/*` | App-local future or `@workspace/core`/`@workspace/brand` when clearly generic | Partially migrated | Only privacy mode moved to `core`. Decorative/UI patterns, filters, page loaders, and feature shells remain out of packages for now. |
| `@workspace/ui-kit/ai/ai-elements/*` | App-local future or dedicated AI package later | Not migrated | AI display primitives were not copied into `ui`; they need a separate package decision if an app needs them. |
| `@workspace/lexical-editor` | `@workspace/lexical-editor` | New package | Created as a package with explicit exports, template scripts, and smoke/unit test wiring. |
| `@workspace/pdf-generator` | `@workspace/pdf-generator` | New package | Created as a package with explicit exports, template scripts, and a browserless PDF smoke test. |
| `@workspace/playwright-config` | None | Not migrated | Config packages follow the template defaults; no shared Playwright package is kept in this phase. |
| `@workspace/eslint-config` | None | Not migrated | Template uses `oxlint`/`oxfmt`; no ESLint package or shim is created. |
| `@workspace/features` | App-local future | Not migrated | Feature UI and product workflows remain for the app migration phase. |
| `@workspace/typescript-config` | `@workspace/typescript-config` | Already present | Template package remains source of truth. |
| `@workspace/vitest-config` | `@workspace/vitest-config` | Already present | Template package remains source of truth. |

## Public Export Guardrail

New public APIs should map to one of the target packages above before being added to `package.json`
exports. Old aliases are documented here only; no compatibility packages or re-export shims should be
introduced.

## App-local Future Work

The following source areas are intentionally not package APIs in this phase:

- Product feature pages, shells, onboarding UI, calendar/patient workflows, and feature-specific forms.
- Supabase client hooks/query helpers that couple to app routing, UI state, or consumer app data flows.
- Any package entrypoint that exists only to preserve an old import path from `fluri-v0`.
