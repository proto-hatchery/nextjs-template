"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { autoSaveOnboardingPhaseDraftForUser } from "../../modules/onboarding/application/onboarding-commands";

// ============================================================================
// Auto-Save Onboarding Draft by Phase
// ============================================================================

const autoSaveOnboardingDraftRequestSchema = z
  .object({
    phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    draftData: z.record(z.string(), z.unknown()),
  })
  .strict();

export type AutoSaveOnboardingDraftRequest = z.infer<typeof autoSaveOnboardingDraftRequestSchema>;

export type AutoSaveOnboardingDraftResponse = {
  lastSavedAt: string;
};

export type AutoSaveOnboardingDraftPromise = Promise<
  SerializedResult<AutoSaveOnboardingDraftResponse>
>;

const _autoSaveOnboardingDraft = createAction<
  AutoSaveOnboardingDraftRequest,
  AutoSaveOnboardingDraftResponse
>({
  name: "autoSaveOnboardingDraft",
  inputSchema: autoSaveOnboardingDraftRequestSchema,
  handler: async (input, context) => {
    const { phase, draftData } = input;
    const result = await autoSaveOnboardingPhaseDraftForUser(
      context.supabase,
      context.userId,
      phase,
      draftData,
    );

    if (result.isErr()) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          result.error.message,
          result.error.type === "Infra" ? result.error.cause : undefined,
        ),
      );
    }

    return ok(result.value);
  },
});

export async function autoSaveOnboardingDraftAction(
  input: AutoSaveOnboardingDraftRequest,
): Promise<SerializedResult<AutoSaveOnboardingDraftResponse>> {
  const result = await _autoSaveOnboardingDraft(input);
  return serializeResult(result);
}
