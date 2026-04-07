// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { GoogleSyncInboundCoalesceDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-inbound-coalesce.dto.codegen"

export interface GoogleSyncInboundCoalesceListParams {
  limit?: number
  offset?: number
}

export interface GoogleSyncInboundCoalesceListResult {
  rows: GoogleSyncInboundCoalesceDTO[]
}

interface GoogleSyncInboundCoalesceRepository {
  list(params: GoogleSyncInboundCoalesceListParams): Promise<GoogleSyncInboundCoalesceListResult>
  insert(data: Partial<GoogleSyncInboundCoalesceDTO>): Promise<GoogleSyncInboundCoalesceDTO>
  update(id: string, patch: Partial<GoogleSyncInboundCoalesceDTO>): Promise<GoogleSyncInboundCoalesceDTO>
  delete(id: string): Promise<void>
}

export { type GoogleSyncInboundCoalesceRepository }
