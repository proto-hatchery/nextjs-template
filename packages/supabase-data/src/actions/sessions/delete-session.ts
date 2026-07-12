"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { deleteSessionForPsychologist } from "../../modules/sessions/application/session-commands";
import type { MutationResult } from "../../types/entities";

export type DeleteSessionRequest = { sessionId: string };
export type DeleteSessionResponse = MutationResult;

const deleteSessionRequestSchema = z.custom<DeleteSessionRequest>();

const _deleteSessionAction = createAction<DeleteSessionRequest, DeleteSessionResponse>({
  name: "sessions.deleteSession",
  inputSchema: deleteSessionRequestSchema,
  handler: async (input, context) => {
    return deleteSessionForPsychologist(context.supabase, context.userId, input.sessionId);
  },
});

export async function deleteSessionAction(
  input: DeleteSessionRequest,
): Promise<SerializedResult<DeleteSessionResponse>> {
  const result = await _deleteSessionAction(input);
  return serializeResult(result);
}
