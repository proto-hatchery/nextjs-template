// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PsychologistPreferencesAuditLogDTOSchema = z.object({
  action: looseCell,
  createdAt: looseCell,
  id: looseCell,
  newValues: looseCell,
  oldValues: looseCell,
  userId: looseCell,
})

type PsychologistPreferencesAuditLogDTO = z.infer<typeof PsychologistPreferencesAuditLogDTOSchema>

export { PsychologistPreferencesAuditLogDTOSchema, type PsychologistPreferencesAuditLogDTO }
