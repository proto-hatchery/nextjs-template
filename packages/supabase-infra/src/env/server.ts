/**
 * Supabase server-only environment variables
 *
 * These variables **MUST NEVER be exposed to the browser**.
 * They contain sensitive server credentials with full database access.
 *
 * ## Environment Variables
 *
 * | Variable | Description | Required | Security |
 * |----------|-------------|----------|----------|
 * | `SUPABASE_SERVICE_ROLE_KEY` | Admin key (bypasses RLS) | ✅ Yes | 🔒 SECRET |
 * | `SUPABASE_URL` | Supabase project URL | ✅ Yes | 🔒 SECRET |
 *
 * ## Security Warning
 *
 * ⚠️ **CRITICAL**: These variables are **server-only** and must:
 *
 * - ✅ Only be used in server-side code
 * - ✅ Never be exposed to browser
 * - ✅ Never be committed to git
 * - ✅ Never be logged
 * - ✅ Be protected with `.gitignore`
 *
 * **NEVER:**
 * - ❌ Use `NEXT_PUBLIC_` prefix
 * - ❌ Use in client components
 * - ❌ Use in browser code
 * - ❌ Expose in API responses
 *
 * ## Usage
 *
 * ```typescript
 * import { getSupabaseServerEnv } from "@workspace/supabase-infra/env/server"
 *
 * // Server-side only (Server Components, Server Actions, API routes)
 * const env = getSupabaseServerEnv()
 * console.log("Service role key:", env.SUPABASE_SERVICE_ROLE_KEY)
 * ```
 *
 * ## Validation
 *
 * Uses Zod schema validation to ensure:
 * - ✅ Service role key is present and non-empty
 * - ✅ URL format is valid
 * - ✅ Required vars are not empty
 *
 * **Throws Error** if validation fails:
 *
 * ```typescript
 * try {
 *   const env = getSupabaseServerEnv()
 * } catch (error) {
 *   console.error("Invalid server env vars:", error.message)
 * }
 * ```
 *
 * @throws Error if environment variables are missing or invalid
 * @returns Validated server environment variables
 * @security Server-side only - never expose to browser
 * @see {@link getSupabasePublicEnv} for client-safe variables
 *
 * @module @workspace/supabase-infra/env/server
 */
import { z } from "zod"

/**
 * Zod schema for server environment variables
 *
 * Validates:
 * - SUPABASE_SERVICE_ROLE_KEY (must be non-empty)
 * - SUPABASE_URL (must be valid URL)
 *
 * These are CRITICAL security credentials and must be protected.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),
  SUPABASE_URL: z.url("Must be a valid URL"),
})

/**
 * Inferred type from serverEnvSchema
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>

/**
 * Get validated server environment variables
 *
 * Validates environment variables against Zod schema.
 * Throws descriptive error if validation fails.
 *
 * @example
 * ```typescript
 * const env = getSupabaseServerEnv()
 * const adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
 * ```
 *
 * @throws Error if environment variables are missing or invalid
 * @returns Validated server environment object
 * @security This function should only be used in server-side code
 */
export function getSupabaseServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env)

  if (!result.success) {
    throw new Error(`Invalid Supabase server environment variables:\n${result.error.message}`)
  }

  return result.data
}
