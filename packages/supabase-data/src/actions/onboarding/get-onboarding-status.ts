"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getOnboardingStatus } from "../../modules/onboarding/application/onboarding-queries";

/**
 * Request schema for getting onboarding status (no input needed).
 */
const getOnboardingStatusRequestSchema = z.object({}).strict();

export type GetOnboardingStatusRequest = z.infer<typeof getOnboardingStatusRequestSchema>;

/**
 * Response for onboarding status query.
 */
export type GetOnboardingStatusResponse = {
  completed: boolean;
};

/**
 * Promise alias for getOnboardingStatus action.
 */
export type GetOnboardingStatusPromise = Promise<SerializedResult<GetOnboardingStatusResponse>>;

/**
 * Check onboarding status for the current user.
 *
 * Returns true if onboarding is completed or not required (non-psychologist).
 *
 * @example
 * ```tsx
 * const result = await getOnboardingStatus({});
 * if (result.isOk() && !result.value.completed) {
 *   router.push('/onboarding');
 * }
 * ```
 */
const _getOnboardingStatus = createAction<GetOnboardingStatusRequest, GetOnboardingStatusResponse>({
  name: "getOnboardingStatus",
  inputSchema: getOnboardingStatusRequestSchema,
  requireAuth: true,
  handler: async (_input, context) => {
    const result = await getOnboardingStatus(context.supabase, context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ completed: result.value });
  },
});

export async function getOnboardingStatusAction(
  input: GetOnboardingStatusRequest,
): Promise<SerializedResult<GetOnboardingStatusResponse>> {
  const result = await _getOnboardingStatus(input);
  return serializeResult(result);
}
