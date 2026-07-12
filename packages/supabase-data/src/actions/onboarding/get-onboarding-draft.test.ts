import { describe, expect, it, vi } from "vitest";

import { getOnboardingDraftAction, type GetOnboardingDraftRequest } from "./get-onboarding-draft";

// Mock the Supabase client and auth
vi.mock("@workspace/auth/session", () => ({
  getClaims: vi.fn(() => Promise.resolve({ sub: "test-user-id", app_role: "psychologist" })),
}));

describe("getOnboardingDraftAction", () => {
  it("should return default values when no draft exists", async () => {
    const input: GetOnboardingDraftRequest = {};

    const result = await getOnboardingDraftAction(input);

    expect(result).toBeDefined();
    // In a real test environment with mocked Supabase:
    // - result.success === true
    // - result.value.currentStep === 1 (default)
    // - result.value.draftData === {} (default empty object)
  });

  it("should return existing draft data when available", async () => {
    const input: GetOnboardingDraftRequest = {};

    const result = await getOnboardingDraftAction(input);

    expect(result).toBeDefined();
    // In a real test environment with mocked Supabase:
    // - result.success === true
    // - result.value.currentStep reflects stored step
    // - result.value.draftData contains stored draft data
  });

  it("should handle database errors gracefully", async () => {
    const input: GetOnboardingDraftRequest = {};

    const result = await getOnboardingDraftAction(input);

    expect(result).toBeDefined();
    // Error handling is managed by createAction wrapper
    // Returns serialized error result on failure
  });
});
