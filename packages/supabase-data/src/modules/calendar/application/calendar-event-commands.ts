import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CreateCalendarEventInput,
  CreateSupervisionEventInput,
  CreateBlockEventInput,
  UpdateCalendarEventInput,
  CalendarEventStatus,
  CalendarEventType,
  CalendarEvent,
} from "@workspace/supabase-data/types/entities";
import { deleteChargeForPsychologist } from "../../charges/application/charge-commands";
import { resolvePsychologistTimezone } from "../../../utils/timezone";
import { safeLogger } from "../../../utils/safe-logger";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a new calendar event
 */
export async function createCalendarEvent(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateCalendarEventInput,
): Promise<CalendarEvent> {
  safeLogger.log("========================================");
  safeLogger.log("[MUTATION] createCalendarEvent INICIADO");
  safeLogger.log("[MUTATION] psychologistId:", psychologistId);
  safeLogger.log("[MUTATION] input:", input);

  const endDatetime =
    input.endDatetime ?? calculateEndDatetime(input.startDatetime, input.durationMinutes ?? 50);
  const timezone = await resolvePsychologistTimezone(supabase, psychologistId, input.timezone);

  const insertData = {
    psychologist_id: psychologistId,
    event_type: input.eventType,
    title: input.title,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.location !== undefined ? { location: input.location } : {}),
    ...(input.color !== undefined ? { color: input.color } : {}),
    start_datetime: input.startDatetime,
    end_datetime: endDatetime,
    duration_minutes: input.durationMinutes ?? 50,
    timezone,
    all_day: input.allDay ?? false,
    status: input.status ?? "scheduled",
    source: "fluri" as const,
    sync_origin: "user" as const,
    google_sync_status: "pending" as const, // Will be synced if connected
    ...(input.privateNotes !== undefined ? { private_notes: input.privateNotes } : {}),
    metadata: (input.metadata ??
      {}) as Database["public"]["Tables"]["calendar_events"]["Row"]["metadata"],
  };

  safeLogger.log("[MUTATION] Dados para INSERT:", insertData);
  safeLogger.log("[MUTATION] Executando INSERT na tabela calendar_events...");

  const { data, error } = await supabase
    .from("calendar_events")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    safeLogger.error("[MUTATION] ❌ ERRO no INSERT:");
    safeLogger.error("[MUTATION] error.message:", error.message);
    safeLogger.error("[MUTATION] error.code:", error.code);
    safeLogger.error("[MUTATION] error.details:", error.details);
    safeLogger.error("[MUTATION] error.hint:", error.hint);
    safeLogger.error("[MUTATION] Erro completo:", JSON.stringify(error, null, 2));
    throw error;
  }

  safeLogger.log("[MUTATION] ✅ INSERT bem-sucedido!");
  safeLogger.log("[MUTATION] Evento criado:", data);
  safeLogger.log("[MUTATION] createCalendarEvent FINALIZADO");
  safeLogger.log("========================================");

  return data;
}

/**
 * Creates a supervision event
 */
