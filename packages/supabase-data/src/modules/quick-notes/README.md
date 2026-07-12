# Quick Notes Domain

Todo/task management for psychologist dashboard flows.

## Canonical boundaries

- `@workspace/supabase/actions/quick-notes/*`
- `@workspace/supabase/hooks/quick-notes/*`
- `modules/quick-notes/*`

## Responsibilities

- create, update, toggle, delete, and clear completed quick notes
- expose app-facing DTOs decoupled from raw DB row types
- keep sorting and grouping helpers at the domain boundary

## Current flow

1. Actions in `src/actions/quick-notes/*` validate input and call the repository.
2. Hooks in `src/hooks/quick-notes/*` consume canonical actions and query keys.
3. Apps consume DTOs and helpers from `@workspace/supabase/entities`.
