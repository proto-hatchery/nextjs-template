import { safeLogger, sanitizeForLogging } from "@workspace/supabase-data/utils/safe-logger";
import type { ActionContext } from "../boundary/create-action";
import { OperationalEmitter } from "./emitters";
import type { Outcome } from "./types";

/**
 * Detect if we should log to console (dev or preview environments)
 * Preview deployments on Vercel should also show logs for QA testing
 */
const SHOULD_LOG_TO_CONSOLE =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

/**
 * Format log entry as key=value pairs (human-readable for dev/preview)
 * Example: ts=2024-02-21T14:30:00Z event=patient_created outcome=success user_id=abc123 duration_ms=150
 */
function formatKeyValueLog(params: {
  event: string;
  outcome: Outcome | "warning";
  userId?: string;
  duration_ms?: number;
  error?: unknown;
  metadata?: Record<string, unknown>;
}): string {
  const fields: string[] = [
    `ts=${new Date().toISOString()}`,
    `event=${params.event}`,
    `outcome=${params.outcome}`,
  ];

  if (params.userId) {
    fields.push(`user_id=${params.userId}`);
  }

  if (params.duration_ms !== undefined) {
    fields.push(`duration_ms=${params.duration_ms}`);
  }

  if (params.error) {
    const rawErrorMsg = params.error instanceof Error ? params.error.message : String(params.error);
    const sanitizedError = sanitizeForLogging(rawErrorMsg);
    const errorMsg = typeof sanitizedError === "string" ? sanitizedError : String(sanitizedError);
    fields.push(`error="${errorMsg.replace(/"/g, '"')}"`);
  }

  if (params.metadata && Object.keys(params.metadata).length > 0) {
    // Add metadata as compact key=value pairs
    const metaFields = Object.entries(params.metadata)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => {
        const sanitized = sanitizeForLogging(v);
        const strValue =
          typeof sanitized === "object" ? JSON.stringify(sanitized) : String(sanitized);
        return `${k}=${strValue}`;
      });
    if (metaFields.length > 0) {
      fields.push(...metaFields);
    }
  }

  return fields.join(" ");
}

/**
 * Log an action event.
 *
 * DEV/PREVIEW: Logs key=value format to console (easy to read, grep-friendly)
 * PRODUCTION: Emits to unified_events table (structured, queryable)
 *
 * SECURITY: Never exposes sensitive data to browser. Server-side only.
 *
 * @example
 * ```typescript
 * // Simple warning (won't fail the operation)
 * logActionEvent({
 *   event: "session_link_failed",
 *   outcome: "warning",
 *   context,
 *   error: linkError,
 * });
 *
 * // Success with metadata
 * logActionEvent({
 *   event: "patient_created",
 *   outcome: "success",
 *   context,
 *   duration_ms: 150,
 *   metadata: { patient_id: result.id },
 * });
 * ```
 */
export function logActionEvent(params: {
  /** Event name (e.g., "patient_created", "sync_failed") */
  event: string;
  /** Operation outcome */
  outcome: Outcome | "warning";
  /** Action context (userId, etc.) */
  context: ActionContext;
  /** Optional error details */
  error?: unknown;
  /** Duration in milliseconds */
  duration_ms?: number;
  /** Additional context data */
  metadata?: Record<string, unknown>;
}): void {
  const { event, outcome, error, metadata, context, duration_ms } = params;

  // DEV/PREVIEW: Human-readable key=value format
  if (SHOULD_LOG_TO_CONSOLE) {
    const logLine = formatKeyValueLog({
      event,
      outcome,
      userId: context.userId,
      ...(duration_ms !== undefined ? { duration_ms } : {}),
      ...(error !== undefined ? { error } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    });

    // Use appropriate console level based on outcome
    if (outcome === "error" || outcome === "failure") {
      safeLogger.error(`[ACTION] ${logLine}`);
    } else if (outcome === "warning") {
      safeLogger.warn(`[ACTION] ${logLine}`);
    } else {
      safeLogger.log(`[ACTION] ${logLine}`);
    }
  }

  // PRODUCTION: Emit to unified_events (fire-and-forget, never block)
  OperationalEmitter.log({
    event_name: event,
    component: "server-action",
    operation: event,
    operation_type: "business_logic",
    outcome: outcome === "warning" ? "failure" : outcome,
    actor_type: context.userId ? "authenticated" : "anonymous",
    ...(error ? { error_message: error instanceof Error ? error.message : String(error) } : {}),
    ...(duration_ms !== undefined ? { duration_ms } : {}),
    metadata: {
      user_id: context.userId,
      ...(metadata || {}),
    },
  }).catch(() => {
    // Silent fail - observability should never crash the app
  });
}

/**
 * Log a warning that shouldn't fail the operation.
 * Shortcut for logActionEvent with outcome="warning".
 *
 * @example
 * ```typescript
 * // Non-critical warning
 * logWarning({
 *   event: "metadata_sync_failed",
 *   context,
 *   error: syncError,
 * });
 * ```
 */
export function logWarning(params: {
  event: string;
  context: ActionContext;
  error?: unknown;
  metadata?: Record<string, unknown>;
}): void {
  logActionEvent({
    event: params.event,
    outcome: "warning",
    context: params.context,
    ...(params.error !== undefined ? { error: params.error } : {}),
    ...(params.metadata !== undefined ? { metadata: params.metadata } : {}),
  });
}

/**
 * Log a successful operation.
 * Shortcut for logActionEvent with outcome="success".
 *
 * @example
 * ```typescript
 * logSuccess({
 *   event: "patient_created",
 *   context,
 *   metadata: { patient_id: result.id },
 * });
 * ```
 */
export function logSuccess(params: {
  event: string;
  context: ActionContext;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}): void {
  logActionEvent({
    event: params.event,
    outcome: "success",
    context: params.context,
    ...(params.duration_ms !== undefined ? { duration_ms: params.duration_ms } : {}),
    ...(params.metadata !== undefined ? { metadata: params.metadata } : {}),
  });
}

/**
 * Log a failed operation.
 * Shortcut for logActionEvent with outcome="failure".
 *
 * @example
 * ```typescript
 * logFailure({
 *   event: "payment_failed",
 *   context,
 *   error: paymentError,
 *   metadata: { charge_id: chargeId },
 * });
 * ```
 */
export function logFailure(params: {
  event: string;
  context: ActionContext;
  error?: unknown;
  metadata?: Record<string, unknown>;
}): void {
  logActionEvent({
    event: params.event,
    outcome: "failure",
    context: params.context,
    ...(params.error !== undefined ? { error: params.error } : {}),
    ...(params.metadata !== undefined ? { metadata: params.metadata } : {}),
  });
}
