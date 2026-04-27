/**
 * insertPsychologistServicesAction
 *
 * @module @workspace/supabase-data/actions/preferences/psychologist-services-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistServicesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-services.dto.codegen"
import { PsychologistServicesSupabaseRepository } from "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-services-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistServicesInsertInputSchema = z.object({
  catalogId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().nullable().optional(),
  name: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  serviceId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  sortOrder: z.number().nullable().optional(),
})

export type PsychologistServicesInsertInput = z.infer<typeof PsychologistServicesInsertInputSchema>
export type PsychologistServicesInsertOutput = PsychologistServicesDTO

export async function insertPsychologistServicesAction(
  input: PsychologistServicesInsertInput
): Promise<PsychologistServicesInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-services" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistServicesInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistServicesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistServicesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistServicesDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "preferences.psychologist-services.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-services_success",
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
      component: "preferences.psychologist-services.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-services_failed",
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
