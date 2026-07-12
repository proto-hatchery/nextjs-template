import type { AppError } from "../errors/app-error";

/**
 * Serialized result from a server action.
 * This matches the shape returned by serializeResult in server actions.
 */
export interface SerializedActionResult<T> {
  success: boolean;
  data?: T;
  error?: AppError | { message: string } | string | null;
}

/**
 * Unwraps a serialized action result, throwing an error if the action failed.
 * Use this in mutation hooks to standardize error handling.
 *
 * @param result - The serialized result from a server action
 * @returns The data from the result
 * @throws Error if the result indicates failure
 *
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   mutationFn: async (input) => unwrapActionResult(await myAction(input)),
 *   onSuccess: (data) => { /* data is typed correctly *\/ },
 * });
 * ```
 */
export function unwrapActionResult<T>(result: SerializedActionResult<T>): T {
  if (!result.success) {
    const errorMessage =
      typeof result.error === "string"
        ? result.error
        : (result.error?.message ?? "Unknown error occurred");
    throw new Error(errorMessage);
  }

  if (result.data === undefined) {
    throw new Error("Unexpected empty action response");
  }

  return result.data;
}

/**
 * Unwraps a serialized action result for void operations.
 * Use this when the action doesn't return meaningful data (e.g., delete operations).
 *
 * @param result - The serialized result from a server action
 * @throws Error if the result indicates failure
 *
 * @example
 * ```typescript
 * const deleteMutation = useMutation({
 *   mutationFn: async (id) => {
 *     unwrapActionResultVoid(await deleteAction({ id }));
 *   },
 *   onSuccess: () => { /* deletion succeeded *\/ },
 * });
 * ```
 */
export function unwrapActionResultVoid(result: SerializedActionResult<void | unknown>): void {
  if (!result.success) {
    const errorMessage =
      typeof result.error === "string"
        ? result.error
        : (result.error?.message ?? "Unknown error occurred");
    throw new Error(errorMessage);
  }
}

/**
 * Extracts a user-friendly error message from an unknown error.
 * Use this in catch blocks to get consistent error messages.
 *
 * @param error - The error caught in a catch block
 * @param fallback - Fallback message if error cannot be parsed
 * @returns A string error message
 *
 * @example
 * ```typescript
 * try {
 *   await mutation.mutateAsync(data);
 * } catch (error) {
 *   toast.error(getErrorMessage(error, "Operation failed"));
 * }
 * ```
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
