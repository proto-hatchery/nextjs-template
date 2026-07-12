"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { changeSessionStatusForPsychologist } from "../../modules/sessions/application/session-commands";
import type { ClinicalSessionStatus, MutationResult } from "../../types/entities";

export type ChangeSessionStatusRequest = {
  sessionId: string;
  status: ClinicalSessionStatus;
  reason?: string;
};
export type ChangeSessionStatusResponse = MutationResult;

const changeSessionStatusRequestSchema = z.custom<ChangeSessionStatusRequest>();

const _changeSessionStatusAction = createAction<
  ChangeSessionStatusRequest,
  ChangeSessionStatusResponse
>({
  name: "sessions.changeSessionStatus",
  inputSchema: changeSessionStatusRequestSchema,
  handler: async (input, context) => {
    return changeSessionStatusForPsychologist(
      context.supabase,
      context.userId,
      input.sessionId,
      input.status,
      input.reason,
    );
  },
});

export async function changeSessionStatusAction(
  input: ChangeSessionStatusRequest,
): Promise<SerializedResult<ChangeSessionStatusResponse>> {
  const result = await _changeSessionStatusAction(input);
  return serializeResult(result);
}
