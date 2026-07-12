"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import type { ZodString } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

// Phone schema - imported inline to avoid ESM/CJS issues
const phoneSchema = z
  .string()
  .min(10, "Telefone deve ter pelo menos 10 dígitos")
  .max(15, "Telefone deve ter no máximo 15 dígitos")
  .regex(/^\+?[\d\s-()]+$/, "Formato de telefone inválido") as ZodString;

const sendPhoneVerificationOtpRequestSchema = z.object({
  phone: phoneSchema,
});

export type SendPhoneVerificationOtpRequest = z.infer<typeof sendPhoneVerificationOtpRequestSchema>;
export type SendPhoneVerificationOtpResponse = {
  success: true;
  message: string;
  phone: string;
};

const _sendPhoneVerificationOtp = createAction<
  SendPhoneVerificationOtpRequest,
  SendPhoneVerificationOtpResponse
>({
  name: "onboarding.sendPhoneVerificationOtp",
  inputSchema: sendPhoneVerificationOtpRequestSchema,
  handler: async (input, context) => {
    try {
      // Update user's phone number - this triggers Supabase Auth to send OTP
      // via the configured custom SMS hook (WhatsApp in our case)
      const { data, error } = await context.supabase.auth.updateUser({
        phone: input.phone,
      });

      if (error) {
        // Handle rate limiting
        if (error.status === 429) {
          return err(
            AppError.validation(
              AppErrorCode.VALIDATION_INVALID_FORMAT,
              "Aguarde 60 segundos antes de solicitar um novo código.",
              { status: error.status },
            ),
          );
        }

        return err(
          AppError.infra(
            AppErrorCode.INFRA_SUPABASE,
            error.message || "Failed to send verification code",
            { message: error.message },
          ),
        );
      }

      // Phone update initiated successfully
      // OTP has been sent via the custom SMS hook
      return ok({
        success: true,
        message: "Código de verificação enviado com sucesso!",
        phone: data.user?.phone || input.phone,
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

export async function sendPhoneVerificationOtpAction(
  input: SendPhoneVerificationOtpRequest,
): Promise<SerializedResult<SendPhoneVerificationOtpResponse>> {
  return serializeResult(await _sendPhoneVerificationOtp(input));
}
