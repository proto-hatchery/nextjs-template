// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  AvailabilityExceptionsDTOSchema,
  type AvailabilityExceptionsDTO,
} from "@workspace/supabase-data/modules/calendar/domain/dto/availability-exceptions.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type AvailabilityExceptionsRow = Database["public"]["Tables"]["availability_exceptions"]["Row"]
type AvailabilityExceptionsInsert =
  Database["public"]["Tables"]["availability_exceptions"]["Insert"]
type AvailabilityExceptionsUpdate =
  Database["public"]["Tables"]["availability_exceptions"]["Update"]

const AvailabilityExceptionsFieldMappings = {
  createdAt: "created_at",
  endTime: "end_time",
  exceptionDate: "exception_date",
  id: "id",
  isAvailable: "is_available",
  psychologistId: "psychologist_id",
  reason: "reason",
  startTime: "start_time",
  updatedAt: "updated_at",
} as const

type AvailabilityExceptionsField = keyof typeof AvailabilityExceptionsFieldMappings

function fromAvailabilityExceptionsRow(row: AvailabilityExceptionsRow): AvailabilityExceptionsDTO {
  const mapped = {
    createdAt: row.created_at,
    endTime: row.end_time,
    exceptionDate: row.exception_date,
    id: row.id,
    isAvailable: row.is_available,
    psychologistId: row.psychologist_id,
    reason: row.reason,
    startTime: row.start_time,
    updatedAt: row.updated_at,
  }
  return AvailabilityExceptionsDTOSchema.parse(mapped)
}

function toAvailabilityExceptionsInsert(
  dto: Partial<AvailabilityExceptionsDTO>
): AvailabilityExceptionsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(AvailabilityExceptionsFieldMappings) as Array<
    [
      AvailabilityExceptionsField,
      (typeof AvailabilityExceptionsFieldMappings)[AvailabilityExceptionsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as AvailabilityExceptionsInsert
}

function toAvailabilityExceptionsUpdate(
  dto: Partial<AvailabilityExceptionsDTO>
): AvailabilityExceptionsUpdate {
  return toAvailabilityExceptionsInsert(dto) as AvailabilityExceptionsUpdate
}

export {
  fromAvailabilityExceptionsRow,
  toAvailabilityExceptionsInsert,
  toAvailabilityExceptionsUpdate,
}
