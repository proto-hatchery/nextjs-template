// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { CalendarChangeLogDTOSchema, type CalendarChangeLogDTO } from "@workspace/supabase-data/modules/calendar/domain/dto/calendar-change-log.dto.codegen"

type CalendarChangeLogRow = Database["public"]["Tables"]["calendar_change_log"]["Row"]
type CalendarChangeLogInsert = Database["public"]["Tables"]["calendar_change_log"]["Insert"]
type CalendarChangeLogUpdate = Database["public"]["Tables"]["calendar_change_log"]["Update"]

const CalendarChangeLogFieldMappings = {
  createdAt: "created_at",
  googleEventId: "google_event_id",
  id: "id",
  modificationHash: "modification_hash",
  processedAt: "processed_at",
  psychologistId: "psychologist_id",
  syncDirection: "sync_direction",
} as const

type CalendarChangeLogField = keyof typeof CalendarChangeLogFieldMappings

function fromCalendarChangeLogRow(row: CalendarChangeLogRow): CalendarChangeLogDTO {
  const mapped = {
    createdAt: row.created_at,
    googleEventId: row.google_event_id,
    id: row.id,
    modificationHash: row.modification_hash,
    processedAt: row.processed_at,
    psychologistId: row.psychologist_id,
    syncDirection: row.sync_direction,
  }
  return CalendarChangeLogDTOSchema.parse(mapped)
}

function toCalendarChangeLogInsert(dto: Partial<CalendarChangeLogDTO>): CalendarChangeLogInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(CalendarChangeLogFieldMappings) as Array<
    [CalendarChangeLogField, (typeof CalendarChangeLogFieldMappings)[CalendarChangeLogField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as CalendarChangeLogInsert
}

function toCalendarChangeLogUpdate(dto: Partial<CalendarChangeLogDTO>): CalendarChangeLogUpdate {
  return toCalendarChangeLogInsert(dto) as CalendarChangeLogUpdate
}

export { fromCalendarChangeLogRow, toCalendarChangeLogInsert, toCalendarChangeLogUpdate }
