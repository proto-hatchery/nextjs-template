// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const AssistantInvitesDTOSchema = z.object({
  acceptedAt: looseCell,
  createdAt: looseCell,
  expiresAt: looseCell,
  id: looseCell,
  invitedEmail: looseCell,
  invitedPhone: looseCell,
  metadata: looseCell,
  psychologistId: looseCell,
  revokedAt: looseCell,
  updatedAt: looseCell,
})

type AssistantInvitesDTO = z.infer<typeof AssistantInvitesDTOSchema>

export { AssistantInvitesDTOSchema, type AssistantInvitesDTO }
