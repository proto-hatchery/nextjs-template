"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { deleteCalendarEvent } from "../../modules/calendar/application/calendar-event-commands";

const deleteEventRequestSchema = z.object({ eventId: z.uuid() });

export type DeleteEventRequest = z.infer<typeof deleteEventRequestSchema>;
export type DeleteEventResponse = { success: true };

const _deleteEventAction = createAction<DeleteEventRequest, DeleteEventResponse>({
  name: "calendar.deleteEvent",
  inputSchema: deleteEventRequestSchema,
  handler: async (input, context) => {
    await deleteCalendarEvent(context.supabase, input.eventId);
    return ok({ success: true });
  },
});

export async function deleteEventAction(
  input: DeleteEventRequest,
): Promise<SerializedResult<DeleteEventResponse>> {
  const result = await _deleteEventAction(input);
  return serializeResult(result);
}
