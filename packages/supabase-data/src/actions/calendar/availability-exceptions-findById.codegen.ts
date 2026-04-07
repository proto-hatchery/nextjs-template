/**
 * FindByIdAvailabilityExceptions Server Action
 * 
 * Handles findById operation for availability_exceptions.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { findByIdAvailabilityExceptionsAction } from "@workspace/supabase-data/actions/calendar/availability-exceptions-findById.codegen"
 * 
 * const result = await findByIdAvailabilityExceptionsAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/calendar/availability-exceptions-findById
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { AvailabilityExceptionsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/availability-exceptions-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for findByIdAvailabilityExceptionsAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const AvailabilityExceptionsFindByIdInputSchema = z.object({
  // TODO: Define input fields based on availability_exceptions.findById requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for findByIdAvailabilityExceptionsAction
 */
export type AvailabilityExceptionsFindByIdInput = z.infer<typeof AvailabilityExceptionsFindByIdInputSchema>

/**
 * Output type for findByIdAvailabilityExceptionsAction — unknown until the action is wired to real DTOs / port types.
 */
export type AvailabilityExceptionsFindByIdOutput = unknown

/**
 * FindByIdAvailabilityExceptions Server Action
 * 
 * @param input - Action input
 */
export async function findByIdAvailabilityExceptionsAction(
  input: AvailabilityExceptionsFindByIdInput
): Promise<AvailabilityExceptionsFindByIdOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "findById_availability-exceptions",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = AvailabilityExceptionsFindByIdInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new AvailabilityExceptionsSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const result = await repository.findById((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "calendar.availability-exceptions.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_availability-exceptions_success",
      operation: "findById",
      operationType: "action",
      outcome: "success",
      service: "supabase-data",
    })

    return result
  } catch (error) {
    // 6. Log error with sanitized metadata (HIPAA compliant)
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
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
