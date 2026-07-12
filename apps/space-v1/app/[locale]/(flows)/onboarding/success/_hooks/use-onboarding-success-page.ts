import { useEffect, useState } from "react";

import { useCheckoutProcessor } from "./use-checkout-processor";

const REDIRECT_DELAY_MS = 1000;
const HOME_PATH = "/home";

export function useOnboardingSuccessPage(sessionId: string | null) {
  const [displayError, setDisplayError] = useState<string | null>(null);

  const handleReady = () => {
    setTimeout(() => {
      window.location.href = HOME_PATH;
    }, REDIRECT_DELAY_MS);
  };

  const handleError = (message: string) => {
    setDisplayError(message);
  };

  const {
    status,
    error: processorError,
    startProcessing,
    isAuthenticated,
    isLoadingUser,
    redirectToLogin,
  } = useCheckoutProcessor(handleReady, handleError);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (sessionId) {
      void startProcessing(sessionId);
    }
  }, [isLoadingUser, isAuthenticated, sessionId, startProcessing, redirectToLogin]);

  return {
    status,
    error: displayError ?? processorError,
  };
}
