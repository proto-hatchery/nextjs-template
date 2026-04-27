// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const AuditLogsDTOSchema = z.object({
  action: looseCell,
  changedFields: looseCell,
  correlationId: looseCell,
  createdAt: looseCell,
  id: looseCell,
  ipAddress: looseCell,
  recordId: looseCell,
  tableName: looseCell,
  userAgent: looseCell,
  userId: looseCell,
  userType: looseCell,
})

type AuditLogsDTO = z.infer<typeof AuditLogsDTOSchema>

export { AuditLogsDTOSchema, type AuditLogsDTO }
