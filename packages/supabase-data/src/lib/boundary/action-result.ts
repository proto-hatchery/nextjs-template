/**
 * Action Result - Canonical Transport Contract for Server Actions
 *
 * This module defines the discriminated union result type for server action
 * transport, along with Zod schemas for runtime validation at the client boundary.
 *
 * Architecture:
 * - Server-side: Use neverthrow Result<T, AppError> for internal logic
 * - Transport: Serialize to ActionResult<T> or ActionResultVoid for wire transfer
 * - Client-side: Validate with Zod, unwrap to typed data or throw ActionError
 *
 * Invalid states are unrepresentable:
 * - { success: true, error: ... } is impossible
 * - { success: false, data: ... } is impossible
 */

import { z } from "zod";

// =============================================================================
// Serializable Action Error Contract
// =============================================================================

/**
 * Zod schema for serializable action errors.
 * This is the wire format for expected failures from server actions.
 */
export const SerializableActionErrorSchema = z.object({
  /** Machine-readable error code for programmatic handling */
  code: z.string(),

  /** Human-readable error message for UI display */
  message: z.string(),

  /** Optional field-level validation errors for form display */
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),

  /** Whether the operation can be retried */
  isRetryable: z.boolean().optional(),

  /** Additional serializable context */
  meta: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Type for serializable action errors.
 * Inferred from Zod schema for single source of truth.
 */
export type SerializableActionError = z.infer<typeof SerializableActionErrorSchema>;

// =============================================================================
// Discriminated Union Result Types
// =============================================================================

/**
 * Success result with data payload.
 */
export type ActionSuccess<T> = {
  readonly success: true;
  readonly data: T;
};

/**
 * Success result without payload.
 */
export type ActionSuccessVoid = {
  readonly success: true;
};

/**
 * Failure result with structured error.
 */
export type ActionFailure = {
  readonly success: false;
  error: SerializableActionError;
};

/**
 * Action result type for operations with data payload.
 */
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

/**
 * Action result type for void operations.
 */
export type ActionResultVoid = ActionSuccessVoid | ActionFailure;

// =============================================================================
// Unknown Payload Validation
// =============================================================================

/**
 * Validates an unknown payload as an ActionResult with data.
 * Throws a hard error if the payload is malformed (boundary corruption).
 */
export function validateActionResult<T>(
  payload: unknown,
  dataSchema: z.ZodType<T>,
): ActionResult<T> {
  // Build a union schema for this specific data type
  const schema = z.union([
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      error: SerializableActionErrorSchema,
    }),
  ]);

  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new Error(`Boundary corruption: invalid action result payload. ${result.error.message}`);
  }

  return result.data;
}

/**
 * Validates an unknown payload as an ActionResultVoid.
 * Throws a hard error if the payload is malformed (boundary corruption).
 */
export function validateActionResultVoid(payload: unknown): ActionResultVoid {
  const schema = z.union([
    z.object({
      success: z.literal(true),
    }),
    z.object({
      success: z.literal(false),
      error: SerializableActionErrorSchema,
    }),
  ]);

  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new Error(`Boundary corruption: invalid action result payload. ${result.error.message}`);
  }

  return result.data;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard for ActionSuccess.
 */
export function isActionSuccess<T>(
  result: ActionResult<T> | ActionResultVoid,
): result is ActionSuccess<T> {
  return result.success === true && "data" in result;
}

/**
 * Type guard for ActionSuccessVoid.
 */
export function isActionSuccessVoid(result: ActionResultVoid): result is ActionSuccessVoid {
  return result.success === true && !("data" in result);
}

/**
 * Type guard for ActionFailure.
 */
export function isActionFailure<T>(
  result: ActionResult<T> | ActionResultVoid,
): result is ActionFailure {
  return result.success === false;
}
