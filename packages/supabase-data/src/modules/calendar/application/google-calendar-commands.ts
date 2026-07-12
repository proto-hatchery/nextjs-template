import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

interface UpdateConnectionParams {
  psychologistId: string;
  googleCalendarId?: string;
  syncEnabled?: boolean;
  syncToGoogle?: boolean;
  syncFromGoogle?: boolean;
  syncSessions?: boolean;
  syncSupervisions?: boolean;
  syncMeetings?: boolean;
  syncTasks?: boolean;
  syncBlocks?: boolean;
  syncOther?: boolean;
  showPatientName?: boolean;
  showEventDetails?: boolean;
}

/**
 * Updates Google Calendar connection settings.
 */
export async function updateGoogleCalendarConnection(
  supabase: TypedSupabaseClient,
  params: UpdateConnectionParams,
) {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (params.googleCalendarId !== undefined)
    updateData.google_calendar_id = params.googleCalendarId;
  if (params.syncEnabled !== undefined) updateData.sync_enabled = params.syncEnabled;
  if (params.syncToGoogle !== undefined) updateData.sync_to_google = params.syncToGoogle;
  if (params.syncFromGoogle !== undefined) updateData.sync_from_google = params.syncFromGoogle;
  if (params.syncSessions !== undefined) updateData.sync_sessions = params.syncSessions;
  if (params.syncSupervisions !== undefined) updateData.sync_supervisions = params.syncSupervisions;
  if (params.syncMeetings !== undefined) updateData.sync_meetings = params.syncMeetings;
  if (params.syncTasks !== undefined) updateData.sync_tasks = params.syncTasks;
  if (params.syncBlocks !== undefined) updateData.sync_blocks = params.syncBlocks;
  if (params.syncOther !== undefined) updateData.sync_other = params.syncOther;
  if (params.showPatientName !== undefined) updateData.show_patient_name = params.showPatientName;
  if (params.showEventDetails !== undefined)
    updateData.show_event_details = params.showEventDetails;

  const { data, error } = await supabase
    .from("google_calendar_connections")
    .update(updateData)
    .eq("psychologist_id", params.psychologistId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Disconnects Google Calendar and clears watch channel metadata.
 */
export async function disconnectGoogleCalendar(
  supabase: TypedSupabaseClient,
  psychologistId: string,
) {
  const { error } = await supabase
    .from("google_calendar_connections")
    .update({
      is_connected: false,
      watch_channel_id: null,
      watch_resource_id: null,
      watch_channel_token: null,
      watch_expiration: null,
      updated_at: new Date().toISOString(),
    })
    .eq("psychologist_id", psychologistId);

  if (error) throw error;
}
