"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

const refreshSessionRequestSchema = z.object({}).strict();
type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>;

export type RefreshSessionResponse = {
  success: true;
};

export type RefreshSessionPromise = Promise<SerializedResult<RefreshSessionResponse>>;

const _refreshSessionAction = createAction<RefreshSessionRequest, RefreshSessionResponse>({
  name: "refreshSession",
  inputSchema: refreshSessionRequestSchema,
  requireAuth: true,
  handler: async (_input, context) => {
    const { error: refreshError } = await context.supabase.auth.refreshSession();

    if (refreshError) {
      return err(
        AppError.infra(AppErrorCode.AUTH_REFRESH_FAILED, "Failed to refresh session", refreshError),
      );
    }

    return ok({ success: true });
  },
});

export async function refreshSessionAction(
  input: RefreshSessionRequest,
): Promise<SerializedResult<RefreshSessionResponse>> {
  const result = await _refreshSessionAction(input);
  return serializeResult(result);
}
