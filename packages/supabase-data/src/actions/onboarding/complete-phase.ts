"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { safeLogger } from "../../utils/safe-logger";
import { completeOnboardingPhaseForUser } from "../../modules/onboarding/application/onboarding-commands";

// ============================================================================
// Complete Onboarding Phase
// ============================================================================

const completeOnboardingPhaseRequestSchema = z.object({
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export type CompleteOnboardingPhaseRequest = z.infer<typeof completeOnboardingPhaseRequestSchema>;

export type CompleteOnboardingPhaseResponse = {
  lastSavedAt: string;
};

export type CompleteOnboardingPhasePromise = Promise<
  SerializedResult<CompleteOnboardingPhaseResponse>
>;

const _completeOnboardingPhase = createAction<
  CompleteOnboardingPhaseRequest,
  CompleteOnboardingPhaseResponse
>({
  name: "completeOnboardingPhase",
  inputSchema: completeOnboardingPhaseRequestSchema,
  handler: async (input, context) => {
    const { phase } = input;
    const result = await completeOnboardingPhaseForUser(context.supabase, context.userId, phase);

    if (result.isErr()) {
      safeLogger.error("[onboarding:completePhase] Failed to complete phase", {
        user_id: context.userId,
        phase,
        error_message: result.error.message,
      });
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function completeOnboardingPhaseAction(
  input: CompleteOnboardingPhaseRequest,
): Promise<SerializedResult<CompleteOnboardingPhaseResponse>> {
  const result = await _completeOnboardingPhase(input);
  return serializeResult(result);
}
