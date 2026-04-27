/**
 * findByIdSessionTypesAction
 *
 * @module @workspace/supabase-data/actions/catalog/session-types-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { SessionTypesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/session-types.dto.codegen"
import { SessionTypesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/session-types-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const SessionTypesFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type SessionTypesFindByIdInput = z.infer<typeof SessionTypesFindByIdInputSchema>
export type SessionTypesFindByIdOutput = SessionTypesDTO | null

export async function findByIdSessionTypesAction(
  input: SessionTypesFindByIdInput
): Promise<SessionTypesFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_session-types" })
  const actorIdForLog = userId

  try {
    const validated = SessionTypesFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new SessionTypesSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "catalog.session-types.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_session-types_success",
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
      component: "catalog.session-types.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_session-types_failed",
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
