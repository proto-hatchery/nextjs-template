/**
 * deleteClinicalSessionDetailsAction
 *
 * @module @workspace/supabase-data/actions/clinical-sessions/clinical-session-details-delete.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { ClinicalSessionDetailsSupabaseRepository } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/repositories/clinical-session-details-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ClinicalSessionDetailsDeleteInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type ClinicalSessionDetailsDeleteInput = z.infer<
  typeof ClinicalSessionDetailsDeleteInputSchema
>
export type ClinicalSessionDetailsDeleteOutput = { success: true }

export async function deleteClinicalSessionDetailsAction(
  input: ClinicalSessionDetailsDeleteInput
): Promise<ClinicalSessionDetailsDeleteOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "delete_clinical-session-details" })
  const actorIdForLog = userId

  try {
    const validated = ClinicalSessionDetailsDeleteInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ClinicalSessionDetailsSupabaseRepository(supabase)
    await repository.delete(validated.id)
    const result = { success: true } as const

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "clinical-sessions.clinical-session-details.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_clinical-session-details_success",
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
      component: "clinical-sessions.clinical-session-details.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_clinical-session-details_failed",
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
