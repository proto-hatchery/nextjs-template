// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  SessionTypesDTOSchema,
  type SessionTypesDTO,
} from "@workspace/supabase-data/modules/catalog/domain/dto/session-types.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type SessionTypesRow = Database["public"]["Tables"]["session_types"]["Row"]

const SessionTypesFieldMappings = {
  code: "code",
  createdAt: "created_at",
  defaultDurationMinutes: "default_duration_minutes",
  id: "id",
  name: "name",
  updatedAt: "updated_at",
} as const

type _SessionTypesField = keyof typeof SessionTypesFieldMappings

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

export { fromSessionTypesRow }
