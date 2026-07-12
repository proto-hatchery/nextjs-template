/**
 * Serialize Result - Server-Side Result Serialization
 *
 * This module provides serialization from neverthrow Result to the transport
 * contract (ActionResult) for server actions.
 *
 * Server actions use neverthrow internally, then serialize to the wire format
 * using these functions.
 */

import { ok, err, type Result } from "neverthrow";
import type { AppError } from "../errors/app-error";
import type { ActionResult, ActionResultVoid, SerializableActionError } from "./action-result";

/**
 * Convert an AppError to a SerializableActionError.
 *
 * This flattens the rich AppError discriminated union into a serializable
 * format for transport to the client.
 */
function appErrorToSerializable(error: AppError): SerializableActionError {
  // Extract field errors from ValidationError details if present
  const fieldErrors =
    error.type === "Validation" && error.details?.fieldErrors
      ? (error.details.fieldErrors as Record<string, string[]>)
      : undefined;

  return {
    code: error.code,
    message: error.message,
    ...(fieldErrors !== undefined ? { fieldErrors } : {}),
    // Retryable for infrastructure errors
    ...(error.type === "Infra" ? { isRetryable: true } : {}),
    // Include type for debugging (stripped in production if needed)
    meta: { type: error.type },
  };
}

/**
 * Serialize a neverthrow Result to an ActionResult for transport.
 *
 * @param result - neverthrow Result from internal logic
 * @returns ActionResult for wire transport
 *
 * @example
 * ```typescript
 * const result = await someInternalOperation();
 * return serializeResult(result);
 * ```
 */
export function serializeResult<T>(result: Result<T, AppError>): ActionResult<T> {
  if (result.isOk()) {
    return {
      success: true,
      data: result.value,
    };
  } else {
    return {
      success: false,
      error: appErrorToSerializable(result.error),
    };
  }
}

/**
 * Serialize a neverthrow Result to an ActionResultVoid for void operations.
 *
 * Use this when the operation doesn't return data on success.
 *
 * @param result - neverthrow Result<void, AppError>
 * @returns ActionResultVoid for wire transport
 *
 * @example
 * ```typescript
 * const result = await deleteOperation();
 * return serializeResultVoid(result);
 * ```
 */
export function serializeResultVoid(result: Result<void, AppError>): ActionResultVoid {
  if (result.isOk()) {
    return {
      success: true,
    };
  } else {
    return {
      success: false,
      error: appErrorToSerializable(result.error),
    };
  }
}

/**
 * Type alias for serialized result promises.
 * Use this as the return type for server actions.
 */
export type SerializedResult<T> = ActionResult<T>;
export type SerializedResultVoid = ActionResultVoid;

/**
 * Type alias for server action return types.
 */
export type SerializedResultPromise<T> = Promise<ActionResult<T>>;
export type SerializedResultVoidPromise = Promise<ActionResultVoid>;

/**
 * Deserialize an ActionResult back to a neverthrow Result.
 *
 * WARNING: This is intended for server-side composition only, where one server
 * action calls another. Client code should use `unwrapActionResult` from
 * `./unwrap-action` instead, which provides proper validation and throws
 * ActionError on failure.
 *
 * @param serialized - The serialized ActionResult from a server action
 * @returns A neverthrow Result<T, AppError>
 *
 * @example
 * ```typescript
 * // Server-side composition only
 * const serialized = await anotherServerAction({ ... });
 * const result = deserializeResult(serialized);
 * if (result.isErr()) {
 *   // handle error
 * }
 * ```
 */
export function deserializeResult<T>(serialized: ActionResult<T>): Result<T, AppError> {
  if (serialized.success) {
    return ok(serialized.data);
  } else {
    // Reconstruct a minimal AppError from the serialized error
    // Note: This loses some type information; use only for server-side composition
    return err({
      type: "Infra",
      code: serialized.error.code,
      message: serialized.error.message,
    } as AppError);
  }
}
