"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

const onboardingStepIdSchema = z.enum([
  "identity",
  "phone-verification",
  "professional",
  "subscription",
  "services",
  "locations",
  "availability",
  "slug",
  "links",
  "visual",
  "specialties",
  "education",
  "experience",
  "publish",
]);

export type OnboardingStepId = z.infer<typeof onboardingStepIdSchema>;

const getCurrentStepRequestSchema = z.object({}).strict();

const updateStepRequestSchema = z.object({
  stepId: onboardingStepIdSchema,
  isComplete: z.boolean().default(false),
  draftData: z.record(z.string(), z.unknown()).default({}),
});

const validateStepAccessRequestSchema = z.object({
  targetStepId: onboardingStepIdSchema,
});

export type GetCurrentStepRequest = z.infer<typeof getCurrentStepRequestSchema>;
export type GetCurrentStepResponse = {
  stepId: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  phase: number;
  isComplete: boolean;
};

export type UpdateStepRequest = z.infer<typeof updateStepRequestSchema>;
export type UpdateStepResponse = {
  stepId: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  updatedAt: string;
};

export type ValidateStepAccessRequest = z.infer<typeof validateStepAccessRequestSchema>;
export type ValidateStepAccessResponse = {
  allowed: boolean;
  redirectTo: string | null;
  reason: string | null;
};

const STEP_ROUTES: Record<OnboardingStepId, string> = {
  identity: "/onboarding/identity",
  "phone-verification": "/onboarding/phone-verification",
  professional: "/onboarding/professional",
  subscription: "/onboarding/subscription",
  services: "/onboarding/services",
  locations: "/onboarding/locations",
  availability: "/onboarding/availability",
  slug: "/onboarding/slug",
  links: "/onboarding/links",
  visual: "/onboarding/visual",
  specialties: "/onboarding/specialties",
  education: "/onboarding/education",
  experience: "/onboarding/experience",
  publish: "/onboarding/publish",
};

// phone-verification temporarily disabled
const STEP_PREREQUISITES: Partial<Record<OnboardingStepId, OnboardingStepId[]>> = {
  identity: [],
  professional: ["identity"],
  subscription: ["identity", "professional"],
  services: ["identity", "professional", "subscription"],
  locations: ["services"],
  availability: ["services", "locations"],
  slug: ["availability"],
  links: ["slug"],
  visual: ["links"],
  specialties: ["visual"],
  education: ["specialties"],
  experience: ["education"],
  publish: ["experience"],
};

// phone-verification temporarily disabled
const PHASE_1_STEPS: OnboardingStepId[] = [
  "identity",
  "professional",
  "subscription",
] as OnboardingStepId[];
const CONFIG_STEPS: OnboardingStepId[] = ["services", "locations", "availability"];
const PROFILE_STEPS: OnboardingStepId[] = [
  "slug",
  "links",
  "visual",
  "specialties",
  "education",
  "experience",
  "publish",
];
const ALL_STEPS_IN_ORDER: OnboardingStepId[] = [
  ...PHASE_1_STEPS,
  ...CONFIG_STEPS,
  ...PROFILE_STEPS,
];

function coerceCompletedSteps(value: unknown): OnboardingStepId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .filter((item): item is OnboardingStepId => onboardingStepIdSchema.safeParse(item).success);
}

function normalizeCompletedSteps(
  completedSteps: OnboardingStepId[],
  phase: number,
  isComplete: boolean,
): OnboardingStepId[] {
  const normalized = new Set<OnboardingStepId>(completedSteps);

  if (phase >= 2 || isComplete) {
    PHASE_1_STEPS.forEach((step) => normalized.add(step));
  }

  if (phase >= 3 || isComplete) {
    CONFIG_STEPS.forEach((step) => normalized.add(step));
  }

  if (isComplete) {
    PROFILE_STEPS.forEach((step) => normalized.add(step));
  }

  return ALL_STEPS_IN_ORDER.filter((step) => normalized.has(step));
}

function findFirstIncompleteStep(
  steps: OnboardingStepId[],
  completedSteps: OnboardingStepId[],
): OnboardingStepId | null {
  const completed = new Set(completedSteps);
  return steps.find((step) => !completed.has(step)) ?? null;
}

function normalizeCurrentStep(
  stepId: OnboardingStepId,
  phase: number,
  isComplete: boolean,
  completedSteps: OnboardingStepId[],
): OnboardingStepId {
  if (isComplete) {
    return "publish";
  }

  if (phase >= 3) {
    return findFirstIncompleteStep(PROFILE_STEPS, completedSteps) ?? "slug";
  }

  if (phase >= 2 && PHASE_1_STEPS.includes(stepId)) {
    return findFirstIncompleteStep(CONFIG_STEPS, completedSteps) ?? "services";
  }

  return stepId;
}

