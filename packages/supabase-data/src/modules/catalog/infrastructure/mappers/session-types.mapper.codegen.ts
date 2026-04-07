// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { SessionTypesDTOSchema, type SessionTypesDTO } from "@workspace/supabase-data/modules/catalog/domain/dto/session-types.dto.codegen"

type SessionTypesRow = Database["public"]["Tables"]["session_types"]["Row"]
type SessionTypesInsert = Database["public"]["Tables"]["session_types"]["Insert"]
type SessionTypesUpdate = Database["public"]["Tables"]["session_types"]["Update"]

const SessionTypesFieldMappings = {
  code: "code",
  createdAt: "created_at",
  defaultDurationMinutes: "default_duration_minutes",
  id: "id",
  name: "name",
  updatedAt: "updated_at",
} as const

type SessionTypesField = keyof typeof SessionTypesFieldMappings

function fromSessionTypesRow(row: SessionTypesRow): SessionTypesDTO {
  const mapped = {
    code: row.code,
    createdAt: row.created_at,
    defaultDurationMinutes: row.default_duration_minutes,
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
  }
  return SessionTypesDTOSchema.parse(mapped)
}

function toSessionTypesInsert(dto: Partial<SessionTypesDTO>): SessionTypesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(SessionTypesFieldMappings) as Array<
    [SessionTypesField, (typeof SessionTypesFieldMappings)[SessionTypesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as SessionTypesInsert
}

function toSessionTypesUpdate(dto: Partial<SessionTypesDTO>): SessionTypesUpdate {
  return toSessionTypesInsert(dto) as SessionTypesUpdate
}

export { fromSessionTypesRow, toSessionTypesInsert, toSessionTypesUpdate }
