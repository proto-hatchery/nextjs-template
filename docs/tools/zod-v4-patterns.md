# Zod v4 Patterns for AI Agents

This document provides the **correct Zod v4 syntax** for this template. AI
agents must follow these patterns to avoid deprecated APIs and type errors.

---

## Common Validators (Zod v4)

### Strings

```typescript
import { z } from "zod"

// Basic string
const name = z.string()

// String with minimum length (required)
const title = z.string().min(1) // ✅ Correct v4

// String with maximum length
const shortText = z.string().max(100)

// String with exact length
const code = z.string().length(6)

// Email validation
const email = z.email()

// UUID validation
const id = z.uuid() // ✅ Correct v4

// URL validation
const website = z.url()

// Regex pattern
const slug = z.string().regex(/^[a-z0-9-]+$/)

// Optional string (can be undefined)
const optionalDescription = z.string().optional()

// Nullable string (can be null)
const nullableField = z.string().nullable()

// String with default value
const status = z.string().default("draft")
```

### Numbers

```typescript
// Basic number
const age = z.number()

// Positive number only
const positiveCount = z.number().positive()

// Non-negative (zero or positive)
const nonNegative = z.number().nonnegative()

// Number in range
const rating = z.number().min(1).max(5)

// Integer only
const count = z.number().int()

// Optional number
const optionalAge = z.number().optional()
```

### Booleans

```typescript
// Basic boolean
const isActive = z.boolean()

// Boolean with default
const isPublic = z.boolean().default(false)
```

### Arrays

```typescript
// Array of strings
const tags = z.array(z.string())

// Array with minimum items
const selections = z.array(z.string()).min(1)

// Array of numbers
const scores = z.array(z.number())
```

### Objects

```typescript
// Basic object
const user = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  age: z.number().optional(),
})

// Object with unknown keys allowed
const flexible = z.object({}).passthrough()

// Object with strict keys (no extra allowed)
const strict = z
  .object({
    name: z.string(),
  })
  .strict()
```

### Enums

```typescript
// Native TypeScript enum
enum Status {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

const status = z.nativeEnum(Status)

// Union of string literals (preferred)
const role = z.enum(["admin", "user", "guest"])

// Union of mixed types
const id = z.union([z.uuid(), z.number()])
```

### Advanced Patterns

```typescript
// Record (key-value map)
const metadata = z.record(z.string(), z.any())

// Tuple (fixed-length array with specific types)
const coordinate = z.tuple([z.number(), z.number()])

// Intersection (A AND B)
const combined = z.object({ a: z.string() }).and(z.object({ b: z.number() }))

// Discriminated union
const result = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("error"), error: z.string() }),
])

// Refinement (custom validation)
const password = z
  .string()
  .refine((val) => val.length >= 8 && /[A-Z]/.test(val), {
    message: "Password must be 8+ chars with uppercase",
  })

// Transform (modify value during parsing)
const trimmed = z.string().transform((val) => val.trim())

// Preprocess (run before validation)
const numericString = z.preprocess((val) => Number(val), z.number())
```

---

## next-safe-action Integration

### Where Actions Live

**✅ CORRECT:** `packages/supabase-data/src/actions/{module}/`  
**❌ FORBIDDEN:** `apps/*/actions/` or `apps/*/lib/`

See [`.cursor/rules/actions-location.mdc`](/.cursor/rules/actions-location.mdc)
for architecture rules.

### Basic Server Action

```typescript
"use server"

// File: packages/supabase-data/src/actions/posts/create-post.ts
import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const createPost = authActionClient
  .inputSchema(
    z.object({
      title: z.string().min(1),
      content: z.string().min(10),
    })
  )
  .action(async ({ parsedInput }) => {
    const { title, content } = parsedInput
    // Your logic here
    return { success: true, id: "123" }
  })
```

### Authenticated Server Action

```typescript
"use server"

// File: packages/supabase-data/src/actions/profiles/update-profile.ts
import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const updateProfile = authActionClient
  .inputSchema(
    z.object({
      name: z.string().min(1),
      email: z.email(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId is available (from auth middleware)
    const { name, email } = parsedInput
    // Update user profile
    return { success: true }
  })
```

