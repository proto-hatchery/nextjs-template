/**
 * insertGeneratedDocumentsAction
 *
 * @module @workspace/supabase-data/actions/documents/generated-documents-insert.codegen
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

const GeneratedDocumentsInsertInputSchema = z.object({
  content: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  documentType: z.string().nullable().optional(),
  encodedContent: z.string().nullable().optional(),
  isArchived: z.boolean().nullable().optional(),
  patientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  psychologistClientId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  psychologistId: z.uuid({ error: "Invalid UUID" }),
  tags: z.array(z.string()).nullable().optional(),
  templateId: z.uuid({ error: "Invalid UUID" }).nullable().optional(),
  title: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
})

export type GeneratedDocumentsInsertInput = z.infer<typeof GeneratedDocumentsInsertInputSchema>
export type GeneratedDocumentsInsertOutput = GeneratedDocumentsDTO

export async function insertGeneratedDocumentsAction(
  input: GeneratedDocumentsInsertInput
): Promise<GeneratedDocumentsInsertOutput> {
  const startedAt = Date.now()
  const { userId } = await requireAuth({ action: "insert_generated-documents" })
  const actorIdForLog = userId

  try {
    const validated = GeneratedDocumentsInsertInputSchema.parse(input)
    const supabase = await createServerAuthClient()
    const repository = new GeneratedDocumentsSupabaseRepository(supabase)
    // @type-escape: Object.fromEntries loses key types — Zod-validated shape satisfies Partial<GeneratedDocumentsDTO> at runtime
    const repositoryInput = Object.fromEntries(
      Object.entries(validated).filter(([, value]) => value !== undefined)
    ) as Partial<GeneratedDocumentsDTO>
    const result = await repository.insert(repositoryInput)

    await logServerEvent({
      actorId: actorIdForLog,
      actorType: "user",
      component: "documents.generated-documents.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_generated-documents_success",
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
      component: "documents.generated-documents.insert",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "insert_generated-documents_failed",
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
