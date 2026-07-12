"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updateCalendarEvent } from "../../modules/calendar/application/calendar-event-commands";
import type { CalendarEvent, UpdateCalendarEventInput } from "../../types/entities";

const updateEventRequestSchema = z.custom<UpdateCalendarEventInput & { eventId: string }>();

export type UpdateEventRequest = UpdateCalendarEventInput & { eventId: string };
export type UpdateEventResponse = CalendarEvent;

const _updateEventAction = createAction<UpdateEventRequest, UpdateEventResponse>({
  name: "calendar.updateEvent",
  inputSchema: updateEventRequestSchema,
  handler: async (input, context) => {
    const { eventId, ...updateData } = input;
    const data = await updateCalendarEvent(context.supabase, eventId, updateData);
    return ok(data);
  },
});

export async function updateEventAction(
  input: UpdateEventRequest,
): Promise<SerializedResult<UpdateEventResponse>> {
  const result = await _updateEventAction(input);
  return serializeResult(result);
}
