# Golden rules & standards

**These rules are mandatory for all contributors.** The same rule set exists in
two places (keep them in sync):

| Source                                          | Audience                                        |
| ----------------------------------------------- | ----------------------------------------------- |
| [`.cursor/rules/*.mdc`](../../../.cursor/rules) | Cursor / editor AI                              |
| **`docs/standards/rules/*.md`** (this folder)   | Everyone else (CLI, review, non-Cursor editors) |

There is **exactly one `.md` file per `.mdc` file** (32 rules). Parity is
checked in CI: `pnpm check:cursor-rules-parity`. The sync script **copies** each
`.mdc` into the matching `.md` (plain files, **not** symlinks); edit the `.mdc`
in `.cursor/rules/`, then run `node scripts/ci/sync-cursor-rules-to-docs.mjs`.

**See also (not a numbered Cursor rule):**
[Package file suffixes](../package-file-suffixes.md) — `*.component.tsx` /
`*.hook.ts` / `*.provider.tsx` in composition packages only; `packages/ui`
excluded.

---

## Index (32 rules)

| #   | Rule                             | File                                                                         |
| --- | -------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Actions location                 | [actions-location.md](./actions-location.md)                                 |
| 2   | Auth invariants                  | [auth-invariants.md](./auth-invariants.md)                                   |
| 3   | Changelog required               | [changelog-required.md](./changelog-required.md)                             |
| 4   | Change routing map               | [change-routing-map.md](./change-routing-map.md)                             |
| 5   | CLI migrations only              | [cli-migrations-only.md](./cli-migrations-only.md)                           |
| 6   | Client data sync / optimistic UI | [client-data-sync-optimistic.md](./client-data-sync-optimistic.md)           |
| 7   | Commit workflow                  | [commit-workflow.md](./commit-workflow.md)                                   |
| 8   | Critical architecture rules      | [critical-architecture-rules.md](./critical-architecture-rules.md)           |
| 9   | Database types immutable         | [database-types-immutable.md](./database-types-immutable.md)                 |
| 10  | Edge function template           | [edge-function-template.md](./edge-function-template.md)                     |
| 11  | English only                     | [english-only.md](./english-only.md)                                         |
| 12  | File size limit                  | [file-size-limit.md](./file-size-limit.md)                                   |
| 13  | JSDoc required                   | [jsdoc-required.md](./jsdoc-required.md)                                     |
| 14  | No console logging               | [no-console-logging.md](./no-console-logging.md)                             |
| 15  | No dead code (Knip)              | [no-dead-code.md](./no-dead-code.md)                                         |
| 16  | No relative imports              | [no-relative-imports.md](./no-relative-imports.md)                           |
| 17  | Packages UI immutable            | [packages-ui-immutable.md](./packages-ui-immutable.md)                       |
| 18  | Proxy not middleware             | [proxy-not-middleware.md](./proxy-not-middleware.md)                         |
| 19  | Repository pattern               | [repository-pattern.md](./repository-pattern.md)                             |
| 20  | Respect architectural boundaries | [respect-architectural-boundaries.md](./respect-architectural-boundaries.md) |
| 21  | RLS tests mandatory              | [rls-tests-mandatory.md](./rls-tests-mandatory.md)                           |
| 22  | Security invariants              | [security-invariants.md](./security-invariants.md)                           |
| 23  | Shared packages first            | [shared-packages-first.md](./shared-packages-first.md)                       |
| 24  | Single responsibility            | [single-responsibility.md](./single-responsibility.md)                       |
| 25  | Supabase migrations              | [supabase-migrations.md](./supabase-migrations.md)                           |
| 26  | TDD required                     | [tdd-required.md](./tdd-required.md)                                         |
| 27  | Test file location               | [test-file-location.md](./test-file-location.md)                             |
| 28  | Three-level documentation        | [three-level-docs.md](./three-level-docs.md)                                 |
| 29  | Use safe actions                 | [use-safe-actions.md](./use-safe-actions.md)                                 |
| 30  | Zod v4 syntax                    | [zod-v4-syntax.md](./zod-v4-syntax.md)                                       |
| 31  | Zod v4 rules (reference)         | [zod-v4-rules.md](./zod-v4-rules.md)                                         |
| 32  | Zero barrel policy               | [zero-barrel-policy.md](./zero-barrel-policy.md)                             |

---

## AI / automation

Rules are enforced by oxlint, pre-commit hooks, dependency-cruiser, and CI where
applicable. See individual rule files and `docs/git-hooks.md`.

---

**Last updated:** 2026-04-04
