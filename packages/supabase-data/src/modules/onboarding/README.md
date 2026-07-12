# Onboarding Domain

Owns onboarding state, progress tracking, draft persistence, and onboarding-specific media uploads.

## Scope

- save and read onboarding draft data
- autosave per phase
- check onboarding progress and completion state
- complete onboarding phases with prerequisite validation
- complete onboarding and refresh auth metadata
- upload/remove onboarding avatar assets

## Public Boundary

- `actions/onboarding/*`

Apps should not import raw onboarding queries or mutations.

## Internal Structure

```text
modules/onboarding/
  application/
  domain/
  infrastructure/
```

The repository encapsulates the current table/RPC mix around:

- `psychologist_onboarding_state`
- `get_onboarding_status`
- `get_onboarding_status_v2`
- `complete_onboarding_phase`
- `complete_psychologist_onboarding`
