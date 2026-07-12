"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updateSeriesInstance } from "../../modules/calendar/application/calendar-series-commands";
import type { SeriesEditScope, UpdateCalendarEventSeriesInput } from "../../types/entities";

const updateSeriesInstanceRequestSchema = z.object({
  eventId: z.uuid(),
  updates: z.custom<UpdateCalendarEventSeriesInput & { timezone?: string; allDay?: boolean }>(),
  scope: z.custom<SeriesEditScope>(),
});

export type UpdateSeriesInstanceRequest = z.infer<typeof updateSeriesInstanceRequestSchema>;
export type UpdateSeriesInstanceResponse = { success: true };

const _updateSeriesInstanceAction = createAction<
  UpdateSeriesInstanceRequest,
  UpdateSeriesInstanceResponse
>({
  name: "calendar.updateSeriesInstance",
  inputSchema: updateSeriesInstanceRequestSchema,
  handler: async (input, context) => {
    await updateSeriesInstance(
      context.supabase,
      context.userId,
      input.eventId,
      input.updates,
      input.scope,
    );
    return ok({ success: true });
  },
});

export async function updateSeriesInstanceAction(
  input: UpdateSeriesInstanceRequest,
): Promise<SerializedResult<UpdateSeriesInstanceResponse>> {
  const result = await _updateSeriesInstanceAction(input);
  return serializeResult(result);
}
