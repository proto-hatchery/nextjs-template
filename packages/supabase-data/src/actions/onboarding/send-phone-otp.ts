"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { phoneSchema } from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

const sendPhoneOtpRequestSchema = z.object({
  phone: phoneSchema,
});

export type SendPhoneOtpRequest = z.infer<typeof sendPhoneOtpRequestSchema>;
export type SendPhoneOtpResponse = {
  success: true;
  message: string;
};

const _sendPhoneOtp = createAction<SendPhoneOtpRequest, SendPhoneOtpResponse>({
  name: "onboarding.sendPhoneOtp",
  inputSchema: sendPhoneOtpRequestSchema,
  handler: async (input, context) => {
    try {
      // Call the messaging edge function to send OTP via WhatsApp
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/messaging`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "send-otp",
            payload: {
              phone: input.phone,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            `Failed to send OTP: ${response.status}`,
            errorData,
          ),
        );
      }

      return ok({
        success: true,
        message: "Código de verificação enviado com sucesso!",
      });
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to send OTP code",
          error instanceof Error ? error : new Error("Unknown error"),
        ),
      );
    }
  },
});

export async function sendPhoneOtpAction(
  input: SendPhoneOtpRequest,
): Promise<SerializedResult<SendPhoneOtpResponse>> {
  return serializeResult(await _sendPhoneOtp(input));
}
