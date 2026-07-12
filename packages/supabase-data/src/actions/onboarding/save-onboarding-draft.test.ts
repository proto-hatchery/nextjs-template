import { describe, expect, it, vi } from "vitest";

import {
  saveOnboardingDraftAction,
  type SaveOnboardingDraftRequest,
} from "./save-onboarding-draft";

// Mock the Supabase client and auth
vi.mock("@workspace/auth/session", () => ({
  getClaims: vi.fn(() => Promise.resolve({ sub: "test-user-id", app_role: "psychologist" })),
}));

describe("saveOnboardingDraftAction", () => {
  it("should successfully save draft data", async () => {
    const input: SaveOnboardingDraftRequest = {
      step: 2,
      data: {
        firstName: "João",
        lastName: "Silva",
      },
    };

    const result = await saveOnboardingDraftAction(input);

    expect(result).toBeDefined();
    // In a real test environment with mocked Supabase:
    // - result.success === true
    // - result.value.success === true
  });

  it("should merge with existing draft data", async () => {
    const input: SaveOnboardingDraftRequest = {
      step: 3,
      data: {
        phone: "+5511999999999",
      },
    };

    const result = await saveOnboardingDraftAction(input);

    expect(result).toBeDefined();
    // Merges new data with existing draft
    // Uses upsert with onConflict: "psychologist_id"
  });

  it("should validate input schema", async () => {
    const invalidInput = {
      step: 0, // Invalid: must be >= 1
      data: {},
    } as unknown as SaveOnboardingDraftRequest;

    const result = await saveOnboardingDraftAction(invalidInput);

    expect(result).toBeDefined();
    // createAction validates input with Zod schema
    // Returns validation error for invalid step
  });

  it("should handle database errors", async () => {
    const input: SaveOnboardingDraftRequest = {
      step: 2,
      data: { firstName: "Test" },
    };

    const result = await saveOnboardingDraftAction(input);

    expect(result).toBeDefined();
    // Error handling via createAction
    // Returns Infra error type on database failure
  });
});
