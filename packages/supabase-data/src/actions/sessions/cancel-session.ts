"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { cancelSessionForPsychologist } from "../../modules/sessions/application/session-commands";
import type { MutationResult } from "../../types/entities";

export type CancelSessionRequest = { sessionId: string; reason?: string };
export type CancelSessionResponse = MutationResult;

const cancelSessionRequestSchema = z.custom<CancelSessionRequest>();

const _cancelSessionAction = createAction<CancelSessionRequest, CancelSessionResponse>({
  name: "sessions.cancelSession",
  inputSchema: cancelSessionRequestSchema,
  handler: async (input, context) => {
    return cancelSessionForPsychologist(
      context.supabase,
      context.userId,
      input.sessionId,
      input.reason,
    );
  },
});

export async function cancelSessionAction(
  input: CancelSessionRequest,
): Promise<SerializedResult<CancelSessionResponse>> {
  const result = await _cancelSessionAction(input);
  return serializeResult(result);
}
