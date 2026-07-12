"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { createCalendarEvent } from "../../modules/calendar/application/calendar-event-commands";
import type { CalendarEvent, CreateCalendarEventInput } from "../../types/entities";

const createCalendarEventRequestSchema = z.custom<CreateCalendarEventInput>();

export type CreateCalendarEventRequest = CreateCalendarEventInput;
export type CreateCalendarEventResponse = CalendarEvent;

const _createCalendarEventAction = createAction<
  CreateCalendarEventRequest,
  CreateCalendarEventResponse
>({
  name: "calendar.createCalendarEvent",
  inputSchema: createCalendarEventRequestSchema,
  handler: async (input, context) => {
    if (input.eventType === "session") {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_INPUT,
          "Session events must be created through the session creation flow to ensure session linkage.",
        ),
      );
    }

    const data = await createCalendarEvent(context.supabase, context.userId, input);
    return ok(data);
  },
});

export async function createCalendarEventAction(
  input: CreateCalendarEventRequest,
): Promise<SerializedResult<CreateCalendarEventResponse>> {
  const result = await _createCalendarEventAction(input);
  return serializeResult(result);
}
