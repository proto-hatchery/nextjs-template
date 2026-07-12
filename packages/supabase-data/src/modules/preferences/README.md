# Preferences Domain

This domain owns account-level notification preferences.

The public contract is generic to support future user roles (`psychologist`, `patient`, `assistant`).
The current infrastructure still persists to `psychologist_preferences`, which is an implementation detail
that can be replaced later without changing the app-facing hooks/actions/types.
