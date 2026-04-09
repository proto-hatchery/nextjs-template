# ⚠️ CRITICAL ARCHITECTURE RULES

**THESE RULES ARE NON-NEGOTIABLE. VIOLATIONS WILL BE REJECTED IMMEDIATELY.**

If you break these rules, the code **WILL NOT MERGE**. No exceptions.

---

## 🚫 RULE #1: NEVER Create Server Actions in `apps/`

### The Rule (In Simple Terms)

```
✅ packages/supabase-data/src/actions/  ← Actions live HERE
❌ apps/*/actions/                       ← NEVER HERE!
❌ apps/*/lib/actions/                   ← NEVER HERE!
❌ apps/*/lib/db/                        ← NEVER HERE!
```

### Why This Matters

| If you create action in...            | Consequence                            |
| ------------------------------------- | -------------------------------------- |
| `apps/example/actions/`               | ❌ **Architecture violation** — REJECT |
| `apps/example/lib/db/`                | ❌ **Architecture violation** — REJECT |
| `packages/supabase-data/src/actions/` | ✅ **Correct** — APPROVE               |

### Visual Example

```
❌ WRONG (DO NOT DO THIS):

apps/example/
├── actions/
│   └── user-actions.ts          ❌ REJECT THIS PR
├── lib/
│   └── db/
│       └── user-repository.ts   ❌ REJECT THIS PR
└── app/
    └── page.tsx
```

```
✅ CORRECT (ALWAYS DO THIS):

packages/supabase-data/src/actions/
├── users/
│   └── get-user-by-id.ts        ✅ APPROVE
└── profiles/
    └── update-profile.ts        ✅ APPROVE

apps/example/
└── app/
    └── page.tsx                  ✅ Imports from packages/
```

### Code Example

#### ❌ WRONG — Action in `apps/` (INSTANT REJECT)

```typescript
// File: apps/example/actions/create-user.ts
// 🚫 THIS FILE SHOULD NOT EXIST
// 🚫 DELETE IMMEDIATELY
// 🚫 DO NOT COMMIT

"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const createUser = authActionClient
  .inputSchema(
    z.object({
      name: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    // ...
  })
```

**If you see this code:**

1. ❌ **DO NOT MERGE**
2. 🗑️ **DELETE THE FILE**
3. 📦 **MOVE TO** `packages/supabase-data/src/actions/`
4. 📝 **UPDATE IMPORTS** in the app

---

#### ✅ CORRECT — Action in `packages/` (APPROVE)

```typescript
// File: packages/supabase-data/src/actions/users/create-user.ts
// ✅ THIS IS THE CORRECT LOCATION
// ✅ APPROVE THIS PR

"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const createUser = authActionClient
  .inputSchema(
    z.object({
      name: z.string().min(1, "Name is required"),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { name } = parsedInput

    // Your logic here
    return { success: true, id: "123" }
  })
```

**Then consume in app:**

```typescript
// File: apps/example/app/users/page.tsx
// ✅ Importing from package (CORRECT)

import { createUser } from '@workspace/supabase-data/actions/users/create-user'

export default async function UsersPage() {
  const result = await createUser({ name: 'John' })

  return <div>...</div>
}
```

---

## 🚫 RULE #2: NEVER Use `.schema()` with next-safe-action v8

### The Rule

```typescript
❌ .schema(z.object({...}))     ← DEPRECATED, DO NOT USE
✅ .inputSchema(z.object({...})) ← CORRECT, ALWAYS USE
```

### Why

- `next-safe-action v8` **CHANGED THE API**
- `.schema()` is **DEPRECATED** and will be removed
- Using deprecated methods shows **LAZY CODING**

### Code Example

#### ❌ WRONG — Deprecated API (REJECT)

```typescript
export const myAction = authActionClient
  .schema(
    z.object({
      // ❌ DEPRECATED!
      title: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    // ...
  })
```

**If you see this:**

1. ❌ **REQUEST CHANGES**
2. ✏️ **COMMENT:** "Use `.inputSchema()` not `.schema()` — see
   docs/tools/zod-v4-patterns.md"
3. 🔧 **FIX BEFORE MERGE**

---

#### ✅ CORRECT — Current API (APPROVE)

```typescript
export const myAction = authActionClient
  .inputSchema(
    z.object({
      // ✅ CORRECT!
      title: z.string().min(1, "Title required"),
    })
  )
  .action(async ({ parsedInput }) => {
    // ...
  })
```

---

## 🚫 RULE #3: NEVER Use Zod Validators Without `()`

### The Rule

```typescript
❌ z.string().uuid      ← WRONG (function reference)
✅ z.uuid()    ← CORRECT (function call)

❌ z.email     ← WRONG (function reference)
✅ z.email()   ← CORRECT (function call)

❌ z.url       ← WRONG (function reference)
✅ z.url()     ← CORRECT (function call)
```

### Why

- `.uuid` without `()` is a **FUNCTION REFERENCE**, not a validator
- This causes **RUNTIME ERRORS**
- This is **LAZY TYPING**

