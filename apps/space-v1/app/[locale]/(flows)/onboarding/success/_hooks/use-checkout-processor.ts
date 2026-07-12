"use client";

import { useUser } from "@/app/_hooks/use-user";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CheckoutState, OnboardingSuccessStatus } from "../_types";

const POLLING_INTERVAL_MS = 500; // 500ms between checks
const MAX_POLLING_DURATION_MS = 3000; // 3 seconds max

interface UseCheckoutProcessorReturn extends CheckoutState {
  startProcessing: (sessionId: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  redirectToLogin: () => void;
}

async function checkSubscriptionStatus(
  supabase: ReturnType<typeof createBrowserAuthClient>,
  userId: string,
): Promise<boolean> {
  try {
    const { data: psychologist } = await supabase
      .from("user_psychologists")
      .select("subscription_status")
      .eq("id", userId)
      .maybeSingle();

    if (!psychologist) return false;

    const status = psychologist.subscription_status as string | null;
    return ["active", "trialing"].includes(status ?? "");
  } catch {
    return false;
  }
}

export function useCheckoutProcessor(
  onReady: () => void,
  onError: (message: string) => void,
): UseCheckoutProcessorReturn {
  const [status, setStatus] = useState<OnboardingSuccessStatus>("processing");
  const [error, setError] = useState<string | null>(null);

  const { data: userData, isPending: isLoadingUser } = useUser();
  const hasStarted = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAuthenticated = !!userData;

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const redirectToLogin = useCallback(() => {
    const currentUrl = window.location.href;
    window.location.href = `/login?next=${encodeURIComponent(currentUrl)}`;
  }, []);

  const refreshUserSession = useCallback(async (): Promise<void> => {
    try {
      const supabase = createBrowserAuthClient();
      await supabase.auth.refreshSession();
    } catch {
      // Silent fail - will sync on next request
    }
  }, []);

  const startProcessing = useCallback(
    async (_sessionId: string) => {
      if (hasStarted.current || !userData) return;
      hasStarted.current = true;

      const supabase = createBrowserAuthClient();
      const startTime = Date.now();

      try {
        setStatus("activating");

        // Immediate check
        if (await checkSubscriptionStatus(supabase, userData.id)) {
          await refreshUserSession();
          setStatus("ready");
          onReady();
          return;
        }

        // Fast polling for 3s max
        pollIntervalRef.current = setInterval(() => {
          void (async () => {
            const elapsed = Date.now() - startTime;

            if (await checkSubscriptionStatus(supabase, userData.id)) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              await refreshUserSession();
              setStatus("ready");
              onReady();
              return;
            }

            // After 3s: optimistic success
            if (elapsed >= MAX_POLLING_DURATION_MS) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              await refreshUserSession();
              setStatus("ready");
              onReady();
            }
          })();
        }, POLLING_INTERVAL_MS);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Processing error";
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [userData, onReady, onError, refreshUserSession],
  );

  return {
    status,
    error,
    startProcessing,
    isAuthenticated,
    isLoadingUser,
    redirectToLogin,
  };
}
