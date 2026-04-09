---
title: Safe Action Client Architecture
---

# Safe Action Client Architecture

## Source of truth

The action client is defined once in `@workspace/safe-action`.

`packages/safe-action/src/index.ts`

This package exports:

- `actionClient` — unauthenticated base client for public actions
- `authActionClient` — authenticated client that injects `{ userId }` into `ctx`

## Never define a new action client in an app

App-local `safe-action.ts` files must not exist. Any app that needs to define
a Server Action imports from `@workspace/safe-action` directly.

## `ctx` shape

`authActionClient` injects the following into every action body:

```ts
ctx: {
  userId: string
}
```

## Syntax (next-safe-action v8)

Use `.inputSchema()` to define the input validator. Do not use `.schema()`.

```ts
export const myAction = authActionClient
  .inputSchema(myZodSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId is available here
    // parsedInput is fully typed and Zod-validated
  })
```

## Adding a new Server Action

1. Create a file named `*.action.ts` with `"use server"` at the top
2. Import `authActionClient` from `@workspace/safe-action`
3. Define schema with `.inputSchema()`
4. Call `revalidatePath()` at the end of the action body for server-first routes
5. Return a typed success object
6. Never throw inside the action body. Return error states or use
   `returnValidationErrors()` from `next-safe-action`
