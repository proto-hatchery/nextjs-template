import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  DetailedOnboardingStatusDTO,
  OnboardingDraftStateDTO,
  OnboardingPhase,
  OnboardingPhaseDraftDTO,
  OnboardingProgressDTO,
} from "../../domain/dto/onboarding-state.dto";
import {
  DEFAULT_DETAILED_ONBOARDING_STATUS,
  DEFAULT_ONBOARDING_DRAFT_STATE,
  DEFAULT_ONBOARDING_PROGRESS,
} from "../../domain/dto/onboarding-state.dto";

type OnboardingStateRow = Database["public"]["Tables"]["psychologist_onboarding_state"]["Row"];
type OnboardingStatusV2Result =
  Database["public"]["Functions"]["get_onboarding_status_v2"]["Returns"];
type OnboardingSummaryRow = Database["public"]["Views"]["psychologist_onboarding_summary"]["Row"];

export function toOnboardingDraftStateDTO(
  row: Pick<OnboardingStateRow, "current_step_id" | "step_drafts"> | null,
): OnboardingDraftStateDTO {
  if (!row) {
    return { ...DEFAULT_ONBOARDING_DRAFT_STATE };
  }

  return {
    currentStep: row.current_step_id ? getStepNumber(row.current_step_id) : 1,
    draftData: ((row.step_drafts as Record<string, unknown> | null) ??
      {}) as OnboardingDraftStateDTO["draftData"],
  };
}

// Map step_id to step number
function getStepNumber(stepId: string): number {
  const stepMap: Record<string, number> = {
    identity: 1,
    professional: 2,
    subscription: 3,
    services: 4,
    locations: 5,
    availability: 6,
    slug: 7,
    links: 8,
    visual: 9,
    specialties: 10,
    education: 11,
    experience: 12,
    publish: 13,
  };
  return stepMap[stepId] ?? 1;
}

export function mergeOnboardingDraftData(
  current: Record<string, unknown> | null | undefined,
  next: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...(current ?? {}),
    ...next,
  };
}

export function mergePhaseDraftData(
  current: Record<string, unknown> | null | undefined,
  phase: OnboardingPhase,
  next: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...(current ?? {}),
    [`phase${phase}`]: next,
  };
}

export function toOnboardingPhaseDraftDTO(
  stepDrafts: Record<string, unknown> | null | undefined,
  phase: OnboardingPhase,
): OnboardingPhaseDraftDTO {
  if (!stepDrafts) {
    return { draftData: null };
  }

  // Map phase to step_ids
  const phaseSteps: Record<OnboardingPhase, string[]> = {
    1: ["identity", "professional", "subscription"],
    2: ["services", "locations", "availability"],
    3: ["slug", "links", "visual", "specialties", "education", "experience"],
    4: ["publish"],
  };

  const steps = phaseSteps[phase] ?? [];
  const phaseDraft: Record<string, unknown> = {};

  for (const step of steps) {
    if (stepDrafts[step]) {
      phaseDraft[step] = stepDrafts[step];
    }
  }

  return {
    draftData: Object.keys(phaseDraft).length > 0 ? phaseDraft : null,
  };
}