async function callGetCurrentStepRpc(supabase: unknown, userId: string) {
  return (
    supabase as { rpc: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }> }
  ).rpc(
    "get_current_onboarding_step" as never,
    {
      p_psychologist_id: userId,
    } as never,
  );
}

async function callUpdateStepRpc(supabase: unknown, userId: string, input: UpdateStepRequest) {
  return (
    supabase as { rpc: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }> }
  ).rpc(
    "update_onboarding_step" as never,
    {
      p_psychologist_id: userId,
      p_step_id: input.stepId,
      p_is_complete: input.isComplete,
      p_draft_data: input.draftData,
    } as never,
  );
}

const _getCurrentStep = createAction<GetCurrentStepRequest, GetCurrentStepResponse>({
  name: "onboarding.getCurrentStep",
  inputSchema: getCurrentStepRequestSchema,
  handler: async (_input, context) => {
    const { data, error } = await callGetCurrentStepRpc(context.supabase, context.userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to get current onboarding step", error),
      );
    }

    const result = (data ?? {}) as {
      step_id?: unknown;
      completed_steps?: unknown;
      phase?: unknown;
      is_complete?: unknown;
    };

    const rawStepId = onboardingStepIdSchema.safeParse(result.step_id).success
      ? (result.step_id as OnboardingStepId)
      : "identity";
    const phase = typeof result.phase === "number" ? result.phase : 1;
    const isComplete = result.is_complete === true;
    const completedSteps = normalizeCompletedSteps(
      coerceCompletedSteps(result.completed_steps),
      phase,
      isComplete,
    );
    const stepId = normalizeCurrentStep(rawStepId, phase, isComplete, completedSteps);

    return ok({
      stepId,
      completedSteps,
      phase,
      isComplete,
    });
  },
});

export async function getCurrentOnboardingStepAction(
  input: GetCurrentStepRequest,
): Promise<SerializedResult<GetCurrentStepResponse>> {
  return serializeResult(await _getCurrentStep(input));
}

const _updateStep = createAction<UpdateStepRequest, UpdateStepResponse>({
  name: "onboarding.updateStep",
  inputSchema: updateStepRequestSchema,
  handler: async (input, context) => {
    const { data, error } = await callUpdateStepRpc(context.supabase, context.userId, input);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update onboarding step", error),
      );
    }

    const result = (data ?? {}) as {
      step_id?: unknown;
      completed_steps?: unknown;
      updated_at?: unknown;
    };

    const stepId = onboardingStepIdSchema.safeParse(result.step_id).success
      ? (result.step_id as OnboardingStepId)
      : input.stepId;

    return ok({
      stepId,
      completedSteps: coerceCompletedSteps(result.completed_steps),
      updatedAt:
        typeof result.updated_at === "string" ? result.updated_at : new Date().toISOString(),
    });
  },
});

export async function updateOnboardingStepAction(
  input: UpdateStepRequest,
): Promise<SerializedResult<UpdateStepResponse>> {
  return serializeResult(await _updateStep(input));
}

const _validateStepAccess = createAction<ValidateStepAccessRequest, ValidateStepAccessResponse>({
  name: "onboarding.validateStepAccess",
  inputSchema: validateStepAccessRequestSchema,
  handler: async (input, context) => {
    const { data, error } = await callGetCurrentStepRpc(context.supabase, context.userId);

    if (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to validate onboarding step access",
          error,
        ),
      );
    }

    const currentStepResult = (data ?? {}) as {
      step_id?: unknown;
      completed_steps?: unknown;
      phase?: unknown;
      is_complete?: unknown;
    };
    const phase = typeof currentStepResult.phase === "number" ? currentStepResult.phase : 1;
    const isComplete = currentStepResult.is_complete === true;
    const completedSteps = new Set(
      normalizeCompletedSteps(
        coerceCompletedSteps(currentStepResult.completed_steps),
        phase,
        isComplete,
      ),
    );
    const prerequisites = STEP_PREREQUISITES[input.targetStepId] ?? [];
    const firstMissing = prerequisites.find((step) => !completedSteps.has(step));

    if (firstMissing) {
      return ok({
        allowed: false,
        redirectTo: STEP_ROUTES[firstMissing],
        reason: `Complete ${firstMissing} first`,
      });
    }

    return ok({
      allowed: true,
      redirectTo: null,
      reason: null,
    });
  },
});

export async function validateStepAccessAction(
  input: ValidateStepAccessRequest,
): Promise<SerializedResult<ValidateStepAccessResponse>> {
  return serializeResult(await _validateStepAccess(input));
}
