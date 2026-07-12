"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import {
  professionalStepSchema,
  type ProfessionalStepData,
} from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const saveProfessionalRequestSchema = professionalStepSchema;
const getProfessionalRequestSchema = z.object({}).strict();

export type SaveProfessionalRequest = ProfessionalStepData;
export type SaveProfessionalResponse = {
  success: true;
  completedStep: "professional";
};

export type GetProfessionalRequest = z.infer<typeof getProfessionalRequestSchema>;
export type GetProfessionalResponse = Partial<ProfessionalStepData>;

const _saveProfessional = createAction<SaveProfessionalRequest, SaveProfessionalResponse>({
  name: "onboarding.saveProfessionalStep",
  inputSchema: saveProfessionalRequestSchema,
  handler: async (input, context) => {
    const timestamp = new Date().toISOString();

    const { error: credentialsError } = await context.supabase
      .from("user_psychologists")
      .update({
        crp: input.crpNumber,
        crp_state: input.crpState,
        updated_at: timestamp,
      })
      .eq("id", context.userId);

    if (credentialsError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to update credentials",
          credentialsError,
        ),
      );
    }

    const { error: profileError } = await context.supabase.from("public_profiles").upsert({
      id: context.userId,
      crp: input.crpNumber,
      crp_state: input.crpState,
      updated_at: timestamp,
    });

    if (profileError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to update public professional data",
          profileError,
        ),
      );
    }

    const { error: completeError } = await context.supabase.rpc(
      "complete_onboarding_step" as never,
      {
        p_psychologist_id: context.userId,
        p_step: "professional",
      } as never,
    );

    if (completeError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to complete professional step",
          completeError,
        ),
      );
    }

    const { error: progressError } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "professional",
      nextStepId: "subscription",
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

    return ok({ success: true, completedStep: "professional" });
  },
});

export async function saveProfessionalStepAction(
  input: SaveProfessionalRequest,
): Promise<SerializedResult<SaveProfessionalResponse>> {
  return serializeResult(await _saveProfessional(input));
}

const _getProfessional = createAction<GetProfessionalRequest, GetProfessionalResponse>({
  name: "onboarding.getProfessionalStepData",
  inputSchema: getProfessionalRequestSchema,
  handler: async (_input, context) => {
    const [credentialsResult, profileResult] = await Promise.all([
      context.supabase
        .from("user_psychologists")
        .select("crp, crp_state")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("public_profiles")
        .select("specialties, therapeutic_approaches")
        .eq("id", context.userId)
        .maybeSingle(),
    ]);

    if (credentialsResult.error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch professional credentials",
          credentialsResult.error,
        ),
      );
    }

    if (profileResult.error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch professional profile",
          profileResult.error,
        ),
      );
    }

    return ok({
      crpNumber: credentialsResult.data?.crp ?? "",
      crpState: credentialsResult.data?.crp_state ?? "",
    });
  },
});

export async function getProfessionalStepDataAction(
  input: GetProfessionalRequest,
): Promise<SerializedResult<GetProfessionalResponse>> {
  return serializeResult(await _getProfessional(input));
}