export function toOnboardingProgressDTO(
  results: OnboardingSummaryRow | OnboardingStatusV2Result | null,
): OnboardingProgressDTO {
  if (!results) {
    return { ...DEFAULT_ONBOARDING_PROGRESS };
  }

  // Handle both array and object results
  const result = Array.isArray(results) ? results[0] : results;

  if (!result) {
    return { ...DEFAULT_ONBOARDING_PROGRESS };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resultAny = result as any;

  // Check if this is from psychologist_onboarding_summary view (new SSOT approach)
  // The view has completion_percentage as a number field AND *_step_completed fields
  const isFromSummaryView =
    typeof result.completion_percentage === "number" && "payment_step_completed" in result;

  if (isFromSummaryView) {
    // Type narrow to OnboardingSummaryRow
    const viewResult = result as OnboardingSummaryRow;
    // Use the view's calculated values directly for single source of truth
    // View uses *_step_completed naming convention
    return {
      essentialComplete: viewResult.essential_complete ?? false,
      fullyComplete: viewResult.fully_complete ?? false,
      completionPercentage: viewResult.completion_percentage ?? 0,
      currentStep: viewResult.current_step ?? 1,
      totalSteps: viewResult.total_steps ?? 5,
      nextPendingStep: viewResult.next_pending_step ?? null,
      steps: {
        payment: viewResult.payment_step_completed ?? false,
        identity: viewResult.identity_step_completed ?? false,
        professional: viewResult.professional_step_completed ?? false,
        configuration: viewResult.configuration_step_completed ?? false,
        profile: viewResult.profile_step_completed ?? false,
      },
    };
  }

  // Legacy fallback: support completed_steps array format
  const completedSteps = (resultAny.completed_steps as string[]) ?? [];

  if (completedSteps.length > 0) {
    const isEssentialComplete =
      completedSteps.includes("identity") &&
      completedSteps.includes("professional") &&
      completedSteps.includes("subscription");

    const isFullyComplete = completedSteps.includes("publish");

    // Calculate percentage (13 total steps)
    const completionPercentage = Math.min(100, Math.round((completedSteps.length * 100) / 13));

    // Determine next pending step
    let nextPendingStep: string | null = null;
    if (!completedSteps.includes("identity")) nextPendingStep = "identity";
    else if (!completedSteps.includes("professional")) nextPendingStep = "professional";
    else if (!completedSteps.includes("subscription")) nextPendingStep = "subscription";
    else if (
      !completedSteps.includes("services") ||
      !completedSteps.includes("locations") ||
      !completedSteps.includes("availability")
    )
      nextPendingStep = "configuration";
    else if (!isFullyComplete) nextPendingStep = "profile";

    return {
      essentialComplete: isEssentialComplete,
      fullyComplete: isFullyComplete,
      completionPercentage,
      currentStep: getStepNumber((resultAny.current_step_id as string) ?? "identity"),
      totalSteps: 13,
      nextPendingStep,
      steps: {
        payment: completedSteps.includes("subscription"),
        identity: completedSteps.includes("identity"),
        professional: completedSteps.includes("professional"),
        configuration:
          completedSteps.includes("services") &&
          completedSteps.includes("locations") &&
          completedSteps.includes("availability"),
        profile: isFullyComplete,
      },
    };
  }

  // Final fallback to boolean-based format (get_onboarding_status_v2 function)
  // Function uses *_completed naming convention (without _step)
  return {
    essentialComplete: result.essential_complete ?? false,
    fullyComplete: result.fully_complete ?? false,
    completionPercentage: result.completion_percentage ?? 0,
    currentStep: result.current_step ?? 1,
    totalSteps: result.total_steps ?? 5,
    nextPendingStep: result.next_pending_step ?? null,
    steps: {
      payment: (result as any).payment_completed ?? false,
      identity: (result as any).identity_completed ?? false,
      professional: (result as any).professional_completed ?? false,
      configuration: (result as any).configuration_completed ?? false,
      profile: (result as any).profile_completed ?? false,
    },
  };
}

export function toDetailedOnboardingStatusDTO(
  row: Pick<
    OnboardingStateRow,
    "completed_steps" | "current_step_id" | "onboarding_completed_at"
  > | null,
): DetailedOnboardingStatusDTO {
  if (!row) {
    return { ...DEFAULT_DETAILED_ONBOARDING_STATUS };
  }

  const completedSteps = (row.completed_steps as string[]) ?? [];

  const phase1Complete =
    completedSteps.includes("identity") &&
    completedSteps.includes("professional") &&
    completedSteps.includes("subscription");

  const phase2Complete =
    completedSteps.includes("services") &&
    completedSteps.includes("locations") &&
    completedSteps.includes("availability");

  const phase3Complete =
    completedSteps.includes("slug") &&
    completedSteps.includes("links") &&
    completedSteps.includes("visual") &&
    completedSteps.includes("specialties") &&
    completedSteps.includes("education") &&
    completedSteps.includes("experience");

  const phase4Complete = completedSteps.includes("publish");

  let phase: OnboardingPhase = 1;
  if (phase1Complete) phase = 2;
  if (phase2Complete) phase = 3;
  if (phase3Complete && phase4Complete) phase = 4;

  return {
    phase,
    progress: Math.min(100, (completedSteps.length * 100) / 13),
    phase1Complete,
    phase2Complete,
    phase3Complete,
    phase4Complete,
  };
}
