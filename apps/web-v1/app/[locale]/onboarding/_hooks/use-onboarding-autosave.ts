"use client";

import { autoSaveOnboardingDraftAction } from "@workspace/supabase-data/actions/onboarding/auto-save-draft";
import type { OnboardingPhase } from "@workspace/supabase-data/actions/onboarding/get-detailed-status";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { type FieldValues } from "react-hook-form";
import { toast } from "sonner";

export type { OnboardingPhase };
export type DraftData = Record<string, unknown>;

/**
 * Hook for auto-saving onboarding form data with debounce
 * Integrates with React Hook Form's watch functionality
 *
 * Usage:
 * ```tsx
 * const { watch } = useForm<Phase2Data>();
 * useOnboardingAutosave({
 *   phase: 2,
 *   watch,
 *   debounceMs: 500,
 * });
 * ```
 */

interface UseOnboardingAutosaveOptions<T extends FieldValues> {
  /** Current onboarding phase (1-4) */
  phase: OnboardingPhase;
  /** React Hook Form's watch function */
  watch: (callback: (data: T) => void) => { unsubscribe: () => void };
  /** Debounce delay in milliseconds (default: 500) */
  debounceMs?: number;
  /** Whether to show toast notifications (default: false) */
  showToasts?: boolean;
}

export function useOnboardingAutosave<T extends FieldValues>({
  phase,
  watch,
  debounceMs = 500,
  showToasts = false,
}: UseOnboardingAutosaveOptions<T>) {
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  const saveDraft = useCallback(
    (data: DraftData) => {
      // Serialize data to compare
      const serialized = JSON.stringify(data);

      // Skip if data hasn't changed
      if (serialized === lastSavedDataRef.current) {
        return;
      }

      startTransition(async () => {
        const result = await autoSaveOnboardingDraftAction({
          phase,
          draftData: data,
        });
        const deserialized = result;

        if (deserialized.success) {
          lastSavedDataRef.current = serialized;
          if (showToasts) {
            toast.success("Progresso salvo", {
              duration: 1500,
              description: "Seu progresso foi salvo automaticamente.",
            });
          }
        } else if (showToasts) {
          toast.error("Erro ao salvar", {
            description: deserialized.error.message ?? "Não foi possível salvar seu progresso.",
          });
        }
      });
    },
    [phase, showToasts, startTransition],
  );

  useEffect(() => {
    // Set up watch subscription
    const subscription = watch((formData: T) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        if (formData && Object.keys(formData).length > 0) {
          void saveDraft(formData as DraftData);
        }
      }, debounceMs);
    });

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      subscription.unsubscribe();
    };
  }, [watch, saveDraft, debounceMs]);

  // Save on unmount (flush any pending changes)
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isSaving: isPending,
  };
}

/**
 * Alternative hook that works directly with form values
 * Use this when you need more control over when to save
 */
export function useOnboardingAutosaveWithValues<T extends FieldValues>(
  phase: OnboardingPhase,
  values: T,
  options: {
    debounceMs?: number;
    showToasts?: boolean;
    enabled?: boolean;
  } = {},
) {
  const { debounceMs = 500, showToasts = false, enabled = true } = options;
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");
  const previousValuesRef = useRef<T>(values);

  useEffect(() => {
    if (!enabled) return;

    // Skip if values haven't changed
    if (JSON.stringify(values) === JSON.stringify(previousValuesRef.current)) {
      return;
    }

    previousValuesRef.current = values;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      const serialized = JSON.stringify(values);

      // Skip if data hasn't changed from last saved
      if (serialized === lastSavedDataRef.current) {
        return;
      }

      startTransition(async () => {
        const result = await autoSaveOnboardingDraftAction({
          phase,
          draftData: values as DraftData,
        });
        const deserialized = result;

        if (deserialized.success) {
          lastSavedDataRef.current = serialized;
        } else if (showToasts) {
          toast.error("Erro ao salvar", {
            description: deserialized.error.message ?? "Não foi possível salvar.",
          });
        }
      });
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [values, phase, debounceMs, enabled, showToasts, startTransition]);

  return {
    isSaving: isPending,
  };
}
