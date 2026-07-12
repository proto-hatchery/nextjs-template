"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import type { OnboardingDraftData } from "../../types/entities";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { saveOnboardingDraftForUser } from "../../modules/onboarding/application/onboarding-commands";

// ============================================================================
// Save Draft
// ============================================================================

const saveOnboardingDraftRequestSchema = z.object({
  step: z.number().int().min(1),
  data: z.record(z.string(), z.unknown()),
});

export type SaveOnboardingDraftRequest = {
  step: number;
  data: Partial<OnboardingDraftData>;
};

export type SaveOnboardingDraftResponse = { success: true };

export type SaveOnboardingDraftPromise = Promise<SerializedResult<SaveOnboardingDraftResponse>>;

const _saveOnboardingDraft = createAction<SaveOnboardingDraftRequest, SaveOnboardingDraftResponse>({
  name: "saveOnboardingDraft",
  inputSchema: saveOnboardingDraftRequestSchema,
  handler: async (input, context) => {
    const { step, data } = input;
    const result = await saveOnboardingDraftForUser(
      context.supabase,
      context.userId,
      step,
      data as Record<string, unknown>,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function saveOnboardingDraftAction(
  input: SaveOnboardingDraftRequest,
): Promise<SerializedResult<SaveOnboardingDraftResponse>> {
  const result = await _saveOnboardingDraft(input);
  return serializeResult(result);
}
