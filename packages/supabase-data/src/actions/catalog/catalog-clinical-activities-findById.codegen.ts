/**
 * FindByIdCatalogClinicalActivities Server Action
 * 
 * Handles findById operation for catalog_clinical_activities.
 * 
 * ## Usage
 * 
 * Example:
 * ```typescript
 * import { findByIdCatalogClinicalActivitiesAction } from "@workspace/supabase-data/actions/catalog/catalog-clinical-activities-findById.codegen"
 * 
 * const result = await findByIdCatalogClinicalActivitiesAction(input)
 * ```
 * 
 * @module @workspace/supabase-data/actions/catalog/catalog-clinical-activities-findById
 * codegen:actions-hooks (generated) — do not hand-edit
 */
"use server"

import { z } from "zod"

import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { CatalogClinicalActivitiesSupabaseRepository } from "@workspace/supabase-data/modules/catalog/infrastructure/repositories/catalog-clinical-activities-supabase.repository.codegen"
import { logServerEvent } from "@workspace/logging/server"
import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"

/**
 * Audit-safe fields for this table (HIPAA §164.312(b) compliant)
 * 
 * These fields are safe to log in error metadata without exposing PHI.
 */
const AUDIT_SAFE_FIELDS = ["id", "createdAt", "updatedAt"] as const

/**
 * Input schema for findByIdCatalogClinicalActivitiesAction
 * 
 * Uses Zod v4 syntax (top-level APIs, not z.string().email() etc.)
 */
const CatalogClinicalActivitiesFindByIdInputSchema = z.object({
  // TODO: Define input fields based on catalog_clinical_activities.findById requirements
  // Example for insert (Zod v4 syntax):
  // email: z.email({ error: "Invalid email" }),
  // id: z.uuid({ error: "Invalid UUID" }),
  // url: z.url({ error: "Invalid URL" }),
  // datetime: z.iso.datetime({ error: "Invalid datetime" }),
  // metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Input type for findByIdCatalogClinicalActivitiesAction
 */
export type CatalogClinicalActivitiesFindByIdInput = z.infer<typeof CatalogClinicalActivitiesFindByIdInputSchema>

/**
 * Output type for findByIdCatalogClinicalActivitiesAction — unknown until the action is wired to real DTOs / port types.
 */
export type CatalogClinicalActivitiesFindByIdOutput = unknown

/**
 * FindByIdCatalogClinicalActivities Server Action
 * 
 * @param input - Action input
 */
export async function findByIdCatalogClinicalActivitiesAction(
  input: CatalogClinicalActivitiesFindByIdInput
): Promise<CatalogClinicalActivitiesFindByIdOutput> {
  const startedAt = Date.now()
  let actorIdForLog = "unknown"

  try {
    // 1. Identity + rate limit (SSOT via requireAuth)
    const { userId } = await requireAuth({
      action: "findById_catalog-clinical-activities",
    })
    actorIdForLog = userId
    // 2. Input validation — before any DB call
    const validated = CatalogClinicalActivitiesFindByIdInputSchema.parse(input)

    // 3. Auth client — created after all guards pass
    const supabase = await createServerAuthClient()
    const repository = new CatalogClinicalActivitiesSupabaseRepository(supabase)
    
    // 4. Execute operation — pass resolved context explicitly
    // @type-escape: generated action stub — id shape from validated after TODO input schema
    const result = await repository.findById((validated as unknown as { id: string }).id)

    // 5. Log success
    await logServerEvent({
      actorId: userId,
      actorType: "user",
      component: "catalog.catalog-clinical-activities.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_catalog-clinical-activities_success",
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
      component: "catalog.catalog-clinical-activities.findById",
      durationMs: Date.now() - startedAt,
      eventFamily: "action.lifecycle",
      eventName: "findById_catalog-clinical-activities_failed",
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
