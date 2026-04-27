/**
 * updateGeneratedDocumentsAction
 *
 * @module @workspace/supabase-data/actions/documents/generated-documents-update.codegen
 * codegen:actions (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { logServerEvent } from "@workspace/logging/server"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import type { GeneratedDocumentsDTO } from "@workspace/supabase-data/modules/documents/domain/dto/generated-documents.dto.codegen"
import { GeneratedDocumentsSupabaseRepository } from "@workspace/supabase-data/modules/documents/infrastructure/repositories/generated-documents-supabase.repository.codegen"

const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

const GeneratedDocumentsUpdateInputSchema = z.object({
  id: z.uuid({ error: "Invalid UUID" }),
  data: z
    .object({
      content: z.string().nullable().optional(),
      createdBy: z.string().nullable().optional(),
      documentType: z.string().nullable().optional(),
      encodedContent: z.string().nullable().optional(),
      isArchived: z.boolean().nullable().optional(),
      patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistClientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      psychologistId: z.uuid({ error: "Invalid UUID" }).optional(),
      tags: z.array(z.string()).nullable().optional(),
      templateId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
      title: z.string().nullable().optional(),
      updatedBy: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
})

export type GeneratedDocumentsUpdateInput = z.infer<typeof GeneratedDocumentsUpdateInputSchema>
export type GeneratedDocumentsUpdateOutput = GeneratedDocumentsDTO

export async function updateGeneratedDocumentsAction(
  input: GeneratedDocumentsUpdateInput
): Promise<GeneratedDocumentsUpdateOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "update_generated-documents" })
  const actorIdForLog = userId

  try {
    const validated = GeneratedDocumentsUpdateInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new GeneratedDocumentsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<GeneratedDocumentsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated.data).filter(([, value]) => value !== undefined)
    ) as Partial<GeneratedDocumentsDTO>
    const result = await repository.update(validated.id, repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.generated-documents.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_generated-documents_success",
      operation: "update",
      operationType: "action",
      outcome: "success",
      metadata: {
        // @type-escape: DTO id field type is unknown at codegen time — safe to narrow to primitive at logging boundary
        id: (result as { id?: string | number | boolean | null }).id ?? validated.id,
      },
      service: "supabase-data",
    })

    return result
  } catch (error) {
    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.generated-documents.update",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "update_generated-documents_failed",
      operation: "update",
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
