/\*\*

- Module Architecture README
-
- Notes module with clean boundaries and module-owned persistence.
  \*/

## Folder Structure

```text
modules/notes/
├── domain/
│   ├── dto/
│   │   └── clinical-note.dto.ts
│   └── ports/
│       └── note-repository.port.ts
├── infrastructure/
│   ├── mappers/
│   │   └── note.mapper.ts
│   └── repositories/
│       └── note-supabase.repository.ts
└── README.md
```

## Public Boundaries (Canonical)

- `@workspace/supabase/actions/notes/*` (server action boundary)
- `@workspace/supabase/hooks/notes/*` (client query/mutation boundary)
- `modules/notes/*` (domain + repository internals)

## Layer Responsibilities

### Domain (`domain/`)

- Defines note DTOs and repository contracts.
- No Supabase/client imports.

### Infrastructure (`infrastructure/`)

- Implements the repository with Supabase.
- Maps DB rows to/from domain DTOs.
- Contains note-table persistence details (`psychologist_notes`).

## Dependency Direction

```text
actions/notes + hooks/notes
    ↓
domain ports (contracts)
    ↑
infrastructure repositories/mappers
```

## Current Notes Flow

1. Actions in `src/actions/notes/*` validate/auth and call `NoteSupabaseRepository`.
2. Read hooks in `src/hooks/notes/*` call repository-backed note read models, not raw SQL inside the hook.
3. Mutation hooks in `src/hooks/notes/*` consume canonical note actions and query keys.
4. Legacy compatibility behavior is kept inside `hooks/notes/use-note-actions.ts` (export alias `useNoteMutations`) without exposing legacy import paths to apps.

## Type Boundary Rule

- Database types stay inside note infrastructure (`mappers` / `repositories`).
- Callers consume domain DTOs and serialized action results.
