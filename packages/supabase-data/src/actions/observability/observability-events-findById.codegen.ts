/**
 * findByIdObservabilityEventsAction
 *
 * @module @workspace/supabase-data/actions/observability/observability-events-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { ObservabilityEventsDTO } from "@workspace/supabase-data/modules/observability/domain/dto/observability-events.dto.codegen"
import { ObservabilityEventsSupabaseRepository } from "@workspace/supabase-data/modules/observability/infrastructure/repositories/observability-events-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const ObservabilityEventsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type ObservabilityEventsFindByIdInput = z.infer<
  typeof ObservabilityEventsFindByIdInputSchema
>
export type ObservabilityEventsFindByIdOutput = ObservabilityEventsDTO | null

export async function findByIdObservabilityEventsAction(
  input: ObservabilityEventsFindByIdInput
): Promise<ObservabilityEventsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({
    action: "findById_observability-events",
    requiredRole: "admin",
  })
  const actorIdForLog = userId

  try {
    const validated = ObservabilityEventsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new ObservabilityEventsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "observability.observability-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_observability-events_success",
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
      component: "observability.observability-events.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_observability-events_failed",
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
