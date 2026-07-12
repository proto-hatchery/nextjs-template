"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import {
  identityStepSchema,
  type IdentityStepData,
} from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { buildPsychologistFullName } from "../../../modules/psychologists/domain/utils/psychologist-name";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const saveIdentityRequestSchema = identityStepSchema;
const getIdentityRequestSchema = z.object({}).strict();

export type SaveIdentityRequest = IdentityStepData;
export type SaveIdentityResponse = {
  success: true;
  completedStep: "identity";
};

export type GetIdentityRequest = z.infer<typeof getIdentityRequestSchema>;
export type GetIdentityResponse = Partial<IdentityStepData>;

const _saveIdentity = createAction<SaveIdentityRequest, SaveIdentityResponse>({
  name: "onboarding.saveIdentityStep",
  inputSchema: saveIdentityRequestSchema,
  handler: async (input, context) => {
    const normalizedFirstName = input.firstName.trim();
    const normalizedLastName = input.lastName.trim();
    const normalizedFullName = buildPsychologistFullName(normalizedFirstName, normalizedLastName);
    const normalizedDisplayName = normalizedFirstName;
    const timestamp = new Date().toISOString();

    const { error: profileError } = await context.supabase
      .from("user_psychologists")
      .update({
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        full_name: normalizedFullName,
        display_name: normalizedDisplayName,
        updated_at: timestamp,
      })
      .eq("id", context.userId);

    if (profileError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to update psychologist profile",
          profileError,
        ),
      );
    }

    const { error: publicProfileError } = await context.supabase.from("public_profiles").upsert({
      id: context.userId,
      display_name: normalizedDisplayName,
      date_of_birth: input.birthDate,
      updated_at: timestamp,
    });

    if (publicProfileError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to update public profile",
          publicProfileError,
        ),
      );
    }

    const { error: completeError } = await context.supabase.rpc(
      "complete_onboarding_step" as never,
      {
        p_psychologist_id: context.userId,
        p_step: "identity",
      } as never,
    );

    if (completeError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to complete identity step",
          completeError,
        ),
      );
    }

    const { error: progressError } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "identity",
      nextStepId: "professional",
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

    return ok({ success: true, completedStep: "identity" });
  },
});

export async function saveIdentityStepAction(
  input: SaveIdentityRequest,
): Promise<SerializedResult<SaveIdentityResponse>> {
  return serializeResult(await _saveIdentity(input));
}

const _getIdentity = createAction<GetIdentityRequest, GetIdentityResponse>({
  name: "onboarding.getIdentityStepData",
  inputSchema: getIdentityRequestSchema,
  handler: async (_input, context) => {
    const [identityResult, publicProfileResult] = await Promise.all([
      context.supabase
        .from("user_psychologists")
        .select("first_name, last_name, display_name")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("public_profiles")
        .select("date_of_birth")
        .eq("id", context.userId)
        .maybeSingle(),
    ]);

    if (identityResult.error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch identity data",
          identityResult.error,
        ),
      );
    }

    if (publicProfileResult.error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch public identity data",
          publicProfileResult.error,
        ),
      );
    }

    return ok({
      firstName: identityResult.data?.first_name ?? "",
      lastName: identityResult.data?.last_name ?? "",
      displayName: identityResult.data?.display_name ?? "",
      birthDate: publicProfileResult.data?.date_of_birth ?? "",
    });
  },
});

export async function getIdentityStepDataAction(
  input: GetIdentityRequest,
): Promise<SerializedResult<GetIdentityResponse>> {
  return serializeResult(await _getIdentity(input));
}
