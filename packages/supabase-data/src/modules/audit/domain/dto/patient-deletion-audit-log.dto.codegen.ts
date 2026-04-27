// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const PatientDeletionAuditLogDTOSchema = z.object({
  cleanupTimestamp: looseCell,
  createdAt: looseCell,
  deletedCount: looseCell,
  id: looseCell,
  notes: looseCell,
  triggeredBy: looseCell,
})

type PatientDeletionAuditLogDTO = z.infer<typeof PatientDeletionAuditLogDTOSchema>

export { PatientDeletionAuditLogDTOSchema, type PatientDeletionAuditLogDTO }
