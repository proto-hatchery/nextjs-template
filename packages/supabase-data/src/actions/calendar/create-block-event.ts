"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createBlockEvent } from "../../modules/calendar/application/calendar-event-commands";
import type { CalendarEvent, CreateBlockEventInput } from "../../types/entities";

const createBlockRequestSchema = z.custom<CreateBlockEventInput>();

export type CreateBlockRequest = CreateBlockEventInput;
export type CreateBlockResponse = CalendarEvent;

const _createBlockAction = createAction<CreateBlockRequest, CreateBlockResponse>({
  name: "calendar.createBlockEvent",
  inputSchema: createBlockRequestSchema,
  handler: async (input, context) => {
    const data = await createBlockEvent(context.supabase, context.userId, input);
    return ok(data);
  },
});

export async function createBlockAction(
  input: CreateBlockRequest,
): Promise<SerializedResult<CreateBlockResponse>> {
  const result = await _createBlockAction(input);
  return serializeResult(result);
}
