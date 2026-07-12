/**
 * Unwrap Action - Client-Side Boundary for Server Action Results
 *
 * This module provides the client-side unwrapping logic for server action results.
 * It validates unknown payloads with Zod, then either returns typed data on success
 * or throws ActionError on expected failure.
 *
 * Unexpected failures (malformed payloads, boundary corruption) throw plain Error.
 */

import { z } from "zod";
import {
  type ActionResult,
  type ActionResultVoid,
  validateActionResult,
  validateActionResultVoid,
} from "./action-result";
import { ActionError } from "./action-error";

/**
 * Unwrap an action result with data payload.
 *
 * - Returns typed data on success
 * - Throws ActionError on expected failure
 * - Throws Error on boundary corruption (malformed payload)
 *
 * @param payload - Unknown payload from server action
 * @param dataSchema - Zod schema for validating the data payload
 * @returns The validated data
 * @throws ActionError on expected failure
 * @throws Error on unexpected failure / boundary corruption
 *
 * @example
 * ```typescript
 * const patient = unwrapActionResult(
 *   await getPatientAction({ patientId }),
 *   PatientSchema
 * );
 * ```
 */
export function unwrapActionResult<T>(payload: unknown, dataSchema: z.ZodType<T>): T {
  const result = validateActionResult(payload, dataSchema);

  if (!result.success) {
    throw new ActionError(result.error);
  }

  return result.data;
}

/**
 * Unwrap an action result without data payload (void operations).
 *
 * - Returns void on success
 * - Throws ActionError on expected failure
 * - Throws Error on boundary corruption (malformed payload)
 *
 * @param payload - Unknown payload from server action
 * @returns void
 * @throws ActionError on expected failure
 * @throws Error on unexpected failure / boundary corruption
 *
 * @example
 * ```typescript
 * unwrapActionResultVoid(await deletePatientAction({ patientId }));
 * ```
 */
export function unwrapActionResultVoid(payload: unknown): void {
  const result = validateActionResultVoid(payload);

  if (!result.success) {
    throw new ActionError(result.error);
  }

  // Success with void - nothing to return
}

/**
 * Unwrap an action result, returning the full result object instead of throwing.
 *
 * Use this when you need to handle both success and failure cases without
 * exception handling, or when integrating with code that expects Result-like
 * behavior.
 *
 * @param payload - Unknown payload from server action
 * @param dataSchema - Zod schema for validating the data payload
 * @returns The validated ActionResult
 * @throws Error on boundary corruption (malformed payload)
 *
 * @example
 * ```typescript
 * const result = unwrapActionResultSafe(
 *   await getPatientAction({ patientId }),
 *   PatientSchema
 * );
 *
 * if (result.success) {
 *   // result.data is Patient
 * } else {
 *   // result.error is SerializableActionError
 * }
 * ```
 */
export function unwrapActionResultSafe<T>(
  payload: unknown,
  dataSchema: z.ZodType<T>,
): ActionResult<T> {
  return validateActionResult(payload, dataSchema);
}

/**
 * Unwrap a void action result, returning the full result object instead of throwing.
 *
 * @param payload - Unknown payload from server action
 * @returns The validated ActionResultVoid
 * @throws Error on boundary corruption (malformed payload)
 */
export function unwrapActionResultVoidSafe(payload: unknown): ActionResultVoid {
  return validateActionResultVoid(payload);
}
