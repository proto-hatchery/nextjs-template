"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { completeSessionForPsychologist } from "../../modules/sessions/application/session-commands";
import type { MutationResult } from "../../types/entities";

export type CompleteSessionRequest = { sessionId: string };
export type CompleteSessionResponse = MutationResult;

const completeSessionRequestSchema = z.custom<CompleteSessionRequest>();

const _completeSessionAction = createAction<CompleteSessionRequest, CompleteSessionResponse>({
  name: "sessions.completeSession",
  inputSchema: completeSessionRequestSchema,
  handler: async (input, context) => {
    return completeSessionForPsychologist(context.supabase, context.userId, input.sessionId);
  },
});

export async function completeSessionAction(
  input: CompleteSessionRequest,
): Promise<SerializedResult<CompleteSessionResponse>> {
  const result = await _completeSessionAction(input);
  return serializeResult(result);
}
