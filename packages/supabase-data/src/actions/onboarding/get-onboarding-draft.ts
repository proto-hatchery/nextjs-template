"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import type { OnboardingDraftData } from "../../types/entities";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getOnboardingDraftForUser } from "../../modules/onboarding/application/onboarding-queries";

const getOnboardingDraftRequestSchema = z.object({}).strict();

export type GetOnboardingDraftRequest = Record<string, never>;

export type GetOnboardingDraftResponse = {
  currentStep: number;
  draftData: OnboardingDraftData;
};

export type GetOnboardingDraftPromise = Promise<SerializedResult<GetOnboardingDraftResponse>>;

const _getOnboardingDraft = createAction<GetOnboardingDraftRequest, GetOnboardingDraftResponse>({
  name: "getOnboardingDraft",
  inputSchema: getOnboardingDraftRequestSchema,
  handler: async (_input, context) => {
    const result = await getOnboardingDraftForUser(context.supabase, context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      currentStep: result.value.currentStep,
      draftData: result.value.draftData as OnboardingDraftData,
    });
  },
});

export async function getOnboardingDraftAction(
  input: GetOnboardingDraftRequest,
): Promise<SerializedResult<GetOnboardingDraftResponse>> {
  const result = await _getOnboardingDraft(input);
  return serializeResult(result);
}
