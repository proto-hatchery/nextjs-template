// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  AssistantInvitesDTOSchema,
  type AssistantInvitesDTO,
} from "@workspace/supabase-data/modules/assistants/domain/dto/assistant-invites.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type AssistantInvitesRow = Database["public"]["Tables"]["assistant_invites"]["Row"]
type AssistantInvitesInsert = Database["public"]["Tables"]["assistant_invites"]["Insert"]
type AssistantInvitesUpdate = Database["public"]["Tables"]["assistant_invites"]["Update"]

const AssistantInvitesFieldMappings = {
  acceptedAt: "accepted_at",
  createdAt: "created_at",
  expiresAt: "expires_at",
  id: "id",
  invitedEmail: "invited_email",
  invitedPhone: "invited_phone",
  metadata: "metadata",
  psychologistId: "psychologist_id",
  revokedAt: "revoked_at",
  updatedAt: "updated_at",
} as const

type AssistantInvitesField = keyof typeof AssistantInvitesFieldMappings

function fromAssistantInvitesRow(row: AssistantInvitesRow): AssistantInvitesDTO {
  const mapped = {
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    id: row.id,
    invitedEmail: row.invited_email,
    invitedPhone: row.invited_phone,
    metadata: row.metadata,
    psychologistId: row.psychologist_id,
    revokedAt: row.revoked_at,
    updatedAt: row.updated_at,
  }
  return AssistantInvitesDTOSchema.parse(mapped)
}

function toAssistantInvitesInsert(dto: Partial<AssistantInvitesDTO>): AssistantInvitesInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(AssistantInvitesFieldMappings) as Array<
    [AssistantInvitesField, (typeof AssistantInvitesFieldMappings)[AssistantInvitesField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as AssistantInvitesInsert
}

function toAssistantInvitesUpdate(dto: Partial<AssistantInvitesDTO>): AssistantInvitesUpdate {
  return toAssistantInvitesInsert(dto) as AssistantInvitesUpdate
}

export { fromAssistantInvitesRow, toAssistantInvitesInsert, toAssistantInvitesUpdate }
