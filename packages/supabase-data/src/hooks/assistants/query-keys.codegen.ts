/**
 * TanStack Query key factory for domain "assistants".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/assistants/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const assistantsQueryKeys = {
  all: ["assistants"] as const,
  assistantInvites: () => [...assistantsQueryKeys.all, "assistant-invites"] as const,
  assistantInvitesList: (filters?: Record<string, unknown>) =>
    [...assistantsQueryKeys.assistantInvites(), "list", filters ?? {}] as const,
  psychologistAssistants: () => [...assistantsQueryKeys.all, "psychologist-assistants"] as const,
  psychologistAssistantsList: (filters?: Record<string, unknown>) =>
    [...assistantsQueryKeys.psychologistAssistants(), "list", filters ?? {}] as const,
}
