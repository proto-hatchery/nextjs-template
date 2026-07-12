import type { ActionContext } from "../../../lib/boundary/create-action";

type OnboardingStepRpcClient = Pick<ActionContext, "supabase">["supabase"];

type AdvanceOnboardingStepParams = {
  supabase: OnboardingStepRpcClient;
  userId: string;
  completedStepId: string;
  nextStepId: string;
  draftData?: Record<string, unknown>;
};

export async function advanceOnboardingStep({
  supabase,
  userId,
  completedStepId,
  nextStepId,
  draftData = {},
}: AdvanceOnboardingStepParams) {
  const { error: completedError } = await supabase.rpc(
    "update_onboarding_step" as never,
    {
      p_psychologist_id: userId,
      p_step_id: completedStepId,
      p_is_complete: true,
      p_draft_data: draftData,
    } as never,
  );

  if (completedError) {
    return { error: completedError };
  }

  const { error: nextError } = await supabase.rpc(
    "update_onboarding_step" as never,
    {
      p_psychologist_id: userId,
      p_step_id: nextStepId,
      p_is_complete: false,
      p_draft_data: {},
    } as never,
  );

  return { error: nextError };
}
