"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getOnboardingProgress } from "../../modules/onboarding/application/onboarding-queries";

/**
 * Request schema for getting onboarding progress (no input needed).
 */
const getOnboardingProgressRequestSchema = z.object({}).strict();

export type GetOnboardingProgressRequest = z.infer<typeof getOnboardingProgressRequestSchema>;

/**
 * Response for onboarding progress query.
 */
export type GetOnboardingProgressResponse = {
  essentialComplete: boolean; // Pagou = pode usar o sistema
  fullyComplete: boolean; // Completou todos os passos do wizard
  completionPercentage: number;
  currentStep: number;
  totalSteps: number;
  nextPendingStep: string | null; // 'subscription' | 'identity' | 'professional' | 'configuration' | 'profile'
  steps: {
    payment: boolean;
    identity: boolean;
    professional: boolean;
    configuration: boolean;
    profile: boolean;
  };
};

/**
 * Promise alias for getOnboardingProgress action.
 */
export type GetOnboardingProgressPromise = Promise<SerializedResult<GetOnboardingProgressResponse>>;

/**
 * Get detailed onboarding progress for the current user.
 *
 * Uses the new v2 onboarding system that separates:
 * - Essential (payment): user can access the system
 * - Full completion: user completed all profile wizard steps
 *
 * @example
 * ```tsx
 * const result = await getOnboardingProgress({});
 * if (result.isOk() && !result.value.fullyComplete) {
 *   // Show banner to complete onboarding
 * }
 * ```
 */
const _getOnboardingProgress = createAction<
  GetOnboardingProgressRequest,
  GetOnboardingProgressResponse
>({
  name: "getOnboardingProgress",
  inputSchema: getOnboardingProgressRequestSchema,
  requireAuth: true,
  handler: async (_input, context) => {
    const result = await getOnboardingProgress(context.supabase, context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function getOnboardingProgressAction(
  input: GetOnboardingProgressRequest,
): Promise<SerializedResult<GetOnboardingProgressResponse>> {
  const result = await _getOnboardingProgress(input);
  return serializeResult(result);
}
