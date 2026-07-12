"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { rescheduleSessionForPsychologist } from "../../modules/sessions/application/session-commands";
import type { MutationResult } from "../../types/entities";

export type RescheduleSessionRequest = {
  sessionId: string;
  newStartTime: string;
  newDurationMinutes?: number;
  reason?: string;
};
export type RescheduleSessionResponse = MutationResult;

const rescheduleSessionRequestSchema = z.custom<RescheduleSessionRequest>();

const _rescheduleSessionAction = createAction<RescheduleSessionRequest, RescheduleSessionResponse>({
  name: "sessions.rescheduleSession",
  inputSchema: rescheduleSessionRequestSchema,
  handler: async (input, context) => {
    return rescheduleSessionForPsychologist(
      context.supabase,
      context.userId,
      input.sessionId,
      input.newStartTime,
      input.newDurationMinutes,
      input.reason,
    );
  },
});

export async function rescheduleSessionAction(
  input: RescheduleSessionRequest,
): Promise<SerializedResult<RescheduleSessionResponse>> {
  const result = await _rescheduleSessionAction(input);
  return serializeResult(result);
}
