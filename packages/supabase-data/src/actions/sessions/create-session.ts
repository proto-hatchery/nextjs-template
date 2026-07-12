"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { createSessionForPsychologist } from "../../modules/sessions/application/session-commands";
import type { CreateSessionInput, SessionResult } from "../../types/entities";

export type CreateSessionRequest = CreateSessionInput;
export type CreateSessionResponse = SessionResult;

const createSessionRequestSchema = z.custom<CreateSessionRequest>();

const _createSessionAction = createAction<CreateSessionRequest, CreateSessionResponse>({
  name: "sessions.createSession",
  inputSchema: createSessionRequestSchema,
  handler: async (input, context) => {
    return createSessionForPsychologist(context.supabase, context.userId, input);
  },
});

export async function createSessionAction(
  input: CreateSessionRequest,
): Promise<SerializedResult<CreateSessionResponse>> {
  const result = await _createSessionAction(input);
  return serializeResult(result);
}
