"use server";

import { ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { convertCalendarEventToSeries } from "../../modules/calendar/application/calendar-series-commands";
import type { CalendarEventSeries, ConvertCalendarEventToSeriesInput } from "../../types/entities";

const convertEventToSeriesRequestSchema = z.custom<ConvertCalendarEventToSeriesInput>();

export type ConvertEventToSeriesRequest = ConvertCalendarEventToSeriesInput;
export type ConvertEventToSeriesResponse = CalendarEventSeries;

const _convertEventToSeriesAction = createAction<
  ConvertEventToSeriesRequest,
  ConvertEventToSeriesResponse
>({
  name: "calendar.convertEventToSeries",
  inputSchema: convertEventToSeriesRequestSchema,
  handler: async (input, context) => {
    const data = await convertCalendarEventToSeries(context.supabase, context.userId, input);
    return ok(data);
  },
});

export async function convertEventToSeriesAction(
  input: ConvertEventToSeriesRequest,
): Promise<SerializedResult<ConvertEventToSeriesResponse>> {
  const result = await _convertEventToSeriesAction(input);
  return serializeResult(result);
}
