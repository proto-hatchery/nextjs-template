/**
 * deleteAssistantInvitesAction
 *
 * @module @workspace/supabase-data/actions/assistants/assistant-invites-delete.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { AssistantInvitesSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/assistant-invites-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AssistantInvitesDeleteInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type AssistantInvitesDeleteInput = z.infer<typeof AssistantInvitesDeleteInputSchema>
export type AssistantInvitesDeleteOutput = { success: true }

export async function deleteAssistantInvitesAction(
  input: AssistantInvitesDeleteInput
): Promise<AssistantInvitesDeleteOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "delete_assistant-invites" })
  const actorIdForLog = userId

  try {
    const validated = AssistantInvitesDeleteInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AssistantInvitesSupabaseRepository(supabase)
    await repository.delete(validated.id)
    const result = { success: true } as const

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_assistant-invites_success",
      operation: "delete",
      operationType: "action",
      outcome: "success",
      metadata: {
        id: validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_assistant-invites_failed",
      operation: "delete",
      operationType: "action",
      outcome: "failure",
      error,
      // @type-escape: input type is the generated Zod-inferred shape; Record<string,unknown> is required by sanitizeForAudit — diverges at the catch boundary where input may be unvalidated
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
