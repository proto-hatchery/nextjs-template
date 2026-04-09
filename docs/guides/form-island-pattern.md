---
title: Form Island Pattern
---

# Form Island Pattern

This guide defines the canonical pattern for all writable UI in this template.

## What is a form island

A form island is a narrow `"use client"` component that owns:

- form state and validation
- submission logic
- pending and error feedback

The surrounding page, layout, card, and navigation remain Server Components.
Only the form body is client-side.

## Two variants

### Variant A — Browser SDK forms (auth flows)

Use this for forms that submit to a browser-side SDK (Supabase Auth, OAuth).
Server Actions are not appropriate here because the auth client runs in the browser.

Hook: `useAppForm` from `@workspace/forms/hooks/use-app-form`

```tsx
const form = useAppForm({ schema, defaultValues })

async function onSubmit(value: z.output<typeof schema>) {
  await authClient.signIn(value)
}

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      ...
      <Button disabled={form.formState.isSubmitting}>Submit</Button>
    </form>
  </Form>
)
```

`router.refresh()` is permitted after auth SDK calls when RSC reconciliation
is required (for example MFA challenge completing a session).

### Variant B — Server Action forms (all server-first writable routes)

Use this for settings, configuration, profile, and any writable server-first page.

Hook: `useActionForm` from `@workspace/forms/hooks/use-action-form`

```tsx
const { form, handleSubmitWithAction, action } = useActionForm({
  action: myServerAction,
  schema: mySchema,
  defaultValues: initialValues,
  values: initialValues,
})

return (
  <Form {...form}>
    <form onSubmit={handleSubmitWithAction}>
      ...
      {action.result.serverError && <p>{action.result.serverError}</p>}
      <Button disabled={action.isPending}>Submit</Button>
    </form>
  </Form>
)
```

`router.refresh()` is never called in Variant B forms. `revalidatePath()`
inside the Server Action handles RSC revalidation in the same round trip.

## Pending state rules

- Variant A: `form.formState.isSubmitting`
- Variant B: `action.isPending`
- Never combine two pending signals manually

## Form re-sync after `revalidatePath`

Pass `initialValues` to both `defaultValues` and `values` in `useActionForm`.
The `values` option in React Hook Form syncs the form to external data when the
reference changes, without overriding fields the user is currently editing.
This is the only mechanism needed: no `useEffect`, no `useTransition`, no
`reset()` call.

## Field-level validation errors from Server Actions

`useActionForm` via the next-safe-action adapter automatically maps
`validationErrors` from the Server Action response to RHF `FieldErrors`.
These are displayed automatically by `FormMessage` in each field's `FormItem`.
You do not need to call `form.setError()` manually.

## What form islands must not do

- Import server-only modules or route adapters
- Call `router.refresh()` in Variant B
- Know about Supabase, repository, or database details
- Contain section framing, navigation, or card layout
- Duplicate the insert-or-update decision
