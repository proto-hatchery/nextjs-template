# Actions & Server Actions Semantic Codegen (Phase B)

**Semantic codegen pipeline** for automatically filling TODOs left by
deterministic codegen (Phase A). This pipeline generates **Server Actions
only**. Query hooks are also generated (read-only). Mutation hooks do not
exist and are not generated.

## Architecture

```
Write path:
  RHF form (useAppForm / useActionForm)
    → useAction (next-safe-action/hooks)
    → app-local *.action.ts  (thin orchestrator)
    → generated Server Action  (@workspace/supabase-data/actions/*)
    → revalidatePath()

Read path:
  Server Component
    → generated Server Action  (@workspace/supabase-data/actions/*)

Query hooks (read-only, generated):
  @workspace/supabase-data/hooks/*/use-*-query.hook.codegen.ts
  → called from client components that need reactive state
```

## What is generated vs what is not

| Artifact | Generated? |
|---|---|
| Server Actions (`*.codegen.ts`) | ✅ Yes |
| Query hooks (`use-*-query.hook.codegen.ts`) | ✅ Yes |
| Query keys (`query-keys.codegen.ts`) | ✅ Yes |
| Mutation hooks (`use-*-mutation.hook.codegen.ts`) | ❌ **No — do not create** |

## Pipeline phases

### Phase A — Deterministic

- **Script:** `pnpm codegen:actions-hooks --write`
- **What it does:** Generates file structure, imports, auth, logging
- **Result:** Stubs with TODOs in the right places
- **Limitation:** Does not know specific business rules

### Phase B — Semantic → Deterministic

- **Scripts:**
  - `pnpm codegen:actions-semantic-plan` (LLM/analyst)
  - `pnpm codegen:actions-fill-todos` (deterministic)
- **What it does:** Analyzes semantics and fills TODOs
- **Result:** Complete, typed implementations

## ASCII flow

```
┌─────────────────────────────────────────────────────────────┐
│  Phase A (Deterministic)                                    │
│  pnpm codegen:actions-hooks --write                         │
│                                                             │
│  Generates:                                                 │
│  - File structure                                           │
│  - Correct imports                                          │
│  - Authentication (getClaims)                               │
│  - Structured logging                                       │
│  - TODOs in the right places                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase B.1 (Semantic — LLM)                                 │
│  pnpm codegen:actions-semantic-plan                         │
│                                                             │
│  Generates: config/action-semantic-plan.json                │
│  - Specific input schemas                                   │
│  - Output schemas                                           │
│  - Repository calls                                         │
│  - Auth rules                                               │
│  - Logging metadata                                         │
│  - Cache invalidation (via revalidatePath)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase B.2 (Deterministic)                                  │
│  pnpm codegen:actions-fill-todos --plan ...                 │
│                                                             │
│  Generates: Complete TypeScript code                        │
│  - Reads semantic JSON                                      │
│  - Applies templates                                        │
│  - Fills TODOs                                              │
│  - Generates final code                                     │
└─────────────────────────────────────────────────────────────┘
```

## Workflow

### 1. Generate Phase A (Stubs)

```bash
pnpm codegen:actions-hooks --write
```

This generates ~290 Server Actions + ~146 query hooks with TODOs.

### 2. Analyze Semantically (LLM)

```bash
pnpm codegen:actions-semantic-plan
```

**Output:** `config/action-semantic-plan.json`

This JSON contains the semantic plan for each action.

**Example JSON entry:**

```json
{
  "version": 1,
  "generatedAt": "2026-04-07T10:00:00.000Z",
  "actions": [
    {
      "domainId": "catalog",
      "table": "reference_values",
      "method": "list",
      "actionName": "listReferenceValuesAction",
      "inputSchema": {
        "zodSchema": "z.object({\n  scope: z.string().optional(),\n  limit: z.number().int().positive().max(100).default(50),\n  offset: z.number().int().nonnegative().default(0),\n})",
        "typeName": "ListReferenceValuesInput",
        "fields": [
          {
            "name": "scope",
            "type": "string",
            "validation": [],
            "required": false,
            "description": "Filter by scope"
          },
          {
            "name": "limit",
            "type": "number",
            "validation": ["int", "positive", "max(100)"],
            "required": false,
            "description": "Pagination limit"
          }
        ]
      },
      "outputSchema": {
        "returnType": "Promise<{ data: ReferenceValuesDTO[]; total: number }>",
        "fields": [
          { "name": "data", "type": "ReferenceValuesDTO[]", "source": "row" },
          { "name": "total", "type": "number", "source": "computed" }
        ]
      },
      "repositoryCall": {
        "method": "list",
        "arguments": [
          "{ scope: validated.scope, limit: validated.limit, offset: validated.offset }"
        ],
        "errorHandling": true
      },
      "auth": {
        "tenantScoping": false,
        "customChecks": []
      },
      "logging": {
        "successMetadata": [
          "count: data.length",
          "total",
          "scope: validated.scope"
        ],
        "errorMetadata": ["input: JSON.stringify(input)"]
      },
      "cacheInvalidation": {
        "revalidatePaths": ["/settings"],
        "optimisticUpdate": false
      },
      "notes": [
        "✅ Catalog tables are public read-only",
        "⚠️ Consider caching for frequently accessed reference values"
      ]
    }
  ]
}
```

### 3. Fill TODOs (Deterministic)

```bash
pnpm codegen:actions-fill-todos --plan config/action-semantic-plan.json
```

This reads the JSON and generates complete TypeScript.

**Result:**

```typescript
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { ReferenceValuesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/reference-values-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"

const ListReferenceValuesInputSchema = z.object({
  scope: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
})

export type ListReferenceValuesInput = z.infer<
  typeof ListReferenceValuesInputSchema
>

export async function listReferenceValuesAction(
  input: ListReferenceValuesInput
): Promise<{ data: ReferenceValuesDTO[]; total: number }> {
  const startedAt = Date.now()

  const claims = await requireAuth({
    action: "list_reference-values",
  })

  const userId = claims.sub

  try {
    const validated = ListReferenceValuesInputSchema.parse(input)

    const supabase = await createServerAuthClient()
    const repository = new ReferenceValuesSupabaseRepository(supabase)

    const result = await repository.list({
      scope: validated.scope,
      limit: validated.limit,
      offset: validated.offset,
    })

    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "catalog.reference-values.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_reference-values_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      count: result.length,
      total: result.length,
      scope: validated.scope,
      service: "supabase-data",
    })

    return { data: result, total: result.length }
  } catch (error) {
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "catalog.reference-values.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_reference-values_failed",
      operation: "list",
      operationType: "action",
      outcome: "failure",
      error,
      input: JSON.stringify(input),
      service: "supabase-data",
    })

    throw error
  }
}
```

## What the semantic analysis must consider

1. **Database schema:** column types, constraints, FKs and relationships
2. **Business rules:** required vs optional fields, specific validations, tenant
   isolation rules
3. **Auth & Authorization:** specific role requirements, tenant scoping, custom
   checks
4. **Performance:** pagination, cache invalidation via `revalidatePath()`
5. **Logging & Observability:** useful debug metadata, entity IDs, correlation IDs

## Validation

After generating code:

```bash
pnpm typecheck
pnpm lint
pnpm check:forbidden
```

## Related

- [Backend codegen](./backend-codegen.md)
- [Data access pattern](../architecture/data-access-pattern.md)
- [LLM-to-LLM prompt](./llm-prompt-action-hook-codegen.md)
- [Form island pattern](./form-island-pattern.md)
