"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import { verifyResourceOwnership } from "../../utils/authorization";
import type { SessionWithDetails } from "../../types/entities";

const getClinicalSessionDetailsRequestSchema = z
  .object({
    sessionId: z.uuid(),
    timezone: z.string().optional(),
  })
  .strict();

export type GetClinicalSessionDetailsRequest = z.infer<
  typeof getClinicalSessionDetailsRequestSchema
>;
export type GetClinicalSessionDetailsResponse = { session: SessionWithDetails | null };
export type GetClinicalSessionDetailsPromise = Promise<
  SerializedResult<GetClinicalSessionDetailsResponse>
>;

const _getClinicalSessionDetailsAction = createAction<
  GetClinicalSessionDetailsRequest,
  GetClinicalSessionDetailsResponse
>({
  name: "sessions.getClinicalSessionDetails",
  inputSchema: getClinicalSessionDetailsRequestSchema,
  handler: async ({ sessionId, timezone }, context) => {
    // Verify session ownership
    const isOwner = await verifyResourceOwnership(
      context.supabase,
      "calendar_events",
      context.userId,
      sessionId,
    );

    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this session",
        ),
      );
    }

    const repository = new SessionSupabaseRepository(context.supabase);
    const result = await repository.getSessionDetails(sessionId, timezone);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ session: result.value });
  },
});

export async function getClinicalSessionDetailsAction(
  input: GetClinicalSessionDetailsRequest,
): Promise<SerializedResult<GetClinicalSessionDetailsResponse>> {
  const result = await _getClinicalSessionDetailsAction(input);
  return serializeResult(result);
}
