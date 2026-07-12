"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  OnboardingStepActions,
  OnboardingStepContainer,
  OnboardingStepForm,
  OnboardingStepHeader,
} from "@workspace/brand/onboarding";
import {
  type PhoneVerificationStepData,
  phoneVerificationStepSchema,
} from "@workspace/brand/onboarding/lib/schemas";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Phone } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { getV2InputProps } from "@workspace/forms/v2/rhf";
import { sendPhoneVerificationOtpAction } from "@workspace/supabase-data/actions/onboarding/send-phone-verification-otp";
import { savePhoneVerificationStepAction } from "@workspace/supabase-data/actions/onboarding/steps/phone-verification-step-action";
import { verifyPhoneOtpAction } from "@workspace/supabase-data/actions/onboarding/verify-phone-otp";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface PhoneVerificationPageClientProps {
  initialPhone?: string;
}

export default function PhoneVerificationPageClient({
  initialPhone,
}: PhoneVerificationPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const methods = useForm<PhoneVerificationStepData>({
    resolver: standardSchemaResolver(phoneVerificationStepSchema),
    defaultValues: {
      phone: initialPhone ?? "",
      otp: "",
    },
    mode: "onChange",
  });

  const {
    watch,
    formState: { isValid },
  } = methods;

  const phone = watch("phone");
  const otp = watch("otp");

  const handleSendOtp = () => {
    if (!phone || countdown > 0) return;

    setIsSendingOtp(true);
    startTransition(async () => {
      const result = await sendPhoneVerificationOtpAction({ phone });

      if (result.success) {
        toast.success("Código enviado com sucesso! Verifique seu WhatsApp.");
        setOtpSent(true);
        setCountdown(60); // 60 seconds cooldown per Supabase rate limits

        // Start countdown
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(result.error?.message || "Erro ao enviar código. Tente novamente.");
      }

      setIsSendingOtp(false);
    });
  };

  const handleVerifyOtp = () => {
    if (otp?.length !== 6) return;

    setIsVerifyingOtp(true);
    startTransition(async () => {
      const result = await verifyPhoneOtpAction({ phone, token: otp });

      if (result.success) {
        toast.success(result.data.message ?? "Telefone verificado com sucesso!");

        // Now save the verification step to advance onboarding
        const saveResult = await savePhoneVerificationStepAction({ phone, otp });

        if (saveResult.success) {
          router.push("/onboarding/professional");
        } else {
          toast.error("Erro ao salvar verificação. Tente novamente.");
        }
      } else {
        toast.error(result.error?.message || "Código inválido. Tente novamente.");
      }

      setIsVerifyingOtp(false);
    });
  };

  return (
    <OnboardingStepContainer>
      <OnboardingStepHeader
        title="Verificar telefone"
        description="Vamos confirmar seu número de celular enviando um código de verificação."
      />

      <OnboardingStepForm methods={methods} onSubmit={handleVerifyOtp}>
        <div className="space-y-4">
          <Controller
            control={methods.control}
            name="phone"
            render={({ field, fieldState }) => (
              <FluriFieldV2Phone
                field={getV2InputProps({
                  value: field.value,
                  onValueChange: (value) => {
                    const nextValue = typeof value === "string" ? value : "";
                    field.onChange(nextValue);
                  },
                  onBlur: field.onBlur,
                  name: field.name,
                  ref: field.ref,
                  error: fieldState.error,
                })}
                label="Celular / WhatsApp"
                helperText="Inclua DDD e número. Você receberá um código de confirmação."
                required
                fullWidth
                disabled={otpSent && !countdown} // Disable during verification process
              />
            )}
          />

          {/* Send OTP Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!phone || isSendingOtp || countdown > 0}
              className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2
                bg-primary text-primary-foreground hover:bg-primary/90
                focus:ring-primary"
            >
              {isSendingOtp ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </>
              ) : countdown > 0 ? (
                `Reenviar em ${countdown}s`
              ) : otpSent ? (
                "Reenviar código"
              ) : (
                "Enviar código"
              )}
            </button>
          </div>

          <Controller
            control={methods.control}
            name="otp"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FluriFieldV2Input
                  field={getV2InputProps({
                    value: field.value,
                    onValueChange: (value) => {
                      const nextValue = typeof value === "string" ? value : "";
                      field.onChange(nextValue);
                    },
                    onBlur: field.onBlur,
                    name: field.name,
                    ref: field.ref,
                    error: fieldState.error,
                  })}
                  label="Código de verificação"
                  placeholder="Digite o código de 6 dígitos"
                  helperText={
                    otpSent
                      ? "Digite o código que enviamos para seu WhatsApp."
                      : "Clique em 'Enviar código' para receber no seu WhatsApp."
                  }
                  required
                  fullWidth
                  maxLength={6}
                  disabled={!otpSent}
                />

                {/* Verify OTP Button */}
                {otpSent && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otp?.length !== 6 || isVerifyingOtp}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg
                      transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      bg-secondary text-secondary-foreground hover:bg-secondary/80
                      focus:ring-secondary"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Verificando...
                      </>
                    ) : (
                      "Verificar código"
                    )}
                  </button>
                )}
              </div>
            )}
          />
        </div>

        <OnboardingStepActions
          continueType="submit"
          continueLabel="Verificar e continuar"
          continuePendingLabel="Verificando..."
          isPending={isPending}
          continueDisabled={!isValid || !otpSent}
        />
      </OnboardingStepForm>
    </OnboardingStepContainer>
  );
}
