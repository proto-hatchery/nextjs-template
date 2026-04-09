# Backend Standards

**What “backend” means in this repo:** The **pnpm package**
[`@workspace/supabase-infra`](../../packages/supabase-infra)
(`packages/supabase-infra`) is **Supabase infrastructure only** — generated
`Database` types, public/server env helpers, and typed client factories (for
example admin/service-role usage). It does **not** host domain queries,
repositories, or business server actions. **Apps and feature code consume data
through [`@workspace/supabase-data`](../../packages/supabase-data)** (actions,
hooks, domain/infrastructure modules). Use
[`@workspace/supabase-auth`](../../packages/supabase-auth) for identity, claims,
and server auth clients. Prefer **not** importing `@workspace/supabase-infra`
from apps except for rare tooling or explicit infra needs;
[dependency rules](../standards/repository-standards.md) keep `supabase-infra`
as a leaf so it never depends on `auth` or `supabase-data`.

This document’s patterns (repository, server actions, errors, auth at the
handler boundary) apply to **server-side data work in
`@workspace/supabase-data`** and to how **apps** call those APIs — not to
growing the `supabase-infra` package with product logic.

**Implementation note:** The patterns below (including `createAction` /
`serializeResult`) describe the **target** server-action API. **Canonical
choices today:** (1) Existing modules may expose thin `import "server-only"`
helpers that accept `SupabaseClient` for internal composition (see
`get-profile-by-user-id`). (2) **New** app-facing Server Actions should be
scaffolded with `pnpm action:new` (`"use server"`, `getClaims()`, structured
logging, Zod inputs, serializable results) and then wired to repositories—do not
add new ad-hoc patterns without aligning to that template. Shared `createAction`
helpers are **not** in the tree yet. All code must follow repository boundaries
and validation rules—see
[docs/standards/repository-standards.md](../standards/repository-standards.md#6-data-and-validation-rules).

## Core Principles

This document establishes the gold-standard for backend development. All new
code MUST follow these patterns.

### Golden Rules

- **NEVER** create app-local database abstraction layers (`lib/db/actions`,
  `lib/repositories`)
- **ALWAYS** use `getClaims()` for server-side authorization (NEVER
  `getSession()`)
- **ALWAYS** create Supabase clients inside request handlers (Fluid Compute)
- **NEVER** allow apps to import raw Supabase clients directly
- **ALWAYS** use hooks for client-stateful consumption, actions for
  server-boundary consumption
- **ALWAYS** validate externally influenced inputs at the route/action boundary
  before passing typed data inward

Short companion note:
[docs/guides/auth-invariants.md](../guides/auth-invariants.md)

**Schema changes:** [Database → Migrations](./database.md#migrations),
[TDD](./tdd.md) (order: contracts → tests → CLI diff → implementation).

---

## Architecture Layers

The backend follows a strict layered architecture with clear boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│  (Apps: Server Components, Client Components, Pages)        │
│  - Imports from @workspace/supabase-data only                    │
│  - No direct database access                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  (@workspace/supabase-data - Public Surface)                     │
│  - Server Actions (createAction wrappers)                   │
│  - React Query Hooks (useEntity hooks)                      │
│  - DTOs (domain types)                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DOMAIN LAYER                              │
│  (@workspace/supabase-data/modules/*/domain)                     │
│  - Repository interfaces (ports)                            │
│  - DTOs (readonly domain types)                             │
│  - Business logic interfaces                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│  (@workspace/supabase-data/modules/*/infrastructure)             │
│  - Repository implementations                               │
│  - Mappers (Row ↔ DTO)                                      │
│  - Raw Supabase .from() access ONLY here                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Package Boundaries

### Responsibility Split

| Package                     | Responsibility                                                                              | Prohibited                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `@workspace/supabase-infra` | Supabase **infra**: env, `Database` types, typed Supabase clients (admin/service patterns)  | Domain queries, repositories, server actions, auth/session logic                   |
| `@workspace/supabase-data`  | Data access, repositories, DTOs, actions, hooks                                             | Auth logic, UI components                                                          |
| `@workspace/supabase-auth`  | Identity, JWT claims, session management, guards                                            | Database queries, business logic                                                   |
| Apps (presentation)         | UI composition, routing, view-model shaping; **import `@workspace/supabase-data` for data** | Raw DB access, repository wrappers, routine imports of `@workspace/supabase-infra` |

### Import Rules

```typescript
// ✅ CORRECT — Server Components / Actions / Route Handlers
import {
  getClaims,
  getUserId,
  getUserRole,
} from "@workspace/supabase-auth/session"
import { createServerAuthClient } from "@workspace/supabase-auth/server"
import { createEntityAction } from "@workspace/supabase-data/actions/entities/create-entity"
import { useEntityList } from "@workspace/supabase-data/hooks/entities"

// ✅ CORRECT — Client Components
import { useAuth } from "@workspace/supabase-auth/hook"
import { getClientClaims } from "@workspace/supabase-auth/client"
import { useEntityList } from "@workspace/supabase-data/hooks/entities"

// ❌ FORBIDDEN — App-local DB abstraction
import { createEntity } from "@/lib/db/actions/entities"
import { EntityRepository } from "@/lib/repositories/entities"

// ❌ FORBIDDEN — Raw Supabase in apps
import { createClient } from "@supabase/supabase-js"
```

---

## Repository Pattern

### When to Use

**ALWAYS** use the repository pattern for database access. NEVER expose raw
Supabase queries outside infrastructure layers.

### Structure

```
packages/supabase-data/src/modules/{module}/
├── domain/
│   ├── dto/
│   │   └── {entity}.dto.ts          # Hand-written (e.g. profiles, user-access)
│   └── ports/
│       └── {entity}-repository.port.ts
└── infrastructure/
    ├── mappers/
    │   └── {entity}.mapper.ts
    └── repositories/
        └── {entity}-supabase.repository.ts
```

**Plan-driven codegen** (`pnpm codegen:backend`) emits the same layout with a
**`.codegen` segment** so `pnpm codegen:clean` can delete by filename:
`{entity}.dto.codegen.ts`, `{entity}.mapper.codegen.ts`,
`{entity}-repository.port.codegen.ts`,
`{entity}-supabase.repository.codegen.ts`. Import paths use the same suffix
(e.g. `.../session-types.dto.codegen`).

### Codegen (optional)

[`docs/guides/backend-codegen.md`](../guides/backend-codegen.md) describes
`config/domain-map.json` (structural) and optional `config/repository-plan.json`
(Zod-validated semantic plan: methods, DTO shape, table vs view reads). The
coding agent runs the autonomous pipeline (skill
`repository-plan-autonomous-pipeline`: `codegen:repository-plan:context` →
authored JSON → validate → `codegen:backend --plan`) without human approval
steps; deterministic emitters write `codegen:backend`‑marked DTOs, mappers,
ports, and repositories using Supabase client primitives (`select` / `insert` /
`update` / `upsert` / `delete`) inside infrastructure only. Generated
repositories currently **throw** `SupabaseRepositoryError` like existing stubs;
aligning fully with the `Result`/`neverthrow` examples below can be a later
pass.

### Example

```typescript
// domain/ports/entity-repository.port.ts
export interface EntityRepository {
  findById(id: string): Promise<Result<EntityDTO, AppError>>
  findAll(filters: EntityFilters): Promise<Result<EntityDTO[], AppError>>
  create(data: CreateEntityData): Promise<Result<EntityDTO, AppError>>
  update(
    id: string,
    data: UpdateEntityData
  ): Promise<Result<EntityDTO, AppError>>
  delete(id: string): Promise<Result<void, AppError>>
}

// infrastructure/repositories/entity-supabase.repository.ts
export class EntitySupabaseRepository implements EntityRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Result<EntityDTO, AppError>> {
    const SELECT_FIELDS = "id, name, created_at, updated_at" as const

    const { data, error } = await this.supabase
      .from("entities")
      .select(SELECT_FIELDS)
      .eq("id", id)
      .single()

    if (error || !data) {
      return err(AppError.notFound("Entity not found"))
    }

    return ok(EntityMapper.fromDatabaseRow(data))
  }
}
```

### ✅ CORRECT Examples

```typescript
// Action using repository
import { EntitySupabaseRepository } from "../infrastructure/repositories/entity-supabase.repository"

export const getEntityAction = createAction({
  handler: async (input, context) => {
    const repository = new EntitySupabaseRepository(context.supabase)
    return await repository.findById(input.entityId)
  },
})

// Mapper with business logic
export class EntityMapper {
  static fromDatabaseRow(row: EntityRow): EntityDTO {
    return {
      id: row.id,
      displayName: row.manual_name ?? row.synced_name,
      email: row.manual_email ?? row.synced_email,
    }
  }
}
```

### ❌ WRONG Examples

```typescript
// Raw query in action (FORBIDDEN)
export const getEntityAction = createAction({
  handler: async (input, context) => {
    const { data } = await context.supabase
      .from("entities")
      .select("*") // NEVER use select("*")
      .eq("id", input.entityId)
    return ok(data)
  },
})

// Database types leaking to domain (FORBIDDEN)
import type { Database } from "@workspace/supabase-data/types"
type Entity = Database["public"]["Tables"]["entities"]["Row"]
```

---

## Server Actions

### Serialization Contract

Server Actions MUST return serialized results at the boundary. Internal logic
uses `neverthrow` `Result<T, AppError>`, but the public contract is a plain
discriminated union.

### Transport Format

```typescript
type ActionResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; error: SerializableActionError }

type SerializableActionError = {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  isRetryable?: boolean
  meta?: Record<string, unknown>
}
```

### Server-Side Pattern

```typescript
"use server"

import { createAction } from "@workspace/supabase-data/lib/boundary/create-action"
import { serializeResult } from "@workspace/supabase-data/lib/boundary/serialize-result"
import { ok, err } from "neverthrow"
import {
  AppError,
  AppErrorCode,
} from "@workspace/supabase-data/lib/errors/app-error"

const _createEntityAction = createAction<
  CreateEntityRequest,
  CreateEntityResponse
>({
  name: "createEntity",
  inputSchema: createEntityRequestSchema,
  handler: async (input, context) => {
    const repository = new EntitySupabaseRepository(context.supabase)

    const existing = await repository.findByUniqueField(input.uniqueField)
    if (existing.isOk()) {
      return err(
        AppError.validation("UNIQUE_CONSTRAINT", "Entity already exists")
      )
    }

    const result = await repository.create(input)
    if (result.isErr()) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create entity")
      )
    }

    return ok({ entity: result.value })
  },
})

export async function createEntityAction(
  input: CreateEntityRequest
): Promise<ActionResult<CreateEntityResponse>> {
  const result = await _createEntityAction(input)
  return serializeResult(result)
}
```

### Client-Side Consumption

For server-first writable routes (settings, profile, configuration), consume
Server Actions through `useActionForm`:

```typescript
"use client"

import { useActionForm } from "@workspace/forms/hooks/use-action-form"
import { createEntityAction } from "@workspace/supabase-data/actions/entities/create-entity"

export function CreateEntityForm({ initialValues }: Props) {
  const { form, handleSubmitWithAction, action } = useActionForm({
    action: createEntityAction,
    schema: createEntitySchema,
    defaultValues: initialValues,
    values: initialValues,
  })

  return (
    <form onSubmit={handleSubmitWithAction}>
      {/* fields */}
      {action.result.serverError && <p>{action.result.serverError}</p>}
      <Button disabled={action.isPending}>Create</Button>
    </form>
  )
}
```

> ⚠️ **Note:** `use-*-mutation.hook.codegen.ts` files **do not exist** in this
> codebase and must not be created. All mutations go through Server Actions.
> See [data-access-pattern.md](./data-access-pattern.md).

### ✅ CORRECT Examples

```typescript
// Server action with proper serialization
export async function updateEntityAction(
  input: UpdateEntityRequest
): Promise<ActionResult<UpdateEntityResponse>> {
  const result = await _updateEntityAction(input)
  return serializeResult(result)
}

// Client hook with proper error handling
try {
  const data = await unwrapActionResult(await someAction(input), Schema)
  toast.success("Entity updated")
} catch (error) {
  if (isActionError(error)) {
    toast.error(error.message)
  }
}
```

### ❌ WRONG Examples

```typescript
// Exposing raw Result to client (FORBIDDEN)
export async function getEntityAction(): Promise<Result<EntityDTO, AppError>> {
  return await repository.findById(id) // Result methods lost in serialization
}

// Using deserializeResult in client hooks (FORBIDDEN - use unwrapActionResult)
import { deserializeResult } from "@workspace/supabase-data/lib/boundary"
const result = deserializeResult(await action(input)) // Adds unnecessary bundle size

// No Zod validation at boundary (FORBIDDEN)
const data = await action(input) // No schema validation
```

---

## Authentication

### Server-Side Auth Methods

| Method         | Network Call           | JWT Verified | Use Case                              |
| -------------- | ---------------------- | ------------ | ------------------------------------- |
| `getClaims()`  | Only for JWKS (cached) | ✅ Yes       | **PRIMARY** - All server auth checks  |
| `getUser()`    | Always (Auth DB)       | ✅ Yes       | Fallback only - DB consistency checks |
| `getSession()` | No                     | ❌ No        | **NEVER** on server for authorization |

### Golden Rules

- **ALWAYS** use `getClaims()` for server-side authorization
- **NEVER** use `getSession()` on the server for security decisions
- **ALWAYS** create Supabase clients inside request handlers (Fluid Compute)
- **NEVER** create global Supabase clients at module scope

### ✅ CORRECT Examples

```typescript
// Server Action with proper auth
import { getClaims } from "@workspace/supabase-auth/session"
import { createServerAuthClient } from "@workspace/supabase-auth/server"

export async function protectedAction(input: Input) {
  const supabase = await createServerAuthClient() // Fluid compute - new client per request
  const { data: claims } = await supabase.auth.getClaims() // Fast, verified, cached JWKS

  if (!claims?.sub) {
    return err(AppError.auth("Unauthorized"))
  }

  const userId = claims.sub
  // ... proceed with authorized operation
}

// Getting user claims in server component
async function Page() {
  const userId = await getUserId() // Uses getClaims() internally, React-cached
  const role = await getUserRole()
}
```

### ❌ WRONG Examples

```typescript
// Using getSession() for authorization (FORBIDDEN)
const { data: { session } } = await supabase.auth.getSession();
const userId = session?.user.id;  // Not verified, unsafe for auth decisions

// Global Supabase client (FORBIDDEN - leaks auth between requests)
const supabase = createServerClient(...);  // Created at module scope!
export async function action() {
  const { data } = await supabase.auth.getClaims();  // Reads stale cookies!
}

// Using getUser() when claims are sufficient (ANTI-PATTERN)
const { data: { user } } = await supabase.auth.getUser();  // Unnecessary DB roundtrip
const userId = user.id;  // Could have used getClaims() instead
```

### Fluid Compute Pattern

```typescript
// ✅ CORRECT — New client per invocation
export async function myServerAction() {
  const supabase = await createServerAuthClient();  // Reads cookies() per-request
  const { data } = await supabase.auth.getClaims();
}

// ❌ FORBIDDEN — Global client leaks auth state
const supabase = createServerClient(...);  // Module scope = shared between requests!
export async function myServerAction() {
  const { data } = await supabase.auth.getClaims();  // Stale cookies!
}
```

---

## Error Handling

### Neverthrow Result Pattern

All internal backend logic MUST use `neverthrow` `Result<T, AppError>` for error
handling. NEVER throw exceptions.

### AppError Types

```typescript
type AppError = Validation | Auth | NotFound | Infra | Business

// Usage examples
err(AppError.validation("INVALID_INPUT", "Name is required"))
err(AppError.auth("Unauthorized", "User lacks required role"))
err(AppError.notFound("Entity not found"))
err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Database connection failed"))
err(AppError.business("INSUFFICIENT_FUNDS", "Account balance too low"))
```

### Error Propagation

```typescript
// Repository layer
async findById(id: string): Promise<Result<EntityDTO, AppError>> {
  const { data, error } = await this.supabase
    .from("entities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return err(AppError.notFound("Entity not found"));
    }
    return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message));
  }

  return ok(EntityMapper.fromDatabaseRow(data));
}

// Action layer
handler: async (input, context) => {
  const result = await repository.create(input);
  if (result.isErr()) {
    return result;  // Propagate error up
  }
  return ok({ entity: result.value });
}
```

### ✅ CORRECT Examples

```typescript
// Composable error handling
const result = await repository.findById(id)
if (result.isErr()) {
  return result // Propagate
}

// Error transformation
const dbResult = await dbOperation()
if (dbResult.isErr()) {
  return err(
    AppError.infra(AppErrorCode.INFRA_SUPABASE, dbResult.error.message)
  )
}

// Multiple error paths
const userResult = await getUser()
if (userResult.isErr()) return userResult

const permissionResult = await checkPermission(userResult.value)
if (permissionResult.isErr()) return permissionResult
```

### ❌ WRONG Examples

```typescript
// Throwing exceptions (FORBIDDEN)
if (!user) {
  throw new Error("User not found") // NEVER throw
}

// Ignoring errors (FORBIDDEN)
const result = await repository.findById(id)
return ok(result.value) // What if result.isErr()?

// Catching and rethrowing (FORBIDDEN)
try {
  return await repository.create(input)
} catch (error) {
  throw error // Should return err(AppError...)
}
```

---

## Data Layer Rules

### Apps MUST NOT Define

The following are **FORBIDDEN** in app code:

- `apps/*/lib/db/actions/*`
- `apps/*/lib/repositories/*`
- App-local wrappers whose only purpose is to forward to
  `@workspace/supabase-data`

### Apps MAY Define

App-local code is allowed ONLY for:

- Page-specific composition logic
- URL/state glue code
- View-model shaping
- Local interaction handlers

```typescript
// ✅ ALLOWED — App-specific orchestration near feature
async function handleCreateAndRedirect() {
  const result = await createEntityAction(input);
  if (result.success) {
    router.push(`/entities/${result.data.id}`);  // App-specific navigation
    toast.success("Created!");  // App-specific UI
  }
}

// ❌ FORBIDDEN — App-local wrapper over package logic
export async function createEntityWrapper(...) {
  return createEntityAction(...);  // Just forwards to package!
}
```

---

## Import Guidelines

### Hooks vs Actions Decision Matrix

| Situation                                       | Correct Home               | Correct Consumer Surface |
| ----------------------------------------------- | -------------------------- | ------------------------ |
| Query with React Query caching in client UI     | `@workspace/supabase-data` | Query hook               |
| Client mutation (all writable routes)           | `@workspace/supabase-data` | Server Action + useActionForm |
| File upload with server validation              | `@workspace/supabase-data` | Action                   |
| Signed URL generation                           | `@workspace/supabase-data` | Action                   |
| Server page fetch needing authenticated access  | `@workspace/supabase-data` | Action                   |
| App-specific redirect/toast/view glue           | App feature folder         | Local helper             |
| App-local wrapper over package data logic       | **FORBIDDEN**              | N/A                      |

> Mutation hooks are not a consumer surface in this architecture. All mutations
> go through Server Actions. See [data-access-pattern.md](./data-access-pattern.md).

### Use Hooks When

- Consumer is a Client Component
- React Query caching/invalidation is needed
- Flow is query/mutation oriented in UI state
- Optimistic updates or refetch coordination matter

### Use Actions When

- Consumer is a Server Component, Server Action, or Route Handler
- Flow is imperative and boundary-oriented
- Server-only auth/ownership checks are needed
- Uploads, signed URLs, or server capability boundaries are involved

### Import Location Rule

**ALWAYS** import package APIs close to the page, route, or feature component
that uses them. Do NOT create extra app-wide indirection layers.

```typescript
// ✅ CORRECT — Import near place of use

// Page server component
import { listEntitiesAction } from "@workspace/supabase-data/actions/entities/list-entities"

// Client component
import { useEntityList } from "@workspace/supabase-data/hooks/entities"

// Local feature helper
import { createEntityAction } from "@workspace/supabase-data/actions/entities/create-entity"
```

---

## Related Documents

- [Database](./database.md) - Database standards and RLS patterns
- [System layers & boundaries](./system.md) - Overall architecture overview
- [docs/guides/client-ui-data-sync.md](../guides/client-ui-data-sync.md) -
  Auto-sync UI after mutations, optimistic updates, avoiding full-page loading
  (GR-017)
