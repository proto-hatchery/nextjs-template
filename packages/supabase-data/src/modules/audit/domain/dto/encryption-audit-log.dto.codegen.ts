// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const EncryptionAuditLogDTOSchema = z.object({
  attemptedAt: looseCell,
  callerRole: looseCell,
  callerUserId: looseCell,
  context: looseCell,
  errorMessage: looseCell,
  id: looseCell,
  operation: looseCell,
  success: looseCell,
})

type EncryptionAuditLogDTO = z.infer<typeof EncryptionAuditLogDTOSchema>

export { EncryptionAuditLogDTOSchema, type EncryptionAuditLogDTO }
