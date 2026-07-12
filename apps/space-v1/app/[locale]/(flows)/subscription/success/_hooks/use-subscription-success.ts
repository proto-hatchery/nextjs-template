import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import { GENERIC_ERROR_MESSAGE_USER } from "@workspace/ui/lib/errors";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REDIRECT_DELAY_MS = 3000;

export function useSubscriptionSuccess() {
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      try {
        const supabase = createBrowserAuthClient();
        const { error } = await supabase.auth.refreshSession();

        if (error) {
          throw error;
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? GENERIC_ERROR_MESSAGE_USER : "Erro inesperado");
        }
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    void refresh();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isRefreshing || error) {
      return;
    }

    const timer = setTimeout(() => {
      router.push("/home");
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [error, isRefreshing, router]);

  return {
    error,
    isRefreshing,
  };
}
