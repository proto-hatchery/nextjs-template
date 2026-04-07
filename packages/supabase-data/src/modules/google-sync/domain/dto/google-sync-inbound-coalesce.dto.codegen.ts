// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const GoogleSyncInboundCoalesceDTOSchema = z.object({
  connectionId: looseCell,
  createdAt: looseCell,
  lastEnqueuedAt: looseCell,
  msgId: looseCell
})

type GoogleSyncInboundCoalesceDTO = z.infer<typeof GoogleSyncInboundCoalesceDTOSchema>

export { GoogleSyncInboundCoalesceDTOSchema, type GoogleSyncInboundCoalesceDTO }
