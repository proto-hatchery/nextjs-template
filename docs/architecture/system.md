# Architecture Overview

**Operational contract (repo-wide rules, implementation truth):**
[docs/standards/repository-standards.md](../standards/repository-standards.md)

**Technology stack (versions and libraries):**
[docs/reference/stack.md](../reference/stack.md) — Next.js 16, React 19,
Tailwind v4, shadcn, Zod v4, TanStack, Supabase, etc.

## Core Principles

This document provides the unified architectural vision for the system. All
development MUST align with these patterns.

### Golden Rules

- **NEVER** cross package boundaries incorrectly (`@workspace/supabase-auth`
  must not import `@workspace/supabase-data`; `@workspace/supabase-data` may
  import `@workspace/supabase-auth` only where needed for server authorization)
- **ALWAYS** use the repository pattern for data access
- **NEVER** create app-local database abstraction layers
- **ALWAYS** seed correlation context at app boundaries (`proxy.ts`)
- **ALWAYS** use subpath exports (NO barrel files)

**Migrations:** New files only via `pnpm supabase:migration:new` +
`pnpm supabase db diff -o …` (never invent paths under `supabase/migrations/`).
Canonical rules: [Database → Migrations](./database.md#migrations),
[TDD](./tdd.md),
[docs/guides/migration-workflow.md](../guides/migration-workflow.md).

---

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Apps (Multiple)                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │   Web App    │  │  Mobile App  │  │  Admin App   │          │   │
│  │  │  (Next.js)   │  │  (React)     │  │  (Next.js)   │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  │                                                                 │   │
│  │  Rules:                                                         │   │
│  │  - NO direct database access                                    │   │
│  │  - NO lib/db/actions or lib/repositories                        │   │
│  │  - Import ONLY from @workspace/* packages                       │   │
│  │  - App-local code ONLY for UI glue/orchestration                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   @workspace/supabase-data                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │ Server Actions  │  │  React Hooks    │  │      DTOs       │ │   │
│  │  │  (createAction) │  │ (useEntity)     │  │  (domain types) │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  Rules:                                                         │   │
│  │  - ONLY package with raw Supabase .from() access                │   │
│  │  - Exposes both hooks (client) and actions (server)             │   │
│  │  - MAY import @workspace/supabase-auth for session/claims at server      │   │
│  │    boundaries (actions, sync); identity stays in auth            │   │
│  │  - Uses neverthrow Result internally                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              @workspace/supabase-data/modules/*/domain               │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────┐  │   │
│  │  │   Repository Ports      │  │         DTOs                │  │   │
│  │  │   (interfaces)          │  │   (readonly types)          │  │   │
│  │  └─────────────────────────┘  └─────────────────────────────┘  │   │
│  │                                                                 │   │
│  │  Rules:                                                         │   │
│  │  - Defines WHAT (interfaces), not HOW (implementations)         │   │
│  │  - DTOs are readonly, domain-oriented                           │   │
│  │  - NO database types (Database["public"]["..."])                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │           @workspace/supabase-data/modules/*/infrastructure          │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────┐  │   │
│  │  │  Repository Implement   │  │        Mappers              │  │   │
│  │  │  (SupabaseRepository)   │  │   (Row ↔ DTO + logic)       │  │   │
│  │  └─────────────────────────┘  └─────────────────────────────┘  │   │
│  │                                                                 │   │
│  │  Rules:                                                         │   │
│  │  - ONLY place with raw .from() calls                            │   │
│  │  - Mappers contain business logic for Row → DTO conversion      │   │
│  │  - NEVER leak Database types to domain layer                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Supabase Database                          │   │
│  │  - Tables with RLS enabled                                      │   │
│  │  - Granular policies per operation + role                       │   │
│  │  - Database functions (SECURITY INVOKER, search_path = '')      │   │
│  │  - Triggers for audit logs, updated_at, etc.                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Package Boundaries

### @workspace/supabase-auth

**Responsibility**: Identity and session management (SSoT for "Who is this?")

```
packages/supabase-auth/
├── src/
│   ├── session/           # getClaims(), getUserId(), getUserRole() — React-cached
│   ├── server/            # createServerAuthClient() — server client factory
│   ├── client/            # createClient(), getClientClaims() — browser client
│   ├── proxy/             # updateSession() — shared middleware logic
│   ├── auth-guard/        # <AuthGuard> — Server Component route protection
│   ├── hook/              # useAuth() — client-side auth actions
│   ├── provider/          # <AuthProvider> — client-side session context
│   └── guard/             # URL utilities, role guards
```

**NEVER**:

- Query the database directly
- Import from `@workspace/supabase-data`
- Contain business logic

**ALWAYS**:

- Use JWT claims as SSoT for authorization
- Rely on `getClaims()` for server-side auth
- Use Fluid Compute (new client per request)

### @workspace/supabase-data

**Responsibility**: Data access and business logic (SSoT for "What data
exists?")

```
@workspace/supabase-data/
├── src/
│   ├── modules/
│   │   └── {module}/
│   │       ├── domain/
│   │       │   ├── dto/           # EntityDTO, CreateEntityData
│   │       │   └── ports/         # EntityRepository interface
│   │       └── infrastructure/
│   │           ├── mappers/       # EntityMapper (Row → DTO)
│   │           └── repositories/  # EntitySupabaseRepository
│   ├── actions/                   # Server actions (createAction wrappers)
│   ├── hooks/                     # React Query hooks (useEntity)
│   ├── components/                # Data-aware components
│   ├── lib/
│   │   ├── boundary/              # createAction, serializeResult, unwrapActionResult
│   │   ├── errors/                # AppError, AppErrorCode
│   │   └── observability/         # CorrelationStore, unified events
│   └── clients/                   # createClient, createServerClient
```

**MAY** (where needed for server-side authorization and session plumbing):

- Import from `@workspace/supabase-auth` (for example
  `@workspace/supabase-auth/server/create-server-auth-client`, session/claims
  helpers, role types) at action boundaries or infrastructure that must run with
  the authenticated server context. Do not duplicate identity or session
  primitives here; keep them in `@workspace/supabase-auth`.

**NEVER**:

- Expose raw Supabase clients to apps
- Allow apps to define local `lib/db/actions` or `lib/repositories`

**ALWAYS**:

- Use repository pattern for all data access
- Return `neverthrow` Result internally
- Serialize to `ActionResult<T>` at public boundaries
- Use `createAction` wrapper for all server actions

### Apps (Presentation)

**Responsibility**: UI composition, routing, view-model shaping

```
apps/
├── example/
│   ├── app/
│   │   ├── (routes)/
│   │   │   └── entities/
│   │   │       ├── page.tsx          # Imports from @workspace/supabase-data
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   └── proxy.ts                  # Middleware (seeds correlation context)
│   ├── components/
│   │   └── entities/
│   │       ├── entity-list.tsx       # Imports hooks from @workspace/supabase-data
│   │       └── entity-form.tsx
│   └── lib/
│       └── utils/                    # App-specific utilities ONLY
│                                     # NO lib/db or lib/repositories!
```

**NEVER**:

- Import raw Supabase clients
- Define `lib/db/actions/*` or `lib/repositories/*`
- Create wrappers whose only purpose is to forward to `@workspace/supabase-data`

**ALWAYS**:

- Import from `@workspace/supabase-data` directly near place of use
- Use hooks for client-stateful consumption
- Use actions for server-boundary consumption
- Keep app-local code ONLY for UI glue/orchestration

---

## Module Communication

### How Modules Communicate

```
┌──────────────────────────────────────────────────────────────────┐
│                         App (Web)                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page Component (Server)                                   │ │
│  │  import { getEntityAction } from                           │ │
│  │    "@workspace/supabase-data/actions/entities/get-entity"       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Client Component                                          │ │
│  │  import { useEntityList } from                             │ │
│  │    "@workspace/supabase-data/hooks/entities"                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    @workspace/supabase-data                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Server Action                                             │ │
│  │  createAction({                                            │ │
│  │    handler: async (input, context) => {                    │ │
│  │      const repo = new EntitySupabaseRepository(            │ │
│  │        context.supabase                                    │ │
│  │      );                                                    │ │
│  │      return repo.findById(input.id);                       │ │
│  │    }                                                       │ │
│  │  })                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Repository Implementation                                 │ │
│  │  EntitySupabaseRepository implements EntityRepository      │ │
│  │  - Uses raw .from() calls ONLY here                        │ │
│  │  - Returns Result<EntityDTO, AppError>                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Mapper                                                    │ │
│  │  EntityMapper.fromDatabaseRow(row)                         │ │
│  │  - Contains business logic for Row → DTO                   │ │
│  │  - Handles null coalescing, formatting, etc.               │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                         Supabase DB                              │
│  - Tables with RLS                                               │
│  - Policies enforce ownership/permissions                        │
│  - Functions (SECURITY INVOKER, search_path = '')                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Where Code Lives

### Decision Guide

| If you need to...                        | Put it in...                                                                                            | Example                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Raw database query                       | `@workspace/supabase-data/modules/*/infrastructure/repositories/`                                       | `EntitySupabaseRepository.findById()` |
| Row → DTO conversion with business logic | `@workspace/supabase-data/modules/*/infrastructure/mappers/`                                            | `EntityMapper.fromDatabaseRow()`      |
| Domain type definition                   | `@workspace/supabase-data/modules/*/domain/dto/`                                                        | `EntityDTO`, `CreateEntityData`       |
| Repository interface                     | `@workspace/supabase-data/modules/*/domain/ports/`                                                      | `EntityRepository`                    |
| Server action (public API)               | `@workspace/supabase-data/actions/`                                                                     | `createEntityAction`                  |
| React Query hook                         | `@workspace/supabase-data/hooks/`                                                                       | `useEntityList`                       |
| Auth check (server)                      | `@workspace/supabase-auth/session/`                                                                     | `getClaims()`, `getUserId()`          |
| Route guard component                    | `@workspace/supabase-auth/auth-guard/` or `@workspace/supabase-auth/react/`                             | `<AuthGuard>`, `<RoleGuard>`          |
| Middleware logic                         | `@workspace/supabase-auth/proxy/`                                                                       | `updateSession()`                     |
| Page/server component                    | `apps/*/app/`                                                                                           | `page.tsx`, `layout.tsx`              |
| Client UI component                      | `apps/*/components/`, `@workspace/brand/components/*`, or `@workspace/ui/components/` (primitives only) | `EntityList`, `EntityForm`            |
| App-specific UI glue                     | `apps/*/` near feature                                                                                  | `handleCreateAndRedirect()`           |

---

## Decision Flowcharts

### "Should I create a new server action?"

```
Do you need to expose data/mutation to clients?
│
├─ NO → Keep it internal (repository/service layer)
│
└─ YES → Does @workspace/supabase-data already have an action for this?
         │
         ├─ YES → Import and use existing action
         │
         └─ NO → Create new action:
                  1. Add to @workspace/supabase-data/actions/{module}/
                  2. Use createAction wrapper
                  3. Return serializeResult(result)
                  4. Export as ActionResult<T>
```

### "Should I create a new hook?"

```
Do you need client-side reactive data with React Query caching?
│
├─ NO → Use server action directly (RSC fetch or Server Action call)
│
└─ YES (read only) → Does @workspace/supabase-data already have a query hook?
         │
         ├─ YES → Import and use existing query hook
         │
         └─ NO → Create new query hook:
                  1. Add to @workspace/supabase-data/hooks/{module}/
                  2. Use useQuery from React Query
                  3. Call server action inside queryFn
                  4. Add query keys to query-keys.codegen.ts
```

> ⚠️ **Do NOT create mutation hooks.** `use-*-mutation.hook.codegen.ts` files
> do not exist in this codebase. Mutations always go through Server Actions.
> See [data-access-pattern.md](./data-access-pattern.md).

### "Can I put this in my app's lib/ folder?"

```
Is this code...
│
├─ Raw database access? → ❌ FORBIDDEN (belongs in @workspace/supabase-data)
│
├─ Repository implementation? → ❌ FORBIDDEN (belongs in @workspace/supabase-data)
│
├─ Wrapper that just forwards to @workspace/supabase-data? → ❌ FORBIDDEN
│
├─ Page-specific composition logic? → ✅ ALLOWED (near feature)
│
├─ URL/state glue code? → ✅ ALLOWED (near feature)
│
├─ View-model shaping? → ✅ ALLOWED (near feature)
│
└─ Local interaction handler? → ✅ ALLOWED (near feature)
```

### "Which auth method should I use?"

```
Do you need to check user identity/permissions?
│
├─ On the SERVER?
│  │
│  ├─ Need only userId/claims? → ✅ getClaims() (fast, cached JWKS)
│  │
│  ├─ Need to confirm user not banned/deleted? → ⚠️ getUser() (DB check)
│  │
│  └─ For non-security UI state? → ❌ NEVER use getSession() on server
│
└─ On the CLIENT?
   │
   ├─ Reactive user state in React? → ✅ <AuthProvider> + useAuth()
   │
   ├─ One-time claim check? → ✅ getClientClaims()
   │
   └─ Non-security UI state? → ✅ getSession() (acceptable on client)
```

---

## Import Patterns

### ✅ CORRECT Examples

```typescript
// Server page importing action
import { getEntityAction } from "@workspace/supabase-data/actions/entities/get-entity";
import { getClaims } from "@workspace/supabase-auth/session";

export default async function EntityPage({ params }) {
  const userId = await getUserId();
  const entity = await getEntityAction({ id: params.id, userId });
  return <EntityDetail entity={entity} />;
}

// Client component importing hook
"use client";
import { useEntityList } from "@workspace/supabase-data/hooks/entities";
import { useAuth } from "@workspace/supabase-auth/hook";

export function EntityList() {
  const { user } = useAuth();
  const { data, isLoading } = useEntityList({ userId: user.id });
  return <div>{/* render entities */}</div>;
}

// Server action in @workspace/supabase-data — may import @workspace/supabase-auth for session/claims
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client";

export async function runWithUserSupabase() {
  const supabase = await createServerAuthClient();
  // ...
}

// Repository implementation (ONLY place with raw .from())
import type { SupabaseClient } from "@supabase/supabase-js";

export class EntitySupabaseRepository implements EntityRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string) {
    const SELECT = "id, name, user_id, created_at" as const;
    const { data, error } = await this.supabase
      .from("entities")
      .select(SELECT)
      .eq("id", id)
      .single();
    // ...
  }
}
```

### ❌ WRONG Examples

```typescript
// App-local DB abstraction (FORBIDDEN)
import { createEntity } from "@/lib/db/actions/entities";
import { EntityRepository } from "@/lib/repositories/entities";

// Raw Supabase in app (FORBIDDEN)
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(...);

// Barrel imports (FORBIDDEN)
import { Button, Card } from "@workspace/ui";
import { useEntity } from "@workspace/supabase-data";

// getSession() for auth on server (FORBIDDEN)
const { data: { session } } = await supabase.auth.getSession();
const userId = session.user.id;  // Not verified!
```

---

## Observability

Observability in this repo is defined in
[`docs/guides/observability-architecture.md`](../guides/observability-architecture.md).

Important distinction:

- the document above is the canonical standard
- runtime adoption is incremental
- current code must not claim that every server action or boundary is fully
  instrumented unless it actually is

Current required invariants:

- correlation starts at `apps/*/proxy.ts`
- `@workspace/logging` is the shared observability package
- structured events are preferred over free-form console output
- privileged flows must move toward `privileged.operation` or `security.audit`

---

## Related Documents

- [Backend](./backend.md) - Detailed backend standards
- [Database](./database.md) - Database standards and RLS patterns
