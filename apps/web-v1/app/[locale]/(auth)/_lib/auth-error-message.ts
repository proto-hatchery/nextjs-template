"use client"

import { useMessages, useTranslations } from "next-intl"
import { useCallback } from "react"

export type AuthErrorBundle = {
  unexpected: string
  supabaseErrors: Record<string, string>
}

/**
 * Pure helper for tests and non-React callers. Prefer `useAuthErrorTranslator` in components.
 */
export function translateAuthErrorFromBundle(message: string, bundle: AuthErrorBundle): string {
  const trimmed = message.trim()
  if (trimmed.length === 0) {
    return bundle.unexpected
  }

  const direct = bundle.supabaseErrors[trimmed]
  if (direct) {
    return direct
  }

  const lower = trimmed.toLowerCase()
  for (const [en, translated] of Object.entries(bundle.supabaseErrors)) {
    if (en.toLowerCase() === lower) {
      return translated
    }
  }

  return trimmed
}

export function useAuthErrorTranslator(): (message: string) => string {
  const t = useTranslations("Auth")
  const messages = useMessages()
  return useCallback(
    (message: string) => {
      const auth = messages.Auth as
        | {
            errors?: {
              supabaseErrors?: Record<string, string>
            }
          }
        | undefined
      const bundle: AuthErrorBundle = {
        unexpected: t("errors.unexpected"),
        supabaseErrors: auth?.errors?.supabaseErrors ?? {},
      }
      return translateAuthErrorFromBundle(message, bundle)
    },
    [messages, t]
  )
}
