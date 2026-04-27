/**
 * findByIdAssistantInvitesAction
 *
 * @module @workspace/supabase-data/actions/assistants/assistant-invites-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AssistantInvitesDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/assistant-invites.dto.codegen"
import { AssistantInvitesSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/assistant-invites-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AssistantInvitesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type AssistantInvitesFindByIdInput = z.infer<typeof AssistantInvitesFindByIdInputSchema>
export type AssistantInvitesFindByIdOutput = AssistantInvitesDTO | null

export async function findByIdAssistantInvitesAction(
  input: AssistantInvitesFindByIdInput
): Promise<AssistantInvitesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_assistant-invites" })
  const actorIdForLog = userId

  try {
    const validated = AssistantInvitesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AssistantInvitesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_assistant-invites_success",
      operation: "findById",
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
      component: "assistants.assistant-invites.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_assistant-invites_failed",
      operation: "findById",
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
