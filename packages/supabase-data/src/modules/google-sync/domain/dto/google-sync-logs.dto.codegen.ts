// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GoogleSyncLogsDTOSchema = z.object({
  calendarEventId: looseCell,
  completedAt: looseCell,
  createdAt: looseCell,
  errorCode: looseCell,
  errorMessage: looseCell,
  googleEventId: looseCell,
  id: looseCell,
  operation: looseCell,
  psychologistId: looseCell,
  requestPayload: looseCell,
  responsePayload: looseCell,
  seriesId: looseCell,
  startedAt: looseCell,
  status: looseCell,
  syncDirection: looseCell
})

type GoogleSyncLogsDTO = z.infer<typeof GoogleSyncLogsDTOSchema>

export { GoogleSyncLogsDTOSchema, type GoogleSyncLogsDTO }
