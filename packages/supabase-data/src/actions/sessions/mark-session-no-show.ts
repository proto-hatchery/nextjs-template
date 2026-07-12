"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { markSessionNoShowForPsychologist } from "../../modules/sessions/application/session-commands";
import type { MutationResult } from "../../types/entities";

export type MarkSessionNoShowRequest = { sessionId: string; reason?: string };
export type MarkSessionNoShowResponse = MutationResult;

const markSessionNoShowRequestSchema = z.custom<MarkSessionNoShowRequest>();

const _markSessionNoShowAction = createAction<MarkSessionNoShowRequest, MarkSessionNoShowResponse>({
  name: "sessions.markSessionNoShow",
  inputSchema: markSessionNoShowRequestSchema,
  handler: async (input, context) => {
    return markSessionNoShowForPsychologist(
      context.supabase,
      context.userId,
      input.sessionId,
      input.reason,
    );
  },
});

export async function markSessionNoShowAction(
  input: MarkSessionNoShowRequest,
): Promise<SerializedResult<MarkSessionNoShowResponse>> {
  const result = await _markSessionNoShowAction(input);
  return serializeResult(result);
}
