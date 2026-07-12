import { safeLogger, sanitizeForLogging } from "@workspace/supabase-data/utils/safe-logger";
import type { AppError } from "./app-error";

/**
 * Observability context for error logging
 */
export type ErrorContext = {
  operation: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Log infrastructure errors with context
 *
 * This provides a central place for error observability.
 * Currently uses console logging, but can be extended to integrate with
 * monitoring services (Sentry, DataDog, etc.) without changing call sites.
 *
 * @param error - The AppError to log
 * @param context - Additional context about where/why the error occurred
 */
export function logInfraError(error: AppError, context: ErrorContext): void {
  // Only log infrastructure errors (not expected business errors)
  if (error.type !== "Infra") {
    return;
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      type: error.type,
      code: error.code,
      message: error.message,
      cause:
        error.cause instanceof Error
          ? {
              name: error.cause.name,
              message: error.cause.message,
              stack: error.cause.stack,
            }
          : error.cause,
      details: error.details,
    },
    context: {
      operation: context.operation,
      userId: context.userId,
      metadata: context.metadata,
    },
  };

  // Use console.error for now - can be replaced with observability platform
  safeLogger.error("[InfraError]", sanitizeForLogging(logEntry));

  // TODO: Future integrations:
  // - Sentry.captureException(error.cause, { contexts: { custom: logEntry } });
  // - DataDog logger
  // - Custom APM solution
}

/**
 * Log unexpected errors that were converted to AppError
 *
 * These are errors that weren't explicitly created as AppError.infra(),
 * meaning they're truly unexpected and should be investigated.
 */
export function logUnexpectedError(
  originalError: unknown,
  convertedError: AppError,
  context: ErrorContext,
): void {
  if (convertedError.type !== "Infra") {
    return;
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    unexpected: true,
    originalError:
      originalError instanceof Error
        ? {
            name: originalError.name,
            message: originalError.message,
            stack: originalError.stack,
          }
        : originalError,
    convertedError: {
      type: convertedError.type,
      code: convertedError.code,
      message: convertedError.message,
    },
    context,
  };

  safeLogger.error("[UnexpectedError]", sanitizeForLogging(logEntry));
}
