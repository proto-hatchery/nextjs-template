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

const verifyPhoneOtpRequestSchema = z.object({
  phone: phoneSchema,
  token: z.string().length(6, "Código deve ter 6 dígitos"),
});

export type VerifyPhoneOtpRequest = z.infer<typeof verifyPhoneOtpRequestSchema>;
export type VerifyPhoneOtpResponse = {
  success: true;
  message: string;
  phone: string;
};

const _verifyPhoneOtp = createAction<VerifyPhoneOtpRequest, VerifyPhoneOtpResponse>({
  name: "onboarding.verifyPhoneOtp",
  inputSchema: verifyPhoneOtpRequestSchema,
  handler: async (input, context) => {
    try {
      // Verify the OTP for phone change
      // type: 'phone_change' is crucial - this is NOT a login flow
      const { data, error } = await context.supabase.auth.verifyOtp({
        phone: input.phone,
        token: input.token,
        type: "phone_change",
      });

      if (error) {
        // Handle specific OTP verification errors
        if (error.message.includes("expired") || error.message.includes("Expired")) {
          return err(
            AppError.validation(
              AppErrorCode.VALIDATION_OTP_EXPIRED,
              "Código expirado. Por favor, solicite um novo código.",
              { message: error.message },
            ),
          );
        }

        if (error.message.includes("invalid") || error.message.includes("Invalid")) {
          return err(
            AppError.validation(
              AppErrorCode.VALIDATION_OTP_INVALID,
              "Código inválido. Verifique e tente novamente.",
              { message: error.message },
            ),
          );
        }

        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message || "Failed to verify OTP", {
            message: error.message,
          }),
        );
      }

      // OTP verified successfully
      // Now update the user_psychologists table to mark phone as verified
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
            "Failed to update psychologist profile with verified phone",
            profileError,
          ),
        );
      }

      return ok({
        success: true,
        message: "Telefone verificado com sucesso!",
        phone: input.phone,
      });
    } catch (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to verify OTP code",
          error instanceof Error ? error : new Error("Unknown error"),
        ),
      );
    }
  },
});

export async function verifyPhoneOtpAction(
  input: VerifyPhoneOtpRequest,
): Promise<SerializedResult<VerifyPhoneOtpResponse>> {
  return serializeResult(await _verifyPhoneOtp(input));
}
