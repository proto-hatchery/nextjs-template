"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createSupervisionEvent } from "../../modules/calendar/application/calendar-event-commands";
import type { CalendarEvent, CreateSupervisionEventInput } from "../../types/entities";

const createSupervisionRequestSchema = z.custom<CreateSupervisionEventInput>();

export type CreateSupervisionRequest = CreateSupervisionEventInput;
export type CreateSupervisionResponse = CalendarEvent;

const _createSupervisionAction = createAction<CreateSupervisionRequest, CreateSupervisionResponse>({
  name: "calendar.createSupervisionEvent",
  inputSchema: createSupervisionRequestSchema,
  handler: async (input, context) => {
    const data = await createSupervisionEvent(context.supabase, context.userId, input);
    return ok(data);
  },
});

export async function createSupervisionAction(
  input: CreateSupervisionRequest,
): Promise<SerializedResult<CreateSupervisionResponse>> {
  const result = await _createSupervisionAction(input);
  return serializeResult(result);
}
