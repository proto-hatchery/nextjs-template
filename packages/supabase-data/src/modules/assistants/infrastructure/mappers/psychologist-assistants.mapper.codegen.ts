// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  PsychologistAssistantsDTOSchema,
  type PsychologistAssistantsDTO,
} from "@workspace/supabase-data/modules/assistants/domain/dto/psychologist-assistants.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type PsychologistAssistantsRow = Database["public"]["Tables"]["psychologist_assistants"]["Row"]
type PsychologistAssistantsInsert =
  Database["public"]["Tables"]["psychologist_assistants"]["Insert"]
type PsychologistAssistantsUpdate =
  Database["public"]["Tables"]["psychologist_assistants"]["Update"]

const PsychologistAssistantsFieldMappings = {
  assistantId: "assistant_id",
  createdAt: "created_at",
  metadata: "metadata",
  psychologistId: "psychologist_id",
  revokedAt: "revoked_at",
} as const

type PsychologistAssistantsField = keyof typeof PsychologistAssistantsFieldMappings

function fromPsychologistAssistantsRow(row: PsychologistAssistantsRow): PsychologistAssistantsDTO {
  const mapped = {
    assistantId: row.assistant_id,
    createdAt: row.created_at,
    metadata: row.metadata,
    psychologistId: row.psychologist_id,
    revokedAt: row.revoked_at,
  }
  return PsychologistAssistantsDTOSchema.parse(mapped)
}

function toPsychologistAssistantsInsert(
  dto: Partial<PsychologistAssistantsDTO>
): PsychologistAssistantsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(PsychologistAssistantsFieldMappings) as Array<
    [
      PsychologistAssistantsField,
      (typeof PsychologistAssistantsFieldMappings)[PsychologistAssistantsField],
    ]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as PsychologistAssistantsInsert
}

function toPsychologistAssistantsUpdate(
  dto: Partial<PsychologistAssistantsDTO>
): PsychologistAssistantsUpdate {
  return toPsychologistAssistantsInsert(dto) as PsychologistAssistantsUpdate
}

export {
  fromPsychologistAssistantsRow,
  toPsychologistAssistantsInsert,
  toPsychologistAssistantsUpdate,
}
