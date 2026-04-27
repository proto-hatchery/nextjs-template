/**
 * insertAvailabilityExceptionsAction
 *
 * @module @workspace/supabase-data/actions/calendar/availability-exceptions-insert.codegen
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

const AvailabilityExceptionsInsertInputSchema = z.object({
  endTime: z.string().nullable().optional(),
  exceptionDate: z.string(),
  isAvailable: z.boolean().nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  reason: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
})

export type AvailabilityExceptionsInsertInput = z.infer<
  typeof AvailabilityExceptionsInsertInputSchema
>
export type AvailabilityExceptionsInsertOutput = AvailabilityExceptionsDTO

export async function insertAvailabilityExceptionsAction(
  input: AvailabilityExceptionsInsertInput
): Promise<AvailabilityExceptionsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_availability-exceptions" })
  const actorIdForLog = userId

  try {
    const validated = AvailabilityExceptionsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new AvailabilityExceptionsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<AvailabilityExceptionsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<AvailabilityExceptionsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.availability-exceptions.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_availability-exceptions_success",
      operation: "insert",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? null,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.availability-exceptions.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_availability-exceptions_failed",
      operation: "insert",
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
