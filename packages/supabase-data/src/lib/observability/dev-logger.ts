/* eslint-disable no-console */
/**
 * Development/Preview logging utilities.
 *
 * Logs are shown in:
 * - Local development (NODE_ENV !== "production")
 * - Vercel Preview deployments (VERCEL_ENV === "preview")
 *
 * This allows QAs to see logs in preview environments for debugging.
 *
 * PRODUCTION: These loggers are no-ops (no console output).
 */

const SHOULD_LOG = process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

/**
 * Format a log entry as key=value pairs (human-readable)
 */
function formatLogEntry(level: string, prefix: string, message: string, data?: unknown): string {
  const fields: string[] = [
    `ts=${new Date().toISOString()}`,
    `level=${level}`,
    `component=${prefix}`,
    `msg="${message}"`,
  ];

  if (data !== undefined && data !== null) {
    if (data instanceof Error) {
      fields.push(`error="${data.message}"`);
    } else if (typeof data === "object") {
      fields.push(`data=${JSON.stringify(data)}`);
    } else {
      fields.push(`data=${String(data)}`);
    }
  }

  return fields.join(" ");
}

/**
 * Create a namespaced logger for a specific component.
 * Logs are only shown in dev and preview environments.
 *
 * @example
 * ```typescript
 * const logger = createDevLogger("CircuitBreaker");
 * logger.log("Circuit opened", { failureCount: 5 });
 * logger.error("Recovery failed", error);
 * ```
 */
export function createDevLogger(componentName: string) {
  return {
    log: (message: string, data?: unknown) => {
      if (!SHOULD_LOG) return;

      console.log(`[DEV] ${formatLogEntry("info", componentName, message, data)}`);
    },

    warn: (message: string, data?: unknown) => {
      if (!SHOULD_LOG) return;

      console.warn(`[DEV] ${formatLogEntry("warn", componentName, message, data)}`);
    },

    error: (message: string, error?: unknown) => {
      if (!SHOULD_LOG) return;

      console.error(`[DEV] ${formatLogEntry("error", componentName, message, error)}`);
    },
  };
}
