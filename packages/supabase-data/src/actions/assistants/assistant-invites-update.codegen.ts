/**
 * updateAssistantInvitesAction
 *
 * @module @workspace/supabase-data/actions/assistants/assistant-invites-update.codegen
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

const AssistantInvitesUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      acceptedAt: z.string().nullable().optional(),
      expiresAt: z.string().optional(),
      invitedEmail: z.string().nullable().optional(),
      invitedPhone: z.string().nullable().optional(),
      metadata: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      revokedAt: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type AssistantInvitesUpdateInput = z.infer<typeof AssistantInvitesUpdateInputSchema>
export type AssistantInvitesUpdateOutput = AssistantInvitesDTO

export async function updateAssistantInvitesAction(
  input: AssistantInvitesUpdateInput
): Promise<AssistantInvitesUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_assistant-invites" })
  const actorIdForLog = userId

  try {
    const validated = AssistantInvitesUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AssistantInvitesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<AssistantInvitesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<AssistantInvitesDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_assistant-invites_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "assistants.assistant-invites.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_assistant-invites_failed",
      operation: "update",
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
