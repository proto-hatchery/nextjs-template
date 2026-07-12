"use client";

import { usePrivacyMode } from "./privacy-provider";

/**
 * Hook for conditionally masking sensitive values.
 * Returns the raw value when privacy mode is visible,
 * or a masked version when hidden.
 *
 * @param raw - The raw sensitive value
 * @param maskFn - Function to transform the value when hidden
 * @returns The visible or masked value
 *
 * @example
 * const maskedPhone = useSensitiveValue(patient.phone, maskPhone);
 * const maskedEmail = useSensitiveValue(patient.email, maskEmail);
 */
export function useSensitiveValue(
  raw: string | null | undefined,
  maskFn: (value: string) => string,
): string {
  const { isVisible } = usePrivacyMode();

  if (!raw) return "";
  if (isVisible) return raw;

  return maskFn(raw);
}

/**
 * Hook for conditionally showing/hiding content.
 * Returns the visible content when privacy mode is visible,
 * or the hidden content when hidden.
 *
 * @param visible - Content to show when privacy mode is visible
 * @param hidden - Content to show when privacy mode is hidden
 * @returns The appropriate content based on privacy mode
 *
 * @example
 * const nameDisplay = useSensitiveContent(
 *   patient.name,
 *   "Paciente oculto"
 * );
 */
export function useSensitiveContent<T>(visible: T, hidden: T): T {
  const { isVisible } = usePrivacyMode();
  return isVisible ? visible : hidden;
}