### Code Example

#### ❌ WRONG — Missing Parentheses (REJECT)

```typescript
const schema = z.object({
  id: z.string().uuid, // ❌ WRONG! This is a function reference
  email: z.email, // ❌ WRONG! This is a function reference
  website: z.url, // ❌ WRONG! This is a function reference
})
```

**If you see this:**

1. ❌ **REQUEST CHANGES**
2. ✏️ **COMMENT:** "Add `()` to validators — `.uuid()` not `.uuid`"
3. 🔧 **FIX BEFORE MERGE**

---

#### ✅ CORRECT — Function Calls (APPROVE)

```typescript
const schema = z.object({
  id: z.uuid(), // ✅ CORRECT! Function call
  email: z.email(), // ✅ CORRECT! Function call
  website: z.url(), // ✅ CORRECT! Function call
})
```

---

## 🚫 RULE #4: NEVER Import Server Code in Client Components

### The Rule

```typescript
// File with "use client" directive
"use client"

❌ import { createServerClient } from "@supabase/ssr"  // SERVER IMPORT!
❌ import { getClaims } from "@/lib/auth"               // SERVER IMPORT!
❌ import { someAction } from "@/actions"               // SERVER IMPORT!
```

### Why

- Client components run **IN THE BROWSER**
- Server code runs **ON THE SERVER**
- Mixing them causes **RUNTIME ERRORS**

### Code Example

#### ❌ WRONG — Server Import in Client (REJECT)

```typescript
// File: apps/example/components/user-profile.tsx
"use client" // ← This is a CLIENT component

import { createServerClient } from "@supabase/ssr" // ❌ SERVER IMPORT!

export function UserProfile() {
  const supabase = createServerClient() // ❌ WILL FAIL AT RUNTIME
  // ...
}
```

**If you see this:**

1. ❌ **REQUEST CHANGES**
2. ✏️ **COMMENT:** "Cannot import server code in client components. Use Server
   Actions instead."
3. 🔧 **REFACTOR BEFORE MERGE**

---

#### ✅ CORRECT — Server Action Pattern (APPROVE)

```typescript
// File: packages/supabase-data/src/actions/users/get-profile.ts
"use server" // ← This is a SERVER action

import { createServerClient } from "@supabase/ssr"

export async function getProfile() {
  const supabase = createServerClient()
  return supabase.from("profiles").select().single()
}
```

```typescript
// File: apps/example/components/user-profile.tsx
"use client" // ← Client component

import { getProfile } from "@workspace/supabase-data/actions/users/get-profile"

export function UserProfile() {
  const handleLoad = async () => {
    const profile = await getProfile() // ✅ Calls server action
    // ...
  }
}
```

---

## 🚫 RULE #5: NEVER Create Barrel Exports (`index.ts`)

### The Rule

```typescript
// File: packages/supabase-data/src/actions/index.ts
// ❌ DO NOT CREATE THIS FILE!

export * from "./users/get-user"
export * from "./profiles/update-profile"
export * from "./roles/sync-roles"
```

### Why

- **Hidden dependencies** — Can't see what's imported
- **Poor tree-shaking** — Bundles unused code
- **Circular dependency risk** — Hard to track import chains
- **Violates GR-001** — Zero-Barrel Policy

### Code Example

#### ❌ WRONG — Barrel Export (REJECT)

```typescript
// File: packages/supabase-data/src/actions/index.ts
export * from "./users/get-user"
export * from "./profiles/update-profile"
```

```typescript
// File: apps/example/app/page.tsx
import { getUser, updateProfile } from "@workspace/supabase-data/actions" // ❌ BARREL!
```

**If you see this:**

1. ❌ **REQUEST CHANGES**
2. ✏️ **COMMENT:** "Use explicit imports — no barrel exports (GR-001)"
3. 🔧 **FIX BEFORE MERGE**

---

#### ✅ CORRECT — Explicit Imports (APPROVE)

```typescript
// File: apps/example/app/page.tsx
import { getUser } from "@workspace/supabase-data/actions/users/get-user"
import { updateProfile } from "@workspace/supabase-data/actions/profiles/update-profile"
```

---

## 🚫 RULE #6: Mutation Hooks Do NOT Exist

### The Rule

```
❌ use-*-mutation.hook.codegen.ts   ← DOES NOT EXIST — DO NOT CREATE
❌ useMutation from @tanstack/react-query for DB writes ← DO NOT USE for mutations
✅ Server Action via authActionClient → revalidatePath()  ← THE ONLY WRITE PATH
```

### Why

- Mutation hooks were removed in favor of a server-first write path.
- The codegen pipeline does **not** generate mutation hooks.
- All database writes must go through Server Actions.
- If you create mutation hook files, they will be rejected.

### The Correct Write Path

```
RHF form (useAppForm / useActionForm)
  → useAction (next-safe-action/hooks)
  → app-local *.action.ts  (thin orchestrator in apps/)
  → generated Server Action  (@workspace/supabase-data/actions/*)
  → revalidatePath()
```

