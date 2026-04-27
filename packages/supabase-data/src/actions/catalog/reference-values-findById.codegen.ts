/**
 * findByIdReferenceValuesAction
 *
 * @module @workspace/supabase-data/actions/catalog/reference-values-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { ReferenceValuesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/reference-values.dto.codegen"
import { ReferenceValuesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/reference-values-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ReferenceValuesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type ReferenceValuesFindByIdInput = z.infer<typeof ReferenceValuesFindByIdInputSchema>
export type ReferenceValuesFindByIdOutput = ReferenceValuesDTO | null

export async function findByIdReferenceValuesAction(
  input: ReferenceValuesFindByIdInput
): Promise<ReferenceValuesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_reference-values" })
  const actorIdForLog = userId

  try {
    const validated = ReferenceValuesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ReferenceValuesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.reference-values.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_reference-values_success",
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
      component: "catalog.reference-values.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_reference-values_failed",
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
