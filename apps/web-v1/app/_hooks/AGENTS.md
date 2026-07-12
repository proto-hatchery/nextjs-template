# `app/_hooks` — web-v1 app

**Audience:** agents / LLM. Human overview: `apps/web-v1/README.md`.

## Scope

Hooks used **only by this app** (`apps/web-v1`). Not for `packages/*` shared
code.

## Naming

Use plain app-local hook filenames.

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
