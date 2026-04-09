/**
 * Supabase public environment variables
 *
 * These variables are **safe to expose to the browser** and are used by
 * client-side Supabase clients.
 *
 * ## Environment Variables
 *
 * | Variable | Description | Required |
 * |----------|-------------|----------|
 * | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes |
 * | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/public key | ✅ Yes |
 * | `NEXT_PUBLIC_SITE_URL` | Site URL (optional) | ❌ No |
 *
 * ## Security
 *
 * These variables are **public** and will be exposed to the browser:
 * - ✅ Safe for client-side use
 * - ✅ Can be used in browser code
 * - ✅ Included in client bundles
 *
 * **DO NOT** include sensitive variables here:
 * - ❌ SUPABASE_SERVICE_ROLE_KEY (use server.ts)
 * - ❌ Database passwords
 * - ❌ API secrets
 *
 * ## Usage
 *
 * ```typescript
 * import { getSupabasePublicEnv } from "@workspace/supabase-infra/env/public"
 *
 * const env = getSupabasePublicEnv()
 * console.log("Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL)
 * ```
 *
 * ## Validation
 *
 * Uses Zod schema validation to ensure:
 * - ✅ URL format is valid
 * - ✅ Publishable key is present
 * - ✅ Required vars are not empty
 *
 * **Throws Error** if validation fails:
 *
 * ```typescript
 * try {
 *   const env = getSupabasePublicEnv()
 * } catch (error) {
 *   console.error("Invalid env vars:", error.message)
 * }
 * ```
 *
 * @throws Error if environment variables are missing or invalid
 * @returns Validated public environment variables
 * @see {@link getSupabaseServerEnv} for server-only variables
 *
 * @module @workspace/supabase-infra/env/public
 */
import { z } from "zod"

/**
 * Zod schema for public environment variables
 *
 * Validates:
 * - NEXT_PUBLIC_SUPABASE_URL (must be valid URL)
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (must be non-empty)
 * - NEXT_PUBLIC_SITE_URL (optional, must be valid URL if present)
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("Must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Supabase publishable key is required"),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  NEXT_PUBLIC_AUTH_APP_URL: z.url().optional(),
  NEXT_PUBLIC_SPACE_APP_URL: z.url().optional(),
  NEXT_PUBLIC_AUTH_ALLOWED_REDIRECT_ORIGINS: z
    .string()
    .transform((str) => str.split(",").map((s) => s.trim()))
    .optional()
    .default([]),
})

/**
 * Inferred type from publicEnvSchema
 */
export type PublicEnv = z.infer<typeof publicEnvSchema>

/**
 * Get validated public environment variables
 *
 * Validates environment variables against Zod schema.
 * Throws descriptive error if validation fails.
 *
 * @example
 * ```typescript
 * const env = getSupabasePublicEnv()
 * console.log(env.NEXT_PUBLIC_SUPABASE_URL)
 * ```
 *
 * @throws Error if environment variables are missing or invalid
 * @returns Validated public environment object
 */
export function getSupabasePublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse(process.env)

  if (!result.success) {
    throw new Error(`Invalid Supabase public environment variables:\n${result.error.message}`)
  }

  return result.data
}

/**
 * Normalize public app URL with fallback to site URL or Supabase URL
 */
export function normalizePublicAppUrl(): string {
  const env = getSupabasePublicEnv()
  return env.NEXT_PUBLIC_AUTH_APP_URL ?? env.NEXT_PUBLIC_SITE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
}
