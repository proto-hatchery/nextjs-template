"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import { updateSessionForPsychologist } from "../../modules/sessions/application/session-commands";
import type { MutationResult, UpdateSessionInput } from "../../types/entities";

export type UpdateSessionRequest = {
  sessionId: string;
  data: UpdateSessionInput;
};
export type UpdateSessionResponse = MutationResult;

const updateSessionRequestSchema = z.custom<UpdateSessionRequest>();

const _updateSessionAction = createAction<UpdateSessionRequest, UpdateSessionResponse>({
  name: "sessions.updateSession",
  inputSchema: updateSessionRequestSchema,
  handler: async (input, context) => {
    return updateSessionForPsychologist(
      context.supabase,
      context.userId,
      input.sessionId,
      input.data,
    );
  },
});

export async function updateSessionAction(
  input: UpdateSessionRequest,
): Promise<SerializedResult<UpdateSessionResponse>> {
  const result = await _updateSessionAction(input);
  return serializeResult(result);
}
