/**
 * TanStack Query key factory for domain "notes".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/notes/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const notesQueryKeys = {
  all: ["notes"] as const,
  psychologistNotes: () => [...notesQueryKeys.all, "psychologist-notes"] as const,
  psychologistNotesList: (filters?: Record<string, unknown>) =>
    [...notesQueryKeys.psychologistNotes(), "list", filters ?? {}] as const,
  psychologistQuickNotes: () => [...notesQueryKeys.all, "psychologist-quick-notes"] as const,
  psychologistQuickNotesList: (filters?: Record<string, unknown>) =>
    [...notesQueryKeys.psychologistQuickNotes(), "list", filters ?? {}] as const,
}
