# Space-v0 page parity matrix (fluri-v0 → space-v1)

**Source:** `fluri-v0/apps/space-v0`  
**Target:** `apps/space-v1`  
**Updated:** 2026-05-20

Legend: **exact** = ported fluri page/components with same copy/structure · **partial** = fluri files copied, imports/hooks adapted · **missing** = not ported · **blocked** = needs backend/hooks not in template.

## Sidebar navigation

| fluri item | space-v1 | Status |
| --- | --- | --- |
| Section (no label): Início, Calendário, Comunidade | `sidebar/nav-entries.ts` + `SidebarNav` | **exact** (Comunidade badge Em breve) |
| Financeiro: Cobranças, Resumo Financeiro | same | **exact** (`/finances` route added) |
| Atendimentos: Pacientes, Sessões | same | **exact** |
| Evolução Clínica: Documentos, Atividades, Modelos | same | **exact** (Atividades + interview routes) |
| Ferramentas: Fluri Chat, Meu Site ▾ | same | **exact** (nested sub-menu: Sobre Mim, Linktree, Preferências → `/presence/*`) |
| Meu Site dropdown | `CollapsibleItem` in `sidebar-nav.tsx` | **exact** (not flat links) |
| Sign out in sidebar | — | **ok** (fluri uses profile menu in header, not sidebar) |

## Page bodies

| Route (fluri) | space-v1 route | fluri source | space-v1 file | Parity |
| --- | --- | --- | --- | --- |
| `/home` | `/dashboard` | `(app-shell)/home/page.tsx` + `_components/*` | `(overview)/dashboard/page.tsx` + copied `_components` | **partial** — UI ported; stats/sessions hooks **blocked** |
| `/patients` | `/patients` | `patients/page.tsx`, `patients-page-view.tsx` | same structure | **partial** — list UI ported; mutations hooks **blocked** |
| `/calendar` | `/calendar` | `(app-shell)/calendar/*` | placeholder shell | **missing** |
| `/sessions` | `/sessions` | `(app-shell)/sessions/*` | placeholder shell | **missing** |
| `/billing` | `/billing` | `(app-shell)/billing/*` | placeholder shell | **missing** |
| `/documents` | `/documents` | `(app-shell)/documents/*` | placeholder shell | **missing** |
| `/notes/*` | `/notes/*` | `(app-bare)/notes/*` | placeholder shell | **missing** |
| `/community` | `/community` | `community/page.tsx` | copied | **exact** |
| `/finances` | `/finances` | `finances/page.tsx` | copied | **partial** |
| `/activities` | `/activities` | `activities/page.tsx` | copied | **partial** |
| `/chat` | `/chat` | `chat/page.tsx` | copied | **partial** |
| `/interview-template` | `/interview-template` | page | copied | **exact** (coming soon) |
| `/personal-website/*` | `/presence/*` | personal-website/* | presence/* | **missing** (routes exist, body not ported) |
| `/preferences/*` | `/preferences/*` | preferences/* | partial shells | **missing** |
| Onboarding `/*` | `/onboarding/*` | `(app-bare)/onboarding/**` | scaffold only | **missing** |
| `/pricing` | — | `pricing/page.client.tsx` | — | **missing** |
| `/subscription/success` | — | `subscription/success/*` | — | **missing** |

## Shared components ported

| Component | Path under `space-v1` |
| --- | --- |
| `PageContentHeader`, `PageContentWrapper` | `(workspace)/_components/page-content-header.tsx` |
| `ComingSoonPlaceholder` | `(workspace)/_components/coming-soon-placeholder.tsx` |
| `AppSidebar`, `SidebarNav`, `nav-entries`, badges | `(workspace)/_components/sidebar/*` |
| `SpaceSidebar` | `(workspace)/_components/space-sidebar.tsx` |
| Home dashboard widgets | `(overview)/dashboard/_components/*` |

## Blockers (remaining)

1. **`@workspace/supabase/hooks/*`** — sessions, finances, patient mutations; need app-local hooks wrapping `supabase-data` actions or port hook package.
2. **Onboarding RPCs + flow-controller** — not in template DB/actions.
3. **Stripe / pricing** — checkout actions + edge webhook.
4. **Large domains** — calendar, sessions, documents, notes, preferences (full trees not yet copied).

## Verify

```bash
pnpm install
pnpm --filter space-v1 typecheck
pnpm --filter space-v1 dev
```

**Visual check (sidebar):** Five labeled sections; “Meu Site” shows three indented sub-links; “Comunidade” and “Modelos de Entrevista” show “Em breve” badges; collapsed sidebar shows separators instead of section titles.
