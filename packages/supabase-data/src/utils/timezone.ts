import type { SupabaseClient } from "@supabase/supabase-js";
import { safeLogger } from "./safe-logger";

import type { Database } from "@workspace/supabase-infra/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export const DEFAULT_USER_TIMEZONE = "America/Sao_Paulo";

export function isValidIanaTimezone(timezone: string): boolean {
  if (!timezone || timezone.trim().length === 0) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone.trim() });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimezone(timezone?: string | null): string {
  if (!timezone) {
    return DEFAULT_USER_TIMEZONE;
  }

  const trimmed = timezone.trim();
  return isValidIanaTimezone(trimmed) ? trimmed : DEFAULT_USER_TIMEZONE;
}

export function getCurrentDateInTimezone(timezone?: string | null, now = new Date()): string {
  const normalizedTimezone = normalizeTimezone(timezone);
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: normalizedTimezone,
    year: "numeric",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export async function resolvePsychologistTimezone(
  supabase: TypedSupabaseClient,
  psychologistId: string,
  requestedTimezone?: string | null,
): Promise<string> {
  const requested = requestedTimezone?.trim();
  if (requested && isValidIanaTimezone(requested)) {
    return requested;
  }

  if (!psychologistId) {
    return DEFAULT_USER_TIMEZONE;
  }

  const { data, error } = await supabase
    .from("user_psychologists")
    .select("timezone")
    .eq("id", psychologistId)
    .maybeSingle();

  if (error) {
    safeLogger.error("[resolvePsychologistTimezone] Failed to load timezone:", error);
    return DEFAULT_USER_TIMEZONE;
  }

  return normalizeTimezone(data?.timezone);
}
