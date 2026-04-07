// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"

import type { ObservabilityEventsRepository, ObservabilityEventsListParams, ObservabilityEventsListResult } from "@workspace/supabase-data/modules/observability/domain/ports/observability-events-repository.port.codegen"
import { fromObservabilityEventsRow } from "@workspace/supabase-data/modules/observability/infrastructure/mappers/observability-events.mapper.codegen"
import type { ObservabilityEventsDTO } from "@workspace/supabase-data/modules/observability/domain/dto/observability-events.dto.codegen"

class ObservabilityEventsSupabaseRepository implements ObservabilityEventsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<ObservabilityEventsDTO | null> {
    const { data, error } = await this.supabase
      .from("observability_events")
      .select("actor_id_hash, actor_type, component, correlation_id, correlation_provenance, duration_ms, environment, error_category, error_code, error_message, event_family, event_name, http_status, id, ip_hash, metadata, operation, operation_type, outcome, request_path, role, runtime, service, severity, timestamp, trace_id, user_agent")
      .eq("id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load observability_events.", { cause: error })
    }
    if (!data) return null
    return fromObservabilityEventsRow(data)
  }

  async list(params: ObservabilityEventsListParams): Promise<ObservabilityEventsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase.from("observability_events").select("actor_id_hash, actor_type, component, correlation_id, correlation_provenance, duration_ms, environment, error_category, error_code, error_message, event_family, event_name, http_status, id, ip_hash, metadata, operation, operation_type, outcome, request_path, role, runtime, service, severity, timestamp, trace_id, user_agent").range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list observability_events.", { cause: error })
    }
    const rows = (data ?? []).map((row) => fromObservabilityEventsRow(row))
    return { rows }
  }

}

export { ObservabilityEventsSupabaseRepository }
