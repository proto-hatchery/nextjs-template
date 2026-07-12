"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { PsychologistSupabaseRepository } from "../../modules/psychologists/infrastructure/repositories/psychologist-supabase.repository";
import type { PsychologistOnboardingStateDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const getPsychologistOnboardingStateRequestSchema = z.object({}).strict();

export type GetPsychologistOnboardingStateRequest = Record<string, never>;
export type GetPsychologistOnboardingStateResponse = {
  onboardingState: PsychologistOnboardingStateDTO | null;
};

const _getPsychologistOnboardingState = createAction<
  GetPsychologistOnboardingStateRequest,
  GetPsychologistOnboardingStateResponse
>({
  name: "psychologists.getPsychologistOnboardingState",
  inputSchema: getPsychologistOnboardingStateRequestSchema,
  handler: async (_input, { userId, supabase }) => {
    const repo = new PsychologistSupabaseRepository(supabase);
    const result = await repo.findOnboardingState(userId);
    if (result.isErr()) return err(result.error);
    return ok({ onboardingState: result.value });
  },
});

export async function getPsychologistOnboardingStateAction(
  input: GetPsychologistOnboardingStateRequest = {},
): Promise<SerializedResult<GetPsychologistOnboardingStateResponse>> {
  const result = await _getPsychologistOnboardingState(input);
  return serializeResult(result);
}
