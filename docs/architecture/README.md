# Architecture & engineering handbook

Canonical **technical deep dives** for this Turborepo template live here. **AI
entry** remains [`AGENTS.md`](../../AGENTS.md) at the repository root (with
[`CLAUDE.md`](../../CLAUDE.md) / [`GEMINI.md`](../../GEMINI.md) as thin
pointers).

| Document                                                  | Purpose                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------ |
| [System layers & boundaries](./system.md)                 | Package boundaries, dependency rules, module map                         |
| [Backend](./backend.md)                                   | `@workspace/supabase-data`, server actions, repositories, auth           |
| [Business logic placement](./business-logic-placement.md) | Where complex logic lives, service layer, separation of responsibilities |
| [Database](./database.md)                                 | RLS, migrations, policies, functions                                     |
| [TDD](./tdd.md)                                           | RED/GREEN/REFACTOR, migration-safe workflow                              |
| [Testing](./testing.md)                                   | Vitest, coverage, integration / RLS / SQL                                |

**Lighter-weight map:** [Architecture overview](./overview.md) · **ADRs:**
[decisions/](./decisions/)

**Also read:** [Repository standards](../standards/repository-standards.md) ·
[Stack](../reference/stack.md) · [Golden rules](../standards/golden-rules.md) ·
[Package file suffixes](../standards/package-file-suffixes.md) ·
[Anti-patterns](../standards/anti-patterns.md)
