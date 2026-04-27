"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import {
  createAuthFormSchemas,
  type AuthFormValidationMessages,
} from "@workspace/supabase-auth/shared/auth-form-schemas"

export type { AuthFormValidationMessages } from "@workspace/supabase-auth/shared/auth-form-schemas"

export function useAuthFormSchemas() {
  const t = useTranslations("Auth")
  return useMemo(
    () =>
      createAuthFormSchemas((key) =>
        t(
          `validation.${key}` as
            | "validation.emailRequired"
            | "validation.emailInvalid"
            | "validation.passwordMin"
            | "validation.confirmPasswordRequired"
            | "validation.passwordsMatch"
            | "validation.mfaCodeFormat"
        )
      ),
    [t]
  )
}
