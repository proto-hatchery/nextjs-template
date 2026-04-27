/**
 * listBusySlotsAction
 *
 * @module @workspace/supabase-data/actions/calendar/busy-slots-list.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { BusySlotsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/busy-slots.dto.codegen"
import type { BusySlotsListParams } from "@workspace/supabase-data/modules/calendar/domain/ports/busy-slots-repository.port.codegen"
import { BusySlotsSupabaseRepository } from "@workspace/supabase-data/modules/calendar/infrastructure/repositories/busy-slots-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const BusySlotsListInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export type BusySlotsListInput = z.infer<typeof BusySlotsListInputSchema>
export type BusySlotsListOutput = { rows: BusySlotsDTO[] }

export async function listBusySlotsAction(input: BusySlotsListInput): Promise<BusySlotsListOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "list_busy-slots" })
  const actorIdForLog = userId

  try {
    const validated = BusySlotsListInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new BusySlotsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies BusySlotsListParams at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as BusySlotsListParams
    const result = await repository.list(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "calendar.busy-slots.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_busy-slots_success",
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
      component: "calendar.busy-slots.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_busy-slots_failed",
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
