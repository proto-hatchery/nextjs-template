"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getOnboardingPhaseDraftForUser } from "../../modules/onboarding/application/onboarding-queries";

// ============================================================================
// Get Onboarding Draft for Specific Phase
// ============================================================================

const getOnboardingPhaseDraftRequestSchema = z.object({
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export type GetOnboardingPhaseDraftRequest = z.infer<typeof getOnboardingPhaseDraftRequestSchema>;

export type GetOnboardingPhaseDraftResponse = {
  draftData: Record<string, unknown> | null;
};

export type GetOnboardingPhaseDraftPromise = Promise<
  SerializedResult<GetOnboardingPhaseDraftResponse>
>;

const _getOnboardingPhaseDraft = createAction<
  GetOnboardingPhaseDraftRequest,
  GetOnboardingPhaseDraftResponse
>({
  name: "getOnboardingPhaseDraft",
  inputSchema: getOnboardingPhaseDraftRequestSchema,
  handler: async (input, context) => {
    const { phase } = input;
    const result = await getOnboardingPhaseDraftForUser(context.supabase, context.userId, phase);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function getOnboardingPhaseDraftAction(
  input: GetOnboardingPhaseDraftRequest,
): Promise<SerializedResult<GetOnboardingPhaseDraftResponse>> {
  const result = await _getOnboardingPhaseDraft(input);
  return serializeResult(result);
}