### Consuming Actions in Apps

```typescript
// File: apps/example/app/profile/page.tsx
import { updateProfile } from '@workspace/supabase-data/actions/profiles/update-profile'

export default async function ProfilePage() {
  const result = await updateProfile({ name: 'John', email: 'john@example.com' })

  if (result.success) {
    // Handle success
  }

  return <div>...</div>
}
```

### Action with Metadata

```typescript
"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const deleteItem = authActionClient
  .inputSchema(
    z.object({
      id: z.uuid(),
    })
  )
  .metadata({ name: "deleteItem" })
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput
    // Delete logic
    return { success: true }
  })
```

### Action Returning Data

```typescript
"use server"

import { actionClient } from "@workspace/safe-action"
import { z } from "zod"

export const getUser = actionClient
  .inputSchema(
    z.object({
      id: z.uuid(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput
    const user = await db.user.findUnique({ where: { id } })

    if (!user) {
      throw new Error("User not found")
    }

    return user // Type is inferred automatically
  })
```

---

## Common Mistakes to Avoid

### ❌ Wrong: Using deprecated `.schema()` method

```typescript
// WRONG (v3 syntax)
export const action = actionClient
  .schema(z.object({ ... })) // ❌ Deprecated in v8
  .action(...)
```

### ✅ Correct: Use `.inputSchema()`

```typescript
// CORRECT (v4 syntax)
export const action = actionClient
  .inputSchema(z.object({ ... })) // ✅ Correct v8
  .action(...)
```

### ❌ Wrong: Using `.string().uuid()` incorrectly

```typescript
// WRONG - missing parentheses
const id = z.string().uuid // ❌ This is a function reference

// WRONG - typo
const id = z.string().uid() // ❌ Not a valid method
```

### ✅ Correct: Call the validator

```typescript
// CORRECT
const id = z.uuid() // ✅ Function call with ()
```

### ❌ Wrong: Optional vs nullable confusion

```typescript
// WRONG - these are different!
const a = z.string().optional() // string | undefined
const b = z.string().nullable() // string | null
```

### ✅ Correct: Choose based on your needs

```typescript
// Use optional when field can be undefined
const profile = z.object({
  bio: z.string().optional(), // May not be set
})

// Use nullable when field can be null
const user = z.object({
  deletedAt: z.string().nullable(), // Can be null
})
```

---

## Quick Reference Table

| Validator               | Purpose          | Example                               |
| ----------------------- | ---------------- | ------------------------------------- |
| `z.string().min(1)`     | Required string  | `title: z.string().min(1)`            |
| `z.email()`    | Email format     | `email: z.email()`           |
| `z.uuid()`     | UUID format      | `id: z.uuid()`               |
| `z.url()`      | URL format       | `website: z.url()`           |
| `z.number().positive()` | Positive number  | `age: z.number().positive()`          |
| `z.number().int()`      | Integer only     | `count: z.number().int()`             |
| `z.boolean()`           | Boolean          | `isActive: z.boolean()`               |
| `z.array(z.string())`   | String array     | `tags: z.array(z.string())`           |
| `z.enum([...])`         | Enum             | `role: z.enum(['admin', 'user'])`     |
| `.optional()`           | Can be undefined | `bio: z.string().optional()`          |
| `.nullable()`           | Can be null      | `deletedAt: z.string().nullable()`    |
| `.default(value)`       | Default value    | `status: z.string().default('draft')` |

---

## Why This Matters for AI Agents

1. **Type Safety**: Zod v4 has breaking changes from v3. Using wrong syntax
   causes compile errors.
2. **next-safe-action v8**: Uses `.inputSchema()` instead of `.schema()`.
3. **Consistency**: All Server Actions must follow the same pattern for AI
   agents to learn and replicate.
4. **Autocomplete**: Correct types give AI agents better autocomplete
   suggestions.

---

## Resources

- [Zod v4 Documentation](https://zod.dev/)
- [next-safe-action v8 Docs](https://next-safe-action.dev/)
- [Standard Schema Spec](https://standardschema.dev/)
