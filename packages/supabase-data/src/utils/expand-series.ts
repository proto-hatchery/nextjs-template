import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import { getCurrentDateInTimezone } from "./timezone";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function expandSeries(
  supabase: TypedSupabaseClient,
  seriesId: string,
  options?: { monthsAhead?: number; fromDate?: string; timezone?: string },
): Promise<void> {
  const monthsAhead = options?.monthsAhead ?? 6;
  const fromDate = options?.fromDate ?? getCurrentDateInTimezone(options?.timezone);
  const payload = {
    series_id: seriesId,
    months_ahead: monthsAhead,
    from_date: fromDate,
  };

  if (typeof window !== "undefined") {
    const response = await fetch("/api/calendar/expand-series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesId,
        monthsAhead,
        fromDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || errorData?.message || `Error ${response.status}`;
      throw new Error(errorMessage);
    }

    await response.json();
    return;
  }

  const { data, error } = await supabase.functions.invoke("expand-series", {
    body: payload,
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const errorDetails = await error.context.json();
        throw new Error(
          `Failed to expand series: ${errorDetails.error || errorDetails.code || "Unknown error"}`,
        );
      } catch {
        throw new Error(
          `Failed to expand series: ${error.message} (Status: ${error.context.status})`,
        );
      }
    }

    const errorMsg = error.message || JSON.stringify(error);
    throw new Error(`Failed to expand series: ${errorMsg}`);
  }

  void data;
}
