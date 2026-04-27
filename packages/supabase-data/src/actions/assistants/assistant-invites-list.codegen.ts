/**
 * listAssistantInvitesAction
 *
 * @module @workspace/supabase-data/actions/assistants/assistant-invites-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AssistantInvitesDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/assistant-invites.dto.codegen"
import type { AssistantInvitesListParams } from "@workspace/supabase-data/modules/assistants/domain/ports/assistant-invites-repository.port.codegen"
import { AssistantInvitesSupabaseRepository } from "@workspace/supabase-data/modules/assistants/infrastructure/repositories/assistant-invites-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AssistantInvitesListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type AssistantInvitesListInput = z.infer<typeof AssistantInvitesListInputSchema>
export type AssistantInvitesListOutput = { rows: AssistantInvitesDTO[] }

export async function listAssistantInvitesAction(
  input: AssistantInvitesListInput
): Promise<AssistantInvitesListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_assistant-invites" })
  const actorIdForLog = userId

  try {
    const validated = AssistantInvitesListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AssistantInvitesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies AssistantInvitesListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as AssistantInvitesListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_assistant-invites_success",
      operation: "list",
      operationType: "action",
      outcome: "success",
      metadata: {
        rowCount: result.rows.length,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_assistant-invites_failed",
      operation: "list",
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
