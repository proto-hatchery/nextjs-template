// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { SupabaseClient } from "@supabase/supabase-js"

import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import type { TherapeuticSessionEventsDTO } from "@workspace/supabase-data/modules/clinical-sessions/domain/dto/therapeutic-session-events.dto.codegen"
import type {
  TherapeuticSessionEventsRepository,
  TherapeuticSessionEventsListParams,
  TherapeuticSessionEventsListResult,
} from "@workspace/supabase-data/modules/clinical-sessions/domain/ports/therapeutic-session-events-repository.port.codegen"
import { fromTherapeuticSessionEventsRow } from "@workspace/supabase-data/modules/clinical-sessions/infrastructure/mappers/therapeutic-session-events.mapper.codegen"

class TherapeuticSessionEventsSupabaseRepository implements TherapeuticSessionEventsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<TherapeuticSessionEventsDTO | null> {
    const { data, error } = await this.supabase
      .from("therapeutic_session_events")
      .select(
        "all_day, attendance_confirmed, billing_attempt_count, billing_last_attempt_at, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, clinical_session_id, color, confirmation_sent_at, created_at, description, duration_minutes, end_datetime, google_event_id, google_sync_error, google_sync_status, last_synced_at, legacy_session_id, location, metadata, patient_display_name, patient_name, private_notes, psychologist_id, psychologist_patient_id, psychologist_service_id, reminder_sent_at, scheduling_status, series_id, service_duration, service_name, service_price, session_detail_id, session_number, session_type_id, source, start_datetime, timezone, title, updated_at"
      )
      .eq("calendar_event_id", id)
      .maybeSingle()
    if (error) {
      throw new SupabaseRepositoryError("Failed to load therapeutic_session_events.", {
        cause: error,
      })
    }
    if (!data) return null
    return fromTherapeuticSessionEventsRow(data)
  }

  async list(
    params: TherapeuticSessionEventsListParams
  ): Promise<TherapeuticSessionEventsListResult> {
    const limit = Math.min(params.limit ?? 20, 100)
    const offset = params.offset ?? 0
    const end = offset + limit - 1
    const q = this.supabase
      .from("therapeutic_session_events")
      .select(
        "all_day, attendance_confirmed, billing_attempt_count, billing_last_attempt_at, billing_last_error, billing_next_attempt_at, billing_status, calendar_event_id, clinical_session_id, color, confirmation_sent_at, created_at, description, duration_minutes, end_datetime, google_event_id, google_sync_error, google_sync_status, last_synced_at, legacy_session_id, location, metadata, patient_display_name, patient_name, private_notes, psychologist_id, psychologist_patient_id, psychologist_service_id, reminder_sent_at, scheduling_status, series_id, service_duration, service_name, service_price, session_detail_id, session_number, session_type_id, source, start_datetime, timezone, title, updated_at"
      )
      .range(offset, end)
    const { data, error } = await q
    if (error) {
      throw new SupabaseRepositoryError("Failed to list therapeutic_session_events.", {
        cause: error,
      })
    }
    const rows = (data ?? []).map((row) => fromTherapeuticSessionEventsRow(row))
    return { rows }
  }
}

export { TherapeuticSessionEventsSupabaseRepository }
