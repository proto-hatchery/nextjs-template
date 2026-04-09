/**
 * Template `user-roles` module — hand-maintained (`codegen: false` in domain map).
 * Not removed by `pnpm codegen:clean` (only `*.codegen.*`). See
 * docs/guides/backend-codegen.md.
 */

import { z } from "zod"

import { AUTH_ROLES } from "@workspace/supabase-auth/shared/auth-role"

const UserRoleDTOSchema = z.object({
  createdAt: z.string(),
  role: z.enum(AUTH_ROLES),
  userId: z.uuid(),
})

type UserRoleDTO = z.infer<typeof UserRoleDTOSchema>

export { UserRoleDTOSchema, type UserRoleDTO }
