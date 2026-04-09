---
title: Form Library Standard
---

# Form Library Standard

## Single library: React Hook Form

React Hook Form is the only form library used in this template.
`@tanstack/react-form` must not be used in new code.

## Hooks

Import `useAppForm` from `@workspace/forms/hooks/use-app-form`
for browser SDK forms such as auth and OAuth.

Import `useActionForm` from `@workspace/forms/hooks/use-action-form`
for Server Action forms such as settings, configuration, and other writable
server-first pages.

## UI components

Import `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`,
`FormDescription`, and `FormMessage` from `@workspace/ui/components/form`.

These are the only form layout primitives. Do not build custom form layout
components. Do not use `div` wrappers where `FormItem` is appropriate.

## Schema validation

Schemas are Zod schemas. Always pass `schema` to `useAppForm` or
`useActionForm`. Never import `zodResolver` directly in a form island.

## Pending state

- Browser SDK forms: `form.formState.isSubmitting`
- Server Action forms: `action.isPending` from `useActionForm`
- Never use `useTransition` to track form pending state
