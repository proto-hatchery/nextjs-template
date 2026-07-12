"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getDetailedOnboardingStatusForUser } from "../../modules/onboarding/application/onboarding-queries";

// ============================================================================
// Get Detailed Onboarding Status
// ============================================================================

const getDetailedOnboardingStatusRequestSchema = z.object({});

export type GetDetailedOnboardingStatusRequest = z.infer<
  typeof getDetailedOnboardingStatusRequestSchema
>;

export type OnboardingPhase = 1 | 2 | 3 | 4;

export type OnboardingStatus = {
  phase: OnboardingPhase;
  progress: number;
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  phase4Complete: boolean;
};

export type GetDetailedOnboardingStatusResponse = {
  status: OnboardingStatus;
};

export type GetDetailedOnboardingStatusPromise = Promise<
  SerializedResult<GetDetailedOnboardingStatusResponse>
>;

const _getDetailedOnboardingStatus = createAction<
  GetDetailedOnboardingStatusRequest,
  GetDetailedOnboardingStatusResponse
>({
  name: "getDetailedOnboardingStatus",
  inputSchema: getDetailedOnboardingStatusRequestSchema,
  handler: async (_input, context) => {
    const result = await getDetailedOnboardingStatusForUser(context.supabase, context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      status: result.value,
    });
  },
});

export async function getDetailedOnboardingStatusAction(
  input: GetDetailedOnboardingStatusRequest = {},
): Promise<SerializedResult<GetDetailedOnboardingStatusResponse>> {
  const result = await _getDetailedOnboardingStatus(input);
  return serializeResult(result);
}
