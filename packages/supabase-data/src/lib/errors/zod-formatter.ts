import type { ZodError } from "zod";
import { AppError, AppErrorCode, toAppError } from "./app-error";

/**
 * Format Zod validation errors into consistent AppError format
 *
 * Zod errors contain detailed path and message information that should be
 * transformed into a user-friendly format without leaking internal structure.
 *
 * @param zodError - The ZodError from schema validation
 * @param customMessage - Optional custom message override
 * @returns ValidationError with formatted details
 *
 * @example
 * ```typescript
 * const schema = z.object({ email: z.string().email() });
 * const result = schema.safeParse(input);
 * if (!result.success) {
 *   return err(formatZodError(result.error));
 * }
 * ```
 */
export function formatZodError(zodError: ZodError, customMessage?: string): AppError {
  const issues = zodError.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

  // Create a user-friendly message
  const firstIssue = issues[0];
  const defaultMessage = firstIssue
    ? `${firstIssue.path}: ${firstIssue.message}`
    : "Validation failed";

  return AppError.validation(
    AppErrorCode.VALIDATION_INVALID_INPUT,
    customMessage || defaultMessage,
    {
      issues,
      issueCount: issues.length,
    },
  );
}

/**
 * Check if an error is a Zod error
 */
export function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as ZodError).issues)
  );
}

/**
 * Convert any error to AppError, with special handling for Zod errors
 * This is useful in boundary wrappers that need to handle both Zod and other errors
 */
export function toAppErrorWithZod(error: unknown): AppError {
  if (isZodError(error)) {
    return formatZodError(error);
  }

  // Delegate to the standard toAppError converter
  return toAppError(error);
}
