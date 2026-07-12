/\*\*

- Module Architecture README
-
- Availability is the pilot domain for the Supabase DAL refactor.
- The canonical weekly-availability and public-availability surfaces now flow through this module.
  \*/

## Scope

This module currently owns:

- recurring weekly availability configuration
- availability exceptions
- public availability reads used by booking surfaces

It does not yet own every availability flow in the package. Older slot-based availability mutations and related helpers still exist elsewhere in `@workspace/supabase`, but they are not the canonical public boundary for the migrated slice.

## Canonical entrypoints

The preferred public boundaries for the migrated slice are:

- `@workspace/supabase/actions/availability/save-weekly-availability-config`
- `@workspace/supabase/actions/availability/create-availability-exception`
- `@workspace/supabase/actions/availability/delete-availability-exception`
- `@workspace/supabase/actions/availability/update-availability-exception`
- `@workspace/supabase/hooks/availability/use-weekly-availability-config`
- `@workspace/supabase/hooks/availability/use-weekly-availability-actions`
- `@workspace/supabase/hooks/availability/use-public-availability`

## Folder structure

```text
modules/availability/
├── application/
│   └── availability-validation.ts
├── domain/
│   ├── dto/
│   │   └── availability.dto.ts
│   └── ports/
│       └── availability-repository.port.ts
├── infrastructure/
│   ├── mappers/
│   │   └── availability.mapper.ts
│   └── repositories/
│       └── availability-supabase.repository.ts
└── README.md
```

## Responsibilities

### Domain

- defines DTOs for weekly schedules and availability exceptions
- defines the repository contract

### Application

- centralizes validation rules for weekly schedules and exception time windows

### Infrastructure

- reads and writes `psychologist_weekly_schedules`
- reads and writes `availability_exceptions`
- performs the optional calendar side effect for blocking exceptions
- maps database rows into DTOs used by hooks/actions

## Current boundary rule

If a new weekly availability or exception behavior is needed:

1. add it to the repository or mapper here
2. expose it through a domain action or hook
3. do not reintroduce public entrypoints under legacy `hooks/queries/*` or `hooks/mutations/*`

Do not add new business logic directly to the old availability query/mutation files.
