/**
 * Template `user-access` module — hand-maintained. Not removed by
 * `pnpm codegen:clean` (only `*.codegen.*`). See docs/guides/backend-codegen.md.
 */

import { z } from "zod"

import { AUTH_ROLES } from "@workspace/supabase-auth/shared/auth-role"
import { AUTH_PERMISSIONS } from "@workspace/supabase-auth/shared/permission"

const UserAccessDTOSchema = z.object({
  accessVersion: z.number().int().nonnegative().nullable(),
  permissions: z.array(z.enum(AUTH_PERMISSIONS)),
  roles: z.array(z.enum(AUTH_ROLES)),
  subscription: z.record(z.string(), z.unknown()),
  userId: z.uuid(),
})

type UserAccessDTO = z.infer<typeof UserAccessDTOSchema>

export { UserAccessDTOSchema, type UserAccessDTO }