### Code Example

#### ❌ WRONG — Mutation hook (INSTANT REJECT)

```typescript
// File: packages/supabase-data/src/hooks/patients/use-patient-mutation.hook.codegen.ts
// 🚫 THIS FILE SHOULD NOT EXIST
// 🚫 DELETE IMMEDIATELY

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPatientAction } from "@workspace/supabase-data/actions/patients/create-patient"

export function useCreatePatientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPatientAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  })
}
```

#### ✅ CORRECT — Server Action + form island (APPROVE)

```typescript
// File: apps/example/features/patients/_components/create-patient-form.tsx
"use client"

import { useActionForm } from "@workspace/forms/hooks/use-action-form"
import { createPatientAction } from "@workspace/supabase-data/actions/patients/create-patient"

export function CreatePatientForm({ initialValues }: Props) {
  const { form, handleSubmitWithAction, action } = useActionForm({
    action: createPatientAction,
    schema: createPatientSchema,
    defaultValues: initialValues,
  })

  return (
    <form onSubmit={handleSubmitWithAction}>
      {/* fields */}
      <Button disabled={action.isPending}>Create</Button>
    </form>
  )
}
```

---

## 🚫 RULE #7: authActionClient Comes From `@workspace/safe-action` Only

### The Rule

```typescript
✅ import { authActionClient } from '@workspace/safe-action'
❌ import { authActionClient } from '@workspace/supabase-auth/server'
❌ import { authActionClient } from anywhere else
```

`authActionClient` is defined exclusively in `@workspace/safe-action`. Any
other import path is incorrect and will cause a runtime error.

---

Before approving ANY PR, verify:

```
□ No files in apps/*/actions/
□ No files in apps/*/lib/db/
□ No files in apps/*/lib/repositories/
□ All actions in packages/supabase-data/src/actions/
□ Using .inputSchema() not .schema()
□ All Zod validators have () (uuid(), email(), url())
□ No server imports in "use client" files
□ No barrel exports (index.ts re-exporting)
□ Imports are explicit (no barrels)
□ No use-*-mutation.hook.*.ts files created
□ authActionClient imported from @workspace/safe-action only
□ @tanstack/react-form not used (React Hook Form only)
```

**If ANY box is unchecked → REQUEST CHANGES**

---

## 🎯 Quick Reference

| Pattern          | Wrong                             | Correct                               |
| ---------------- | --------------------------------- | ------------------------------------- |
| Action location  | `apps/example/actions/`           | `packages/supabase-data/src/actions/` |
| next-safe-action | `.schema()`                       | `.inputSchema()`                      |
| Zod UUID         | `z.string().uuid`                 | `z.uuid()`                   |
| Zod Email        | `z.email`                | `z.email()`                  |
| Zod URL          | `z.url`                  | `z.url()`                    |
| Client imports   | Server client in client component | Server Action called from client      |
| Exports          | `index.ts` barrel                 | Explicit paths                        |
| Write path       | `use-*-mutation.hook.codegen.ts`  | Server Action + `revalidatePath()`    |
| authActionClient | `@workspace/supabase-auth/server` | `@workspace/safe-action`              |
| Form library     | `@tanstack/react-form`            | `react-hook-form` (useAppForm / useActionForm) |

---

## 🔗 Related Documentation

- [`.cursor/rules/actions-location.mdc`](/.cursor/rules/actions-location.mdc) —
  Cursor rule for action location
- [`.cursor/rules/zod-v4-syntax.mdc`](/.cursor/rules/zod-v4-syntax.mdc) — Cursor
  rule for Zod syntax
- [`docs/tools/zod-v4-patterns.md`](/docs/tools/zod-v4-patterns.md) — Complete
  Zod v4 guide
- [`docs/tools/next-safe-action.md`](/docs/tools/next-safe-action.md) —
  next-safe-action patterns
- [`docs/standards/golden-rules.md`](/docs/standards/golden-rules.md) — GR-001
  (Zero-Barrel Policy)
- [`docs/architecture/system.md`](/docs/architecture/system.md) — Architecture
  overview

---

## ⚖️ Enforcement

| Violation                  | Consequence         |
| -------------------------- | ------------------- |
| Action in `apps/`          | **INSTANT REJECT**  |
| Using `.schema()`          | **REQUEST CHANGES** |
| Missing `()` on validators | **REQUEST CHANGES** |
| Server import in client    | **INSTANT REJECT**  |
| Barrel export              | **REQUEST CHANGES** |
| Mutation hook file created | **INSTANT REJECT**  |
| Wrong authActionClient source | **REQUEST CHANGES** |
| Using `@tanstack/react-form` | **REQUEST CHANGES** |

**No warnings. No exceptions. Fix before merge.**

---

**Last Updated:** 2026-04-04  
**Version:** 1.0.0  
**Enforcement:** AUTOMATED + HUMAN REVIEW
