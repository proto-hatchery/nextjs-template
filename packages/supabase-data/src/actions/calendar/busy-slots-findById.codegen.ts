/**
 * findByIdBusySlotsAction
 *
 * @module @workspace/supabase-data/actions/calendar/busy-slots-findById.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { BusySlotsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/busy-slots.dto.codegen"
import { BusySlotsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/busy-slots-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const BusySlotsFindByIdInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
})

export type BusySlotsFindByIdInput = z.infer<typeof BusySlotsFindByIdInputSchema>
export type BusySlotsFindByIdOutput = BusySlotsDTO | null

export async function findByIdBusySlotsAction(
  input: BusySlotsFindByIdInput
): Promise<BusySlotsFindByIdOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "findById_busy-slots" })
  const actorIdForLog = userId

  try {
    const validated = BusySlotsFindByIdInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new BusySlotsSupabaseRepository(supabase)
    const result = await repository.findById(validated.id)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.busy-slots.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_busy-slots_success",
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
      component: "calendar.busy-slots.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_busy-slots_failed",
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
