# `app/_hooks` — example app

**Audience:** agents / LLM. Human overview: `apps/example/README.md`.

## Scope

Hooks used **only by this app** (`apps/example`). Not for `packages/*` shared
code.

## Naming: `*.example.ts` / `*.example.tsx`

Template scaffolding: suffix **`.example`** flags files to rename/remove on fork
(e.g. `use-foo.example.ts` → `use-foo.ts`). Plain names allowed if you prefer.

**Do not** use `*.hook.ts` / `*.component.tsx` / `*.provider.tsx` here — those
filename patterns are **only** for composition packages under `packages/`
(`brand`, `core`, `forms`, `seo`). See
[`docs/standards/package-file-suffixes.md`](../../../../docs/standards/package-file-suffixes.md).

## Do not put here

Shared hooks → `packages/core/src/hooks/` or a domain package.

## vs `_providers`

| Folder        | Contents                                        |
| ------------- | ----------------------------------------------- |
| `_providers/` | Provider trees; thin `@workspace/core` wrappers |
| `_hooks/`     | `use*` hooks only; no provider components       |

Both may use `*.example.*` for the same fork reason.
