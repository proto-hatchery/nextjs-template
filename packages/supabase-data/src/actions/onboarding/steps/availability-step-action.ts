"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { AvailabilitySupabaseRepository } from "../../../modules/availability/infrastructure/repositories/availability-supabase.repository";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const saveAvailabilityRequestSchema = z.object({}).strict();
const getAvailabilityRequestSchema = z.object({}).strict();

export type SaveAvailabilityRequest = z.infer<typeof saveAvailabilityRequestSchema>;
export type SaveAvailabilityResponse = {
  success: true;
  completedStep: "availability";
};

export type GetAvailabilityRequest = z.infer<typeof getAvailabilityRequestSchema>;
export type GetAvailabilityResponse = {
  hasAvailability: boolean;
};

const _saveAvailability = createAction<SaveAvailabilityRequest, SaveAvailabilityResponse>({
  name: "onboarding.saveAvailabilityStep",
  inputSchema: saveAvailabilityRequestSchema,
  handler: async (_input, context) => {
    const repository = new AvailabilitySupabaseRepository(context.supabase);
    const result = await repository.getWeeklyConfig(context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    const hasAvailability = Object.values(result.value).some(
      (day) => day.isActive && day.intervals.length > 0,
    );
    if (!hasAvailability) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_INPUT,
          "Configure at least one availability interval before continuing",
        ),
      );
    }

    const { error: progressError } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "availability",
      nextStepId: "slug",
    });

    if (progressError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to advance onboarding step",
          progressError,
        ),
      );
    }

    return ok({ success: true, completedStep: "availability" });
  },
});

export async function saveAvailabilityStepAction(
  input: SaveAvailabilityRequest,
): Promise<SerializedResult<SaveAvailabilityResponse>> {
  return serializeResult(await _saveAvailability(input));
}

const _getAvailability = createAction<GetAvailabilityRequest, GetAvailabilityResponse>({
  name: "onboarding.getAvailabilityStepData",
  inputSchema: getAvailabilityRequestSchema,
  handler: async (_input, context) => {
    const repository = new AvailabilitySupabaseRepository(context.supabase);
    const result = await repository.getWeeklyConfig(context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    const hasAvailability = Object.values(result.value).some(
      (day) => day.isActive && day.intervals.length > 0,
    );
    return ok({ hasAvailability });
  },
});

export async function getAvailabilityStepDataAction(
  input: GetAvailabilityRequest,
): Promise<SerializedResult<GetAvailabilityResponse>> {
  return serializeResult(await _getAvailability(input));
}
