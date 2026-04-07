// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { GoogleCalendarConnectionsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-calendar-connections.dto.codegen"

export interface GoogleCalendarConnectionsListParams {
  limit?: number
  offset?: number
}

export interface GoogleCalendarConnectionsListResult {
  rows: GoogleCalendarConnectionsDTO[]
}

interface GoogleCalendarConnectionsRepository {
  findById(id: string): Promise<GoogleCalendarConnectionsDTO | null>
  list(params: GoogleCalendarConnectionsListParams): Promise<GoogleCalendarConnectionsListResult>
  insert(data: Partial<GoogleCalendarConnectionsDTO>): Promise<GoogleCalendarConnectionsDTO>
  update(id: string, patch: Partial<GoogleCalendarConnectionsDTO>): Promise<GoogleCalendarConnectionsDTO>
  delete(id: string): Promise<void>
}

export { type GoogleCalendarConnectionsRepository }
