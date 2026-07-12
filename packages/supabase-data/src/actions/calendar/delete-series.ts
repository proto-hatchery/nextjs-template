"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { deleteCalendarEvent } from "../../modules/calendar/application/calendar-event-commands";
import { deleteCalendarEventSeries } from "../../modules/calendar/application/calendar-series-commands";
import type { SeriesEditScope } from "../../types/entities";

const deleteSeriesRequestSchema = z.object({
  seriesId: z.uuid(),
  scope: z.custom<SeriesEditScope>().optional(),
  eventId: z.uuid().optional(),
});

export type DeleteSeriesRequest = z.infer<typeof deleteSeriesRequestSchema>;
export type DeleteSeriesResponse = { success: true };

const _deleteSeriesAction = createAction<DeleteSeriesRequest, DeleteSeriesResponse>({
  name: "calendar.deleteSeries",
  inputSchema: deleteSeriesRequestSchema,
  handler: async (input, context) => {
    const { seriesId, scope, eventId } = input;
    const { supabase } = context;

    if (!scope || scope === "all") {
      await deleteCalendarEventSeries(supabase, seriesId);
    } else if (scope === "this" && eventId) {
      await deleteCalendarEvent(supabase, eventId);
    } else if (scope === "this_and_following" && eventId) {
      const { data: event, error } = await supabase
        .from("calendar_events")
        .select("start_datetime")
        .eq("id", eventId)
        .single();

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
      }

      const eventDate = event.start_datetime;
      await supabase
        .from("calendar_events")
        .delete()
        .eq("series_id", seriesId)
        .gte("start_datetime", eventDate);

      const effectiveEnd = new Date(eventDate);
      effectiveEnd.setDate(effectiveEnd.getDate() - 1);
      await supabase
        .from("calendar_event_series")
        .update({ effective_end: effectiveEnd.toISOString().split("T")[0] ?? null })
        .eq("id", seriesId);
    }

    return ok({ success: true });
  },
});

export async function deleteSeriesAction(
  input: DeleteSeriesRequest,
): Promise<SerializedResult<DeleteSeriesResponse>> {
  const result = await _deleteSeriesAction(input);
  return serializeResult(result);
}
