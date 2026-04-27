// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { AssistantInvitesDTO } from "@workspace/supabase-data/modules/assistants/domain/dto/assistant-invites.dto.codegen"

export interface AssistantInvitesListParams {
  limit?: number
  offset?: number
}

export interface AssistantInvitesListResult {
  rows: AssistantInvitesDTO[]
}

interface AssistantInvitesRepository {
  findById(id: string): Promise<AssistantInvitesDTO | null>
  list(params: AssistantInvitesListParams): Promise<AssistantInvitesListResult>
  insert(data: Partial<AssistantInvitesDTO>): Promise<AssistantInvitesDTO>
  update(id: string, patch: Partial<AssistantInvitesDTO>): Promise<AssistantInvitesDTO>
  delete(id: string): Promise<void>
}

export { type AssistantInvitesRepository }
