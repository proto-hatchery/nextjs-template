# next-safe-action

## What It Does

next-safe-action is a library for building type-safe Server Actions in Next.js
applications. It provides:

- **Type-safe actions**: Full type inference from schema to component
- **Input validation**: Zod schema validation for action inputs
- **Error handling**: Structured error responses with typed errors
- **Middleware support**: Auth and other middleware patterns
- **Optimistic updates**: Built-in support for optimistic UI updates
- **Server component integration**: Works seamlessly with React Server
  Components

## Why It Matters for AI-Assisted Development

When working with AI coding assistants, type safety and consistency are crucial:

1. **Prevents runtime errors**: Type inference catches mistakes before
   deployment
2. **Consistent patterns**: Enforces a standard pattern for all Server Actions
3. **Auth middleware**: Built-in auth handling reduces boilerplate and errors
4. **Better DX**: AI can generate correctly typed actions automatically
5. **Self-documenting**: Types serve as documentation for action inputs/outputs

## How to Use It

### Basic Action

```typescript
"use server"

import { actionClient } from "@workspace/safe-action"
import { z } from "zod"

export const createTask = actionClient
  .schema(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { title, description } = parsedInput

    // Create task in database
    const task = await db.task.create({
      data: { title, description },
    })

    return { success: true, task }
  })
```

### Auth Action (Recommended Pattern)

```typescript
"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const updateUserProfile = authActionClient
  .schema(
    z.object({
      name: z.string().min(1),
      email: z.email(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId is available from auth middleware
    const { name, email } = parsedInput

    const user = await db.user.update({
      where: { id: ctx.userId },
      data: { name, email },
    })

    return { success: true, user }
  })
```

### Using in Client Components

```typescript
'use client'

import { useAction } from 'next-safe-action/hooks'
import { createTask } from './actions'

export function CreateTaskForm() {
  const { execute, result, isPending } = useAction(createTask)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    execute({
      title: formData.get('title') as string,
      description: formData.get('description') as string
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Task title" />
      <textarea name="description" placeholder="Description" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Task'}
      </button>

      {result.data?.success && (
        <div className="success">Task created!</div>
      )}

      {result.serverError && (
        <div className="error">{result.serverError}</div>
      )}
    </form>
  )
}
```

## Configuration

### Base Action Client

```typescript
// packages/safe-action/src/index.ts
import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"

export const actionClient = createSafeActionClient()
```

### Auth Action Client (Recommended)

```typescript
// packages/safe-action/src/index.ts
import { createSafeActionClient } from "next-safe-action"
import { getClaims } from "@workspace/supabase-auth/session"

export const authActionClient = actionClient.use(async ({ next, ctx }) => {
  const claims = await getClaims()

  if (!claims?.sub) {
    throw new Error("Unauthorized")
  }

  return next({ ctx: { userId: claims.sub } })
})
```

## Common Patterns

### 1. Action with Metadata

```typescript
export const createTask = actionClient
  .schema(z.object({ title: z.string() }))
  .metadata({ action: "createTask" })
  .action(async ({ parsedInput, metadata }) => {
    // Log action execution
    console.log(`Executing ${metadata.action}`)

    return await db.task.create({
      data: { title: parsedInput.title },
    })
  })
```

### 2. Action with Error Handling

```typescript
export const deleteTask = authActionClient
  .schema(z.object({ id: z.uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    try {
      await db.task.delete({
        where: {
          id: parsedInput.id,
          userId: ctx.userId,
        },
      })

      return { success: true }
    } catch (error) {
      throw new Error("Failed to delete task")
    }
  })
```

### 3. Chained Middleware

```typescript
const rateLimitedAction = actionClient
  .use(rateLimitMiddleware)
  .use(loggingMiddleware)
  .use(authMiddleware)
```

## Integration with AI-Assisted Development

### AI Prompt Examples

**Good prompt:**

```
Create a Server Action using authActionClient that creates a new task with title and description. Use Zod for validation.
```

**AI will generate:**

```typescript
"use server"

import { authActionClient } from "@workspace/safe-action"
import { z } from "zod"

export const createTask = authActionClient
  .schema(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    return await db.task.create({
      data: {
        title: parsedInput.title,
        description: parsedInput.description,
        userId: ctx.userId,
      },
    })
  })
```

## Best Practices

1. **Always use authActionClient for authenticated actions**: Don't manually
   call getClaims()
2. **Validate all inputs**: Use Zod schemas for every action
3. **Return typed responses**: Define clear success/error types
4. **Use middleware**: Let middleware handle cross-cutting concerns
5. **Keep actions small**: One action = one operation
6. **Handle errors gracefully**: Return structured error responses

## Related Rules

- [use-safe-actions](../../.cursor/rules/use-safe-actions.mdc) - Always use
  authActionClient
- [auth-invariants](../../.cursor/rules/auth-invariants.mdc) - Auth pattern
  enforcement

## References

- [next-safe-action Documentation](https://next-safe-action.dev/)
- [next-safe-action GitHub Repository](https://github.com/TheEdoRan/next-safe-action)
