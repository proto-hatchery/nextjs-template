/**
 * ListCatalogDocumentTemplates Server Action
 * 
 * Handles list operation for catalog_document_templates.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { listCatalogDocumentTemplatesAction } from "@workspace/supabase-data/actions/catalog/catalog-document-templates-list.codegen"
 * 
 * const result = await listCatalogDocumentTemplatesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/catalog/catalog-document-templates-list
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { CatalogDocumentTemplatesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-document-templates-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for listCatalogDocumentTemplatesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const CatalogDocumentTemplatesListInputSchema = z.object({
  // TODO: Define input fields based on catalog_document_templates.list requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for listCatalogDocumentTemplatesAction
 */
export type CatalogDocumentTemplatesListInput = z.infer<typeof CatalogDocumentTemplatesListInputSchema>

/**
 * Output type for listCatalogDocumentTemplatesAction — unknown until the action is wired to real DTOs / port types.
 */
export type CatalogDocumentTemplatesListOutput = unknown

/**
 * ListCatalogDocumentTemplates Server Action
 * 
 * @param input - Action input
 */
export async function listCatalogDocumentTemplatesAction(
  input: CatalogDocumentTemplatesListInput
): Promise<CatalogDocumentTemplatesListOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "list_catalog-document-templates",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = CatalogDocumentTemplatesListInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new CatalogDocumentTemplatesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — list params unknown until semantic plan fills Zod input
    const result = await repository.list(validated as never)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "catalog.catalog-document-templates.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_catalog-document-templates_success",
      operation: "list",
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
      component: "catalog.catalog-document-templates.list",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "list_catalog-document-templates_failed",
      operation: "list",
      operationType: "action",
      outcome: "failure",
      error,
      metadata: sanitizeForAudit(input as Record<string, unknown>, AUDIT_SAFE_FIELDS),
      service: "supabase-data",
    })

    throw error
  }
}
