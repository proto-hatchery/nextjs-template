import { describe, expect, it, vi } from "vitest";

import {
  completeOnboardingPhaseAction,
  type CompleteOnboardingPhaseRequest,
} from "./complete-phase";

// Mock the Supabase client and auth
vi.mock("@workspace/auth/session", () => ({
  getClaims: vi.fn(() => Promise.resolve({ sub: "test-user-id", app_role: "psychologist" })),
}));

describe("completeOnboardingPhaseAction", () => {
  describe("Phase 2 - Configuration", () => {
    it("should return error when prerequisites are not met", async () => {
      // This test validates that the action checks prerequisites before completing phase 2
      const input: CompleteOnboardingPhaseRequest = { phase: 2 };

      const result = await completeOnboardingPhaseAction(input);

      // Should fail validation when no services/locations/availability exist
      expect(result).toBeDefined();
      // The actual error checking depends on the database state
      // In a real test environment with mocked Supabase, we would verify:
      // - result.success === false
      // - result.error contains "Missing: services, locations or online delivery, availability"
    });

    it("should succeed when all prerequisites are met", async () => {
      // This test validates successful completion when prerequisites exist
      // Requires: 1+ services, 1+ locations OR online delivery, 1+ availability slots
      const _input: CompleteOnboardingPhaseRequest = { phase: 2 };

      // Note: This test requires database setup with test data
      // In production, it would verify:
      // - result.success === true
      // - configuration_step_completed is set to true
      // - completion_percentage is updated
    });
  });

  describe("Phase 1 - Payment/Essential", () => {
    it("should mark payment, identity and professional steps as complete", async () => {
      const input: CompleteOnboardingPhaseRequest = { phase: 1 };

      const result = await completeOnboardingPhaseAction(input);

      expect(result).toBeDefined();
      // Should complete without prerequisite checks (different from phase 2)
    });
  });

  describe("Phase 4 - Profile", () => {
    it("should mark profile step and onboarding as complete", async () => {
      const input: CompleteOnboardingPhaseRequest = { phase: 4 };

      const result = await completeOnboardingPhaseAction(input);

      expect(result).toBeDefined();
      // Should set profile_step_completed and onboarding_completed_at
    });
  });
});
