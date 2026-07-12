/**
 * Action Error - Rich Client-Side Error for Expected Failures
 *
 * This error class represents expected domain/business failures from server actions.
 * It preserves the full structured error metadata for programmatic handling in UI.
 *
 * Key characteristics:
 * - Extends Error (works with React Query, error boundaries, etc.)
 * - Preserves original SerializableActionError
 * - Provides ergonomic accessors for common fields
 * - Supports field-level error extraction for forms
 */

import type { SerializableActionError } from "./action-result";

/**
 * Rich client-side error class for expected action failures.
 *
 * This is the thrown surface for expected domain failures (validation,
 * not found, conflict, etc.) from server actions. Unexpected failures
 * (serialization errors, network errors) throw plain Error or other
 * appropriate error types.
 */
export class ActionError extends Error {
  /** Machine-readable error code */
  readonly code: string;

  /** Field-level validation errors, if any */
  readonly fieldErrors: Record<string, string[]> | undefined;

  /** Whether the operation can be retried */
  readonly isRetryable: boolean;

  /** Additional context metadata */
  readonly meta: Record<string, unknown> | undefined;

  /** Original structured error from server */
  readonly originalError: SerializableActionError;

  constructor(error: SerializableActionError) {
    super(error.message);
    this.name = "ActionError";
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
    this.isRetryable = error.isRetryable ?? false;
    this.meta = error.meta;
    this.originalError = error;
  }

  /**
   * Check if this error has field-level validation errors.
   */
  hasFieldErrors(): boolean {
    return this.fieldErrors !== undefined && Object.keys(this.fieldErrors).length > 0;
  }

  /**
   * Get validation errors for a specific field.
   * Returns empty array if no errors for that field.
   */
  getFieldErrors(field: string): string[] {
    return this.fieldErrors?.[field] ?? [];
  }

  /**
   * Format all errors for display, including field errors.
   * Suitable for toast notifications or alert dialogs.
   */
  formatErrors(): string {
    const parts: string[] = [this.message];

    if (this.hasFieldErrors()) {
      for (const [field, errors] of Object.entries(this.fieldErrors!)) {
        parts.push(`${field}: ${errors.join(", ")}`);
      }
    }

    return parts.join("\n");
  }

  /**
   * Check if this error matches a specific error code.
   * Supports exact match or predicate function.
   */
  isCode(code: string): boolean;
  isCode(predicate: (code: string) => boolean): boolean;
  isCode(codeOrPredicate: string | ((code: string) => boolean)): boolean {
    if (typeof codeOrPredicate === "string") {
      return this.code === codeOrPredicate;
    }
    return codeOrPredicate(this.code);
  }
}

/**
 * Type guard to check if an error is an ActionError.
 */
export function isActionError(error: unknown): error is ActionError {
  return error instanceof ActionError;
}

/**
 * Extract a user-friendly error message from any error.
 *
 * This is a convenience helper for UI display. For richer handling,
 * use `isActionError()` and access specific properties.
 *
 * @param error - The error caught in a catch block
 * @param fallback - Fallback message if error cannot be parsed
 * @returns A string error message suitable for UI display
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isActionError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}

/**
 * Get a detailed error message suitable for debugging or detailed UI.
 * Includes field errors and other structured information.
 */
export function getDetailedErrorMessage(error: unknown): string {
  if (isActionError(error)) {
    return error.formatErrors();
  }

  if (error instanceof Error) {
    let message = error.message;
    if (error.cause instanceof Error) {
      message += `\nCaused by: ${error.cause.message}`;
    }
    return message;
  }

  return String(error);
}
