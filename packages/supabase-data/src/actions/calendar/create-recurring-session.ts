"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createSessionSeries } from "../../modules/calendar/application/calendar-series-commands";
import type { CalendarEventSeries, CreateSessionSeriesInput } from "../../types/entities";

const createRecurringSessionRequestSchema = z.custom<CreateSessionSeriesInput>();

export type CreateRecurringSessionRequest = CreateSessionSeriesInput;
export type CreateRecurringSessionResponse = CalendarEventSeries;

const _createRecurringSessionAction = createAction<
  CreateRecurringSessionRequest,
  CreateRecurringSessionResponse
>({
  name: "calendar.createRecurringSession",
  inputSchema: createRecurringSessionRequestSchema,
  handler: async (input, context) => {
    const data = await createSessionSeries(context.supabase, context.userId, input);
    return ok(data);
  },
});

export async function createRecurringSessionAction(
  input: CreateRecurringSessionRequest,
): Promise<SerializedResult<CreateRecurringSessionResponse>> {
  const result = await _createRecurringSessionAction(input);
  return serializeResult(result);
}
