/**
 * deleteAvailabilityExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/availability-exceptions-delete.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { AvailabilityExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/availability-exceptions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AvailabilityExceptionsDeleteInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type AvailabilityExceptionsDeleteInput = z.infer<
  typeof AvailabilityExceptionsDeleteInputSchema
>
export type AvailabilityExceptionsDeleteOutput = { success: true }

export async function deleteAvailabilityExceptionsAction(
  input: AvailabilityExceptionsDeleteInput
): Promise<AvailabilityExceptionsDeleteOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "delete_availability-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = AvailabilityExceptionsDeleteInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AvailabilityExceptionsSupabaseRepository(supabase)
    await repository.delete(validated.id)
    const result = { success: true } as const

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.availability-exceptions.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_availability-exceptions_success",
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
      component: "calendar.availability-exceptions.delete",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "delete_availability-exceptions_failed",
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
