"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { createSessionFromCalendarEventForPsychologist } from "../../modules/sessions/application/session-commands";
import type { CreateSessionEventInput } from "../../types/entities";

const createSessionRequestSchema = z.custom<CreateSessionEventInput>();

export type CreateSessionRequest = CreateSessionEventInput;
export type CreateSessionResponse = {
  session_id: string;
  event_id: string;
  charge_id?: string;
  note_id?: string;
  details_id?: string;
};

const _createSessionAction = createAction<CreateSessionRequest, CreateSessionResponse>({
  name: "calendar.createSessionEvent",
  inputSchema: createSessionRequestSchema,
  handler: async (input, context) => {
    const result = await createSessionFromCalendarEventForPsychologist(
      context.supabase,
      context.userId,
      input,
    );
    if (result.isErr()) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          result.error.message ?? "Failed to create session",
        ),
      );
    }

    return ok({
      session_id: result.value.session_id,
      event_id: result.value.event_id,
      ...(result.value.charge_id ? { charge_id: result.value.charge_id } : {}),
      ...(result.value.note_id ? { note_id: result.value.note_id } : {}),
      details_id: result.value.details_id,
    });
  },
});

export async function createSessionAction(
  input: CreateSessionRequest,
): Promise<SerializedResult<CreateSessionResponse>> {
  const result = await _createSessionAction(input);
  return serializeResult(result);
}
