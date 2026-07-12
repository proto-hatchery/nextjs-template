import { describe, expect, it, vi } from "vitest";

import { advanceOnboardingStep } from "./advance-onboarding-step";

describe("advanceOnboardingStep", () => {
  it("completes the current step before moving the pointer", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null });

    await advanceOnboardingStep({
      supabase: { rpc } as unknown as Parameters<typeof advanceOnboardingStep>[0]["supabase"],
      userId: "user-123",
      completedStepId: "services",
      nextStepId: "locations",
      draftData: { foo: "bar" },
    });

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenNthCalledWith(1, "update_onboarding_step", {
      p_psychologist_id: "user-123",
      p_step_id: "services",
      p_is_complete: true,
      p_draft_data: { foo: "bar" },
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "update_onboarding_step", {
      p_psychologist_id: "user-123",
      p_step_id: "locations",
      p_is_complete: false,
      p_draft_data: {},
    });
  });

  it("stops when completing the current step fails", async () => {
    const rpcError = new Error("boom");
    const rpc = vi.fn().mockResolvedValueOnce({ error: rpcError });

    const result = await advanceOnboardingStep({
      supabase: { rpc } as unknown as Parameters<typeof advanceOnboardingStep>[0]["supabase"],
      userId: "user-123",
      completedStepId: "services",
      nextStepId: "locations",
    });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ error: rpcError });
  });
});
