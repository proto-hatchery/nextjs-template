"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { GOOGLE_CALENDAR_ERROR_MESSAGES } from "../_domain/constants";

export function useGoogleCalendarConnectionFeedback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const googleConnected = searchParams.get("google_connected");
    const error = searchParams.get("error");

    if (googleConnected === "true") {
      toast.success("Google Calendar conectado com sucesso!");
      window.history.replaceState(
        {
          /* empty */
        },
        "",
        "/calendar",
      );
      return;
    }

    if (error) {
      toast.error(GOOGLE_CALENDAR_ERROR_MESSAGES[error] ?? "Erro ao conectar Google Calendar");
      window.history.replaceState(
        {
          /* empty */
        },
        "",
        "/calendar",
      );
    }
  }, [searchParams]);
}
