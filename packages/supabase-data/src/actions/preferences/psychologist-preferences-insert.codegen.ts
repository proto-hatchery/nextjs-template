/**
 * insertPsychologistPreferencesAction
 *
 * @module @workspace/supabase-data/actions/preferences/psychologist-preferences-insert.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import { PsychologistPreferencesSupabaseRepository } from "@workspace/supabase-data/modules/preferences/infrastructure/repositories/psychologist-preferences-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const PsychologistPreferencesInsertInputSchema = z.object({
  notificationsBillingAlerts: z.boolean().nullable().optional(),
  notificationsEmailReminders: z.boolean().nullable().optional(),
  notificationsMarketing: z.boolean().nullable().optional(),
  notificationsPaymentReceipts: z.boolean().nullable().optional(),
  notificationsSecurityAlerts: z.boolean().nullable().optional(),
  notificationsWhatsappReminders: z.boolean().nullable().optional(),
  preferences: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullable().optional(),
  userId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
})

export type PsychologistPreferencesInsertInput = z.infer<
  typeof PsychologistPreferencesInsertInputSchema
>
export type PsychologistPreferencesInsertOutput = PsychologistPreferencesDTO

export async function insertPsychologistPreferencesAction(
  input: PsychologistPreferencesInsertInput
): Promise<PsychologistPreferencesInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_psychologist-preferences" })
  const actorIdForLog = userId

  try {
    const validated = PsychologistPreferencesInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new PsychologistPreferencesSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<PsychologistPreferencesDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<PsychologistPreferencesDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "preferences.psychologist-preferences.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-preferences_success",
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
      component: "preferences.psychologist-preferences.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_psychologist-preferences_failed",
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
