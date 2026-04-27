/**
 * findByIdAvailabilityExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/availability-exceptions-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AvailabilityExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/availability-exceptions.dto.codegen"
import { AvailabilityExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/availability-exceptions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AvailabilityExceptionsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type AvailabilityExceptionsFindByIdInput = z.infer<
  typeof AvailabilityExceptionsFindByIdInputSchema
>
export type AvailabilityExceptionsFindByIdOutput = AvailabilityExceptionsDTO | null

export async function findByIdAvailabilityExceptionsAction(
  input: AvailabilityExceptionsFindByIdInput
): Promise<AvailabilityExceptionsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_availability-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = AvailabilityExceptionsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AvailabilityExceptionsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.availability-exceptions.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_availability-exceptions_success",
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
      component: "calendar.availability-exceptions.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_availability-exceptions_failed",
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
