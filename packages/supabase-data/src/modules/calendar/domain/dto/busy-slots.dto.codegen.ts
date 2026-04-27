// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import { z } from "zod"

const looseCell = z.union([z.string(), z.number(), z.boolean(), z.null()])

const BusySlotsDTOSchema = z.object({
  createdAt: looseCell,
  eventType: looseCell,
  id: looseCell,
  isHardBlock: looseCell,
  psychologistId: looseCell,
  slotRange: looseCell,
  sourceId: looseCell,
  sourceType: looseCell,
  title: looseCell,
})

type BusySlotsDTO = z.infer<typeof BusySlotsDTOSchema>

export { BusySlotsDTOSchema, type BusySlotsDTO }
