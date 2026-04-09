/**
 * Template `profiles` module — hand-maintained (`codegen: false` in domain map).
 * Not removed by `pnpm codegen:clean` (only `*.codegen.*` filenames). See
 * docs/guides/backend-codegen.md.
 */

import { z } from "zod"

const ProfileDTOSchema = z.object({
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
  email: z.email(),
  fullName: z.string().nullable(),
  updatedAt: z.string(),
  userId: z.uuid(),
})

type ProfileDTO = z.infer<typeof ProfileDTOSchema>

export { ProfileDTOSchema, type ProfileDTO }
