---
title: Server Actions Standard
---

# Server Actions Standard

## Action client

Always import from `@workspace/safe-action`. Never define
`createSafeActionClient()` in an app. Never copy `authActionClient` into an
app-local file.

## Schema method

Use `.inputSchema()`. This is next-safe-action v8 API.
`.schema()` is v7 API and must not be used.

## Revalidation

Call `revalidatePath()` inside the action body after every successful write.
Use `"layout"` when the full section tree must revalidate:

```ts
revalidatePath("/[locale]/(workspace)/(settings)/preferences", "layout")
```

Never call `router.refresh()` from a client component when a Server Action is
the mutation transport. `revalidatePath()` handles RSC invalidation server-side.

## Error handling

Do not throw inside action bodies. Return typed error states or use
`returnValidationErrors()` from `next-safe-action` for field-level errors.
The adapter automatically maps these to RHF `FieldErrors`.

## File naming and location

Server Action files are named `*.action.ts`.
They live in an `_actions/` directory inside the route segment that uses them.
They are not shared across routes. If two routes need the same write logic,
that logic belongs in a shared server-side helper in `@workspace/supabase-data`.

## Insert-or-update

The insert-or-update decision belongs inside the Server Action body.
It uses `ctx.userId` to check for an existing record and branches accordingly.
Client form islands never know which path was taken.
