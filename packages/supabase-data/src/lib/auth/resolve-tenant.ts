/**
 * Tenant ID resolution for psychologist-patient domain
 *
 * Resolves the psychologist_id (tenant ID) for a given user ID.
 * This is used in Server Actions to pass explicit tenant context to repositories.
 *
 * ## Why This Exists
 *
 * Repositories must NOT call auth functions directly. Instead, the action layer
 * resolves the tenant ID and passes it explicitly to repository methods. This:
 *
 * 1. Keeps repositories pure (data-access only)
 * 2. Allows explicit .eq() filters for Postgres query planner optimization
 * 3. Enables testing repositories with mock tenant IDs
 *
 * ## Usage
 *
 * ```typescript
 * "use server"
 * import { requireAuth } from "@workspace/supabase-data/lib/auth/require-auth"
 * import { getPsychologistIdForUser } from "@workspace/supabase-data/lib/auth/resolve-tenant"
 *
 * export async function listPatientsAction() {
 *   const { userId } = await requireAuth({ action: "list_patients" })
 *   const psychologistId = await getPsychologistIdForUser(userId)
 *
 *   if (!psychologistId) {
 *     throw new Error("Access denied")
 *   }
 *
 *   const supabase = await createServerAuthClient()
 *   const repository = new PatientRepository(supabase)
 *   return repository.findByPsychologistId(psychologistId)
 * }
 * ```
 *
 * @param userId - User ID from JWT claims (claims.sub)
 * @returns Psychologist ID (tenant ID) or null if not found
 */
"use server"

import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"

/**
 * Get psychologist ID for user
 *
 * Verifies user has a psychologist record and returns their psychologist_id.
 *
 * ## Why This Check Exists
 *
 * Not all users are psychologists. This function:
 * 1. Verifies the user has a record in user_psychologists table
 * 2. Returns the psychologist_id (which equals user_id for psychologists)
 * 3. Returns null for patients, assistants, or users without psychologist records
 *
 * ## Schema Context
 *
 * - auth.users: All authenticated users (psychologists, patients, assistants, admins)
 * - user_psychologists: Psychologists only (professional data, CRM, etc.)
 * - psychologist_id in most tables = user_id from auth.users (for psychologists)
 *
 * @param userId - User ID from JWT claims (claims.sub)
 * @returns User ID if user is a psychologist, null otherwise
 */
export async function getPsychologistIdForUser(userId: string): Promise<string | null> {
  try {
    const supabase = await createServerAuthClient()

    // Verify user has a psychologist record
    // This prevents patients/assistants from accessing psychologist-only data
    const { data, error } = await supabase
      .from("user_psychologists")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (error || !data) {
      // User is not a psychologist (or doesn't exist)
      return null
    }

    // User is a psychologist - their psychologist_id equals their user_id
    return userId
  } catch {
    return null
  }
}
