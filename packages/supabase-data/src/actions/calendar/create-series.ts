"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createCalendarEventSeries } from "../../modules/calendar/application/calendar-series-commands";
import type { CalendarEventSeries, CreateCalendarEventSeriesInput } from "../../types/entities";

const createSeriesRequestSchema = z.custom<CreateCalendarEventSeriesInput>();

export type CreateSeriesRequest = CreateCalendarEventSeriesInput;
export type CreateSeriesResponse = CalendarEventSeries;

const _createSeriesAction = createAction<CreateSeriesRequest, CreateSeriesResponse>({
  name: "calendar.createSeries",
  inputSchema: createSeriesRequestSchema,
  handler: async (input, context) => {
    const data = await createCalendarEventSeries(context.supabase, context.userId, input);
    return ok(data);
  },
});

export async function createSeriesAction(
  input: CreateSeriesRequest,
): Promise<SerializedResult<CreateSeriesResponse>> {
  const result = await _createSeriesAction(input);
  return serializeResult(result);
}
