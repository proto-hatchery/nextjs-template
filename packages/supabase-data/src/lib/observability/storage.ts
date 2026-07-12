"use server";

import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client";
import type { Database } from "@workspace/supabase-infra/types/database";
import { safeLogger, sanitizeForLogging } from "@workspace/supabase-data/utils/safe-logger";
import type { Environment, UnifiedEvent } from "./types";

// Database type for unified_events insert
type UnifiedEventsInsert = Database["public"]["Tables"]["unified_events"]["Insert"];

/**
 * Persistence logic for unified events.
 */

const ENVIRONMENT = (process.env.NEXT_PUBLIC_ENVIRONMENT ||
  (process.env.NODE_ENV === "production"
    ? "prod"
    : process.env.NODE_ENV === "test"
      ? "local"
      : "dev")) as Environment;

const SERVICE = process.env.NEXT_PUBLIC_SERVICE_NAME || "supabase-lib";

/**
 * Check if we should persist events to the database.
 * In local/dev environments, we skip database persistence to avoid
 * errors when the unified_events table doesn't exist or Supabase is not running.
 * Events are still logged to console via safeLogger in action-logger.ts.
 */
function shouldPersistToDatabase(): boolean {
  // Only persist to database in staging and production environments
  return ENVIRONMENT === "stg" || ENVIRONMENT === "prod";
}

/**
 * Persists an event to the database with a console fallback.
 * In local/dev environments, this function is a no-op (events are logged to console
 * by the caller via safeLogger before calling this function).
 */
export async function emitEvent(
  event: Partial<UnifiedEvent> &
    Pick<
      UnifiedEvent,
      "event_family" | "event_name" | "operation" | "operation_type" | "outcome" | "component"
    >,
) {
  // Skip database persistence in local/dev environments
  if (!shouldPersistToDatabase()) {
    return;
  }

  const fullEvent: UnifiedEvent = {
    service: SERVICE,
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString(),
    actor_type: "system", // Default to system-level event
    ...event,
  } satisfies UnifiedEvent;

  try {
    const supabase = await createServerAuthClient();

    // Type-safe insert using generated Database types
    const { error } = await supabase
      .from("unified_events")
      .insert(fullEvent as unknown as UnifiedEventsInsert);

    if (error) {
      safeLogger.error("[Observability] Failed to insert event into database:", error);
      safeLogger.info("[Observability Fallback]", sanitizeForLogging(fullEvent));
    }
  } catch (err) {
    safeLogger.error("[Observability] Critical error during event emission:", err);
    safeLogger.info("[Observability Fallback]", sanitizeForLogging(fullEvent));
  }
}
