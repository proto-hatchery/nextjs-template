/**
 * listAvailabilityExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/availability-exceptions-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { AvailabilityExceptionsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/availability-exceptions.dto.codegen"
import type { AvailabilityExceptionsListParams } from "@workspace/supabase-data/modules/calendar/domain/ports/availability-exceptions-repository.port.codegen"
import { AvailabilityExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/availability-exceptions-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const AvailabilityExceptionsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type AvailabilityExceptionsListInput = z.infer<typeof AvailabilityExceptionsListInputSchema>
export type AvailabilityExceptionsListOutput = { rows: AvailabilityExceptionsDTO[] }

export async function listAvailabilityExceptionsAction(
  input: AvailabilityExceptionsListInput
): Promise<AvailabilityExceptionsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_availability-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = AvailabilityExceptionsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AvailabilityExceptionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies AvailabilityExceptionsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as AvailabilityExceptionsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.availability-exceptions.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_availability-exceptions_success",
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
      component: "calendar.availability-exceptions.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_availability-exceptions_failed",
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