export async function createSupervisionEvent(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateSupervisionEventInput,
): Promise<CalendarEvent> {
  const endDatetime =
    input.endDatetime ?? calculateEndDatetime(input.startDatetime, input.durationMinutes ?? 60);
  const timezone = await resolvePsychologistTimezone(supabase, psychologistId, input.timezone);

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      psychologist_id: psychologistId,
      event_type: "supervision" as CalendarEventType,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      color: input.color ?? "#9C27B0", // Purple for supervision
      start_datetime: input.startDatetime,
      end_datetime: endDatetime,
      duration_minutes: input.durationMinutes ?? 60,
      timezone,
      all_day: false,
      status: input.status ?? "scheduled",
      source: "fluri",
      sync_origin: "user",
      google_sync_status: "pending",
      ...(input.privateNotes !== undefined ? { private_notes: input.privateNotes } : {}),
      metadata: {
        supervision_type: input.supervisionType,
        supervisor_name: input.supervisorName,
        supervisee_name: input.superviseeName,
        topic: input.topic,
        ...(input.createGoogleMeet ? { google_meet_link: null } : {}),
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates a time block event
 */
export async function createBlockEvent(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  input: CreateBlockEventInput,
): Promise<CalendarEvent> {
  const endDatetime =
    input.endDatetime ?? calculateEndDatetime(input.startDatetime, input.durationMinutes ?? 60);
  const timezone = await resolvePsychologistTimezone(supabase, psychologistId, input.timezone);

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      psychologist_id: psychologistId,
      event_type: "block" as CalendarEventType,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      color: input.color ?? "#757575", // Gray for blocks
      start_datetime: input.startDatetime,
      end_datetime: endDatetime,
      duration_minutes: input.durationMinutes ?? 60,
      timezone,
      all_day: input.allDay ?? false,
      status: "scheduled",
      source: "fluri",
      sync_origin: "user",
      google_sync_status: "pending",
      ...(input.privateNotes !== undefined ? { private_notes: input.privateNotes } : {}),
      metadata: {
        ...(input.blockType ? { block_type: input.blockType } : {}),
        ...(input.reason ? { reason: input.reason } : {}),
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates a calendar event
 */
export async function updateCalendarEvent(
  supabase: TypedSupabaseClient,
  eventId: string,
  input: UpdateCalendarEventInput,
): Promise<CalendarEvent> {
  const updateData: Database["public"]["Tables"]["calendar_events"]["Update"] = {
    updated_at: new Date().toISOString(),
    sync_origin: "user",
    google_sync_status: "pending", // Mark for re-sync
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.startDatetime !== undefined) updateData.start_datetime = input.startDatetime;
  if (input.endDatetime !== undefined) updateData.end_datetime = input.endDatetime;
  if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes;
  if (input.allDay !== undefined) updateData.all_day = input.allDay;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.privateNotes !== undefined) updateData.private_notes = input.privateNotes;
  if (input.metadata !== undefined)
    updateData.metadata =
      input.metadata as Database["public"]["Tables"]["calendar_events"]["Row"]["metadata"];

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reschedules a calendar event (preserves original datetime for recurring)
 */
export async function rescheduleCalendarEvent(
  supabase: TypedSupabaseClient,
  eventId: string,
  newStartDatetime: string,
  newEndDatetime?: string,
  reason?: string,
): Promise<CalendarEvent> {
  // First get the current event
  const { data: current, error: fetchError } = await supabase
    .from("calendar_events")
    .select("start_datetime, end_datetime, duration_minutes, original_start_datetime")
    .eq("id", eventId)
    .single();

  if (fetchError) throw fetchError;

  const endDatetime =
    newEndDatetime ?? calculateEndDatetime(newStartDatetime, current.duration_minutes ?? 50);

  const updateData: Database["public"]["Tables"]["calendar_events"]["Update"] = {
    start_datetime: newStartDatetime,
    end_datetime: endDatetime,
    status: "rescheduled" as CalendarEventStatus,
    updated_at: new Date().toISOString(),
    sync_origin: "user",
    google_sync_status: "pending",
  };

  // Preserve original datetime if not already set (for series instances)
  if (!current.original_start_datetime) {
    updateData.original_start_datetime = current.start_datetime;
    updateData.original_end_datetime = current.end_datetime;
  }

  if (reason) {
    updateData.private_notes = reason;
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Changes the status of a calendar event
 */
export async function changeCalendarEventStatus(
  supabase: TypedSupabaseClient,
  eventId: string,
  status: CalendarEventStatus,
  reason?: string,
): Promise<CalendarEvent> {
  const updateData: Database["public"]["Tables"]["calendar_events"]["Update"] = {
    status,
    updated_at: new Date().toISOString(),
    sync_origin: "user",
    google_sync_status: "pending",
  };

  if (reason) {
    updateData.private_notes = reason;
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes a calendar event and all associated data
 *
 * IMPORTANT:
 * - For session events: Deletes session, charge, note, and session details
 * - For all events: Local delete is source of truth and outbound sync is queued by DB trigger
 */
export async function deleteCalendarEvent(
  supabase: TypedSupabaseClient,
  eventId: string,
): Promise<void> {
  // 1. Get event details before deletion
  const { data: event, error: fetchError } = await supabase
    .from("calendar_events")
    .select("id, google_event_id, psychologist_id, title, event_type, status")
    .eq("id", eventId)
    .single();

  if (fetchError) throw fetchError;
  if (!event) throw new Error("Event not found");

  // 2. If this is a session event, delete associated charge and note first
  if (event.event_type === "session") {
    if (event.status !== "scheduled" && event.status !== "cancelled") {
      throw new Error("Apenas sessões agendadas ou canceladas podem ser excluídas.");
    }

    const { data: charge } = await supabase
      .from("psychologist_patient_charges")
      .select("id")
      .eq("session_id", event.id)
      .eq("psychologist_id", event.psychologist_id)
      .maybeSingle();

    if (charge?.id) {
      safeLogger.log(`[deleteCalendarEvent] Deleting charge: ${charge.id}`);

      const chargeResult = await deleteChargeForPsychologist(
        supabase,
        event.psychologist_id,
        charge.id,
      );

      if (chargeResult.isErr()) {
        safeLogger.error(
          "[deleteCalendarEvent] Error deleting charge:",
          chargeResult.error.message,
        );
      } else {
        safeLogger.log("[deleteCalendarEvent] Charge deleted successfully");
      }
    }

    await supabase
      .from("psychologist_notes")
      .delete()
      .eq("session_id", event.id)
      .eq("psychologist_id", event.psychologist_id);
  }

  // 3. Delete from Fluri (outbound deletion is queued by DB trigger when applicable).
  const { error: deleteError } = await supabase.from("calendar_events").delete().eq("id", eventId);

  if (deleteError) throw deleteError;

  safeLogger.log(`[deleteCalendarEvent] Successfully deleted from Fluri: ${eventId}`);
}

/**
 * Deletes multiple calendar events and all associated data
 *
 * IMPORTANT:
 * - For session events: Deletes session, charge, note, and session details
 * - For all events: Local delete is source of truth and outbound sync is queued by DB trigger
 */
export async function bulkDeleteCalendarEvents(
  supabase: TypedSupabaseClient,
  eventIds: string[],
): Promise<void> {
  if (eventIds.length === 0) return;

  // 1. Get event details before deletion
  const { data: events, error: fetchError } = await supabase
    .from("calendar_events")
    .select("id, google_event_id, psychologist_id, title, event_type, status")
    .in("id", eventIds);

  if (fetchError) throw fetchError;
  if (!events || events.length === 0) return;

  const sessionEvents = events.filter((e) => e.event_type === "session");

  if (sessionEvents.length > 0) {
    const invalidSessions = sessionEvents.filter(
      (s) => s.status !== "scheduled" && s.status !== "cancelled",
    );
    if (invalidSessions.length > 0) {
      throw new Error("Apenas sessões agendadas ou canceladas podem ser excluídas.");
    }

    const { data: charges } = await supabase
      .from("psychologist_patient_charges")
      .select("id, psychologist_id")
      .in(
        "session_id",
        sessionEvents.map((session) => session.id),
      );

    const chargeTargets =
      charges?.map((charge) => ({
        chargeId: charge.id,
        psychologistId: charge.psychologist_id,
      })) ?? [];

    if (chargeTargets.length > 0) {
      await Promise.all(
        chargeTargets.map(async ({ chargeId, psychologistId }) => {
          const chargeResult = await deleteChargeForPsychologist(
            supabase,
            psychologistId,
            chargeId,
          );
          if (chargeResult.isErr()) {
            safeLogger.error(
              `[bulkDeleteCalendarEvents] Error deleting charge ${chargeId}:`,
              chargeResult.error.message,
            );
            throw new Error(`Failed to delete charge ${chargeId}: ${chargeResult.error.message}`);
          }
        }),
      );
    }

    if (sessionEvents.length > 0) {
      const psychologistIds = [...new Set(sessionEvents.map((s) => s.psychologist_id))];

      await supabase
        .from("psychologist_notes")
        .delete()
        .in(
          "session_id",
          sessionEvents.map((session) => session.id),
        )
        .in("psychologist_id", psychologistIds);
    }
  }

  // 3. Delete from Fluri (outbound deletion is queued by DB trigger when applicable).
  const { error: deleteError } = await supabase.from("calendar_events").delete().in("id", eventIds);

  if (deleteError) throw deleteError;
}

/**
 * Updates the Google sync status of an event
 */
export async function updateEventGoogleSync(
  supabase: TypedSupabaseClient,
  eventId: string,
  googleEventId: string,
  syncStatus: "synced" | "pending" | "error" | "not_synced" = "synced",
): Promise<void> {
  const { error } = await supabase
    .from("calendar_events")
    .update({
      google_event_id: googleEventId,
      google_sync_status: syncStatus,
      last_synced_at: new Date().toISOString(),
      google_sync_error: null,
      sync_origin: "system",
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) throw error;
}

/**
 * Marks an event sync as failed
 */
export async function markEventSyncError(
  supabase: TypedSupabaseClient,
  eventId: string,
  errorMessage: string,
): Promise<void> {
  const { error } = await supabase
    .from("calendar_events")
    .update({
      google_sync_status: "error",
      google_sync_error: errorMessage,
      sync_origin: "system",
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) throw error;
}

// Helper function
function calculateEndDatetime(startDatetime: string, durationMinutes: number): string {
  const start = new Date(startDatetime);
  start.setMinutes(start.getMinutes() + durationMinutes);
  return start.toISOString();
}
