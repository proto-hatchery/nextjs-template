// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { GoogleSyncWorkerMetricsDTO } from "@workspace/supabase-data/modules/google-sync/domain/dto/google-sync-worker-metrics.dto.codegen"

export interface GoogleSyncWorkerMetricsListParams {
  limit?: number
  offset?: number
}

export interface GoogleSyncWorkerMetricsListResult {
  rows: GoogleSyncWorkerMetricsDTO[]
}

interface GoogleSyncWorkerMetricsRepository {
  findById(id: string): Promise<GoogleSyncWorkerMetricsDTO | null>
  list(params: GoogleSyncWorkerMetricsListParams): Promise<GoogleSyncWorkerMetricsListResult>
  insert(data: Partial<GoogleSyncWorkerMetricsDTO>): Promise<GoogleSyncWorkerMetricsDTO>
  update(id: string, patch: Partial<GoogleSyncWorkerMetricsDTO>): Promise<GoogleSyncWorkerMetricsDTO>
  delete(id: string): Promise<void>
}

export { type GoogleSyncWorkerMetricsRepository }
