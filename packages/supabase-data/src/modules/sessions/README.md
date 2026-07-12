/\*\*

- Module Architecture README
-
- Sessions is currently a transitional module.
- Canonical read boundaries live under `actions/sessions/*` and `hooks/sessions/*`,
- and the canonical write orchestration now lives in `modules/sessions/application/*`.
  \*/

## Current Scope

- Repository-backed reads for:
  - psychologist session list
  - session details
  - patient sessions
  - upcoming sessions
  - today sessions
  - oldest open session
  - patient dashboard sessions
  - calendar event meet-link lookup used by the sessions/calendar boundary
- Repository-backed writes for:
  - session creation
  - public booking
  - rescheduling
  - status transitions
  - deletion

## Near-Term Migration Goal

Finish retiring the old session folders and keep all new work inside this module so:

- `actions/sessions/*` becomes the only stable write boundary
- `hooks/sessions/*` becomes the only stable client session boundary
- `queries/sessions/*`, `mutations/sessions/*`, and `server-mutations/sessions/*` stay deleted
