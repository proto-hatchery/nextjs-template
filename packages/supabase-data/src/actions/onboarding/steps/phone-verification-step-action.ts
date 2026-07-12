"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import {
  phoneVerificationStepSchema,
  type PhoneVerificationStepData,
} from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const savePhoneVerificationRequestSchema = phoneVerificationStepSchema;
const getPhoneVerificationRequestSchema = z.object({}).strict();

export type SavePhoneVerificationRequest = PhoneVerificationStepData;
export type SavePhoneVerificationResponse = {
  success: true;
  completedStep: "phone-verification";
};

export type GetPhoneVerificationRequest = z.infer<typeof getPhoneVerificationRequestSchema>;
export type GetPhoneVerificationResponse = Partial<PhoneVerificationStepData>;

const _savePhoneVerification = createAction<
  SavePhoneVerificationRequest,
  SavePhoneVerificationResponse
>({
  name: "onboarding.savePhoneVerificationStep",
  inputSchema: savePhoneVerificationRequestSchema,
  handler: async (input, context) => {
    // TODO: Verify OTP with Supabase Auth / Edge Function
    // For now, we'll just save the phone number
    const timestamp = new Date().toISOString();

    const { error: profileError } = await context.supabase
      .from("user_psychologists")
      .update({
        phone: input.phone,
        phone_verified_at: timestamp,
        updated_at: timestamp,
      })
      .eq("id", context.userId);

    if (profileError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to update psychologist phone",
          profileError,
        ),
      );
    }

    const { error: completeError } = await context.supabase.rpc(
      "complete_onboarding_step" as never,
      {
        p_psychologist_id: context.userId,
        p_step: "phone-verification",
      } as never,
    );

    if (completeError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to complete phone verification step",
          completeError,
        ),
      );
    }

    const { error: progressError } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "phone-verification",
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

    return ok({ success: true, completedStep: "phone-verification" });
  },
});

export async function savePhoneVerificationStepAction(
  input: SavePhoneVerificationRequest,
): Promise<SerializedResult<SavePhoneVerificationResponse>> {
  return serializeResult(await _savePhoneVerification(input));
}

const _getPhoneVerification = createAction<
  GetPhoneVerificationRequest,
  GetPhoneVerificationResponse
>({
  name: "onboarding.getPhoneVerificationStepData",
  inputSchema: getPhoneVerificationRequestSchema,
  handler: async (_input, context) => {
    const phoneResult = await context.supabase
      .from("user_psychologists")
      .select("phone")
      .eq("id", context.userId)
      .maybeSingle();

    if (phoneResult.error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch phone data",
          phoneResult.error,
        ),
      );
    }

    return ok({
      phone: phoneResult.data?.phone ?? "",
      otp: "",
    });
  },
});

export async function getPhoneVerificationStepDataAction(
  input: GetPhoneVerificationRequest,
): Promise<SerializedResult<GetPhoneVerificationResponse>> {
  return serializeResult(await _getPhoneVerification(input));
}
