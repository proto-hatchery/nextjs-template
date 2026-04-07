// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { BusySlotsDTOSchema, type BusySlotsDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/busy-slots.dto.codegen"

type BusySlotsRow = Database["public"]["Tables"]["busy_slots"]["Row"]
type BusySlotsInsert = Database["public"]["Tables"]["busy_slots"]["Insert"]
type BusySlotsUpdate = Database["public"]["Tables"]["busy_slots"]["Update"]

const BusySlotsFieldMappings = {
  createdAt: "created_at",
  eventType: "event_type",
  id: "id",
  isHardBlock: "is_hard_block",
  psychologistId: "psychologist_id",
  slotRange: "slot_range",
  sourceId: "source_id",
  sourceType: "source_type",
  title: "title",
} as const

type BusySlotsField = keyof typeof BusySlotsFieldMappings

function fromBusySlotsRow(row: BusySlotsRow): BusySlotsDTO {
  const mapped = {
    createdAt: row.created_at,
    eventType: row.event_type,
    id: row.id,
    isHardBlock: row.is_hard_block,
    psychologistId: row.psychologist_id,
    slotRange: row.slot_range,
    sourceId: row.source_id,
    sourceType: row.source_type,
    title: row.title,
  }
  return BusySlotsDTOSchema.parse(mapped)
}

function toBusySlotsInsert(dto: Partial<BusySlotsDTO>): BusySlotsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(BusySlotsFieldMappings) as Array<
    [BusySlotsField, (typeof BusySlotsFieldMappings)[BusySlotsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as BusySlotsInsert
}

function toBusySlotsUpdate(dto: Partial<BusySlotsDTO>): BusySlotsUpdate {
  return toBusySlotsInsert(dto) as BusySlotsUpdate
}

export { fromBusySlotsRow, toBusySlotsInsert, toBusySlotsUpdate }
