/**
 * AppError - Discriminated Union for Application Errors
 *
 * This is the standard error type for all business logic and boundary operations.
 * It replaces ad-hoc error throwing with explicit, type-safe error handling using neverthrow.
 *
 * Usage with neverthrow:
 * ```typescript
 * import { ok, err, Result } from 'neverthrow';
 * import { AppError } from './app-error';
 *
 * function divide(a: number, b: number): Result<number, AppError> {
 *   if (b === 0) {
 *     return err(AppError.validation('DIVISION_BY_ZERO', 'Cannot divide by zero'));
 *   }
 *   return ok(a / b);
 * }
 * ```
 */

/**
 * Standard error codes for consistent error handling across the application.
 * Codes follow the pattern: category.specific_error
 */
export const AppErrorCode = {
  // Validation errors (4xx equivalent)
  VALIDATION_INVALID_INPUT: "validation.invalid_input",
  VALIDATION_MISSING_FIELD: "validation.missing_field",
  VALIDATION_INVALID_FORMAT: "validation.invalid_format",
  VALIDATION_CONSTRAINT_VIOLATION: "validation.constraint_violation",
  VALIDATION_OTP_EXPIRED: "validation.otp_expired",
  VALIDATION_OTP_INVALID: "validation.otp_invalid",

  // Authentication errors (401 equivalent)
  AUTH_UNAUTHORIZED: "auth.unauthorized",
  AUTH_TOKEN_EXPIRED: "auth.token_expired",
  AUTH_TOKEN_INVALID: "auth.token_invalid",
  AUTH_SESSION_REQUIRED: "auth.session_required",
  AUTH_REFRESH_FAILED: "auth.refresh_failed",
  AUTH_LOGOUT_FAILED: "auth.logout_failed",

  // Authorization errors (403 equivalent)
  AUTH_FORBIDDEN: "auth.forbidden",
  AUTH_INSUFFICIENT_PERMISSIONS: "auth.insufficient_permissions",
  AUTH_RESOURCE_FORBIDDEN: "auth.resource_forbidden",

  // Not Found errors (404 equivalent)
  NOT_FOUND_RESOURCE: "not_found.resource",
  NOT_FOUND_USER: "not_found.user",
  NOT_FOUND_ENTITY: "not_found.entity",

  // Conflict errors (409 equivalent)
  CONFLICT_DUPLICATE: "conflict.duplicate",
  CONFLICT_VERSION_MISMATCH: "conflict.version_mismatch",
  CONFLICT_STATE_INVALID: "conflict.state_invalid",

  // Infrastructure errors (500 equivalent)
  INFRA_DATABASE: "infra.database",
  INFRA_SUPABASE: "infra.supabase",
  INFRA_STORAGE: "infra.storage",
  INFRA_NETWORK: "infra.network",
  INFRA_EXTERNAL_SERVICE: "infra.external_service",
  INFRA_UNKNOWN: "infra.unknown",

  // Onboarding errors
  ONBOARDING_COMPLETE_FAILED: "onboarding.complete_failed",
  ONBOARDING_STATUS_FETCH_FAILED: "onboarding.status_fetch_failed",

  // Finance errors
  FINANCES_FETCH_BILLINGS_FAILED: "finances.fetch_billings_failed",
  FINANCES_CREATE_ENTRY_FAILED: "finances.create_entry_failed",
  FINANCES_CREATE_CHARGE_FAILED: "finances.create_charge_failed",
  FINANCES_UPDATE_CHARGE_STATUS_FAILED: "finances.update_charge_status_failed",

  // Document errors
  DOCUMENTS_CREATE_FAILED: "documents.create_failed",
  DOCUMENTS_UPLOAD_FAILED: "documents.upload_failed",
  DOCUMENTS_DELETE_FAILED: "documents.delete_failed",
  NOT_FOUND_DOCUMENT: "not_found.document",

  // Patient errors
  NOT_FOUND_PATIENT: "not_found.patient",
} as const;

export type AppErrorCodeType = (typeof AppErrorCode)[keyof typeof AppErrorCode];

/**
 * Validation Error - User input or request validation failed
 * Maps to HTTP 400 Bad Request
 */
export type ValidationError = {
  readonly type: "Validation";
  readonly code: AppErrorCodeType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
};

/**
 * Authentication Error - User is not authenticated
 * Maps to HTTP 401 Unauthorized
 */
export type AuthError = {
  readonly type: "Auth";
  readonly code: AppErrorCodeType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
};

/**
 * Not Found Error - Requested resource does not exist
 * Maps to HTTP 404 Not Found
 */
export type NotFoundError = {
  readonly type: "NotFound";
  readonly code: AppErrorCodeType;
  readonly message: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
};

/**
 * Conflict Error - Request conflicts with current state
 * Maps to HTTP 409 Conflict
 */
export type ConflictError = {
  readonly type: "Conflict";
  readonly code: AppErrorCodeType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
};

/**
 * Infrastructure Error - System/external service failure
 * Maps to HTTP 500 Internal Server Error
 */
export type InfraError = {
  readonly type: "Infra";
  readonly code: AppErrorCodeType;
  readonly message: string;
  readonly cause?: unknown;
  readonly details?: Record<string, unknown>;
};

/**
 * AppError - Discriminated union of all application error types
 */
export type AppError = ValidationError | AuthError | NotFoundError | ConflictError | InfraError;

/**
 * Factory functions for creating AppError instances
 */
export const AppError = {
  validation: (
    code: AppErrorCodeType,
    message: string,
    details?: Record<string, unknown>,
  ): ValidationError => ({
    type: "Validation",
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  }),

  auth: (
    code: AppErrorCodeType,
    message: string,
    details?: Record<string, unknown>,
  ): AuthError => ({
    type: "Auth",
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  }),

  notFound: (
    code: AppErrorCodeType,
    message: string,
    resourceType?: string,
    resourceId?: string,
  ): NotFoundError => ({
    type: "NotFound",
    code,
    message,
    ...(resourceType !== undefined ? { resourceType } : {}),
    ...(resourceId !== undefined ? { resourceId } : {}),
  }),

  conflict: (
    code: AppErrorCodeType,
    message: string,
    details?: Record<string, unknown>,
  ): ConflictError => ({
    type: "Conflict",
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  }),

  infra: (
    code: AppErrorCodeType,
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ): InfraError => ({
    type: "Infra",
    code,
    message,
    ...(cause !== undefined ? { cause } : {}),
    ...(details !== undefined ? { details } : {}),
  }),
};

/**
 * Type guard to check if an unknown value is an AppError
 */
export function isAppError(value: unknown): value is AppError {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const error = value as Record<string, unknown>;

  return (
    typeof error.type === "string" &&
    ["Validation", "Auth", "NotFound", "Conflict", "Infra"].includes(error.type) &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  );
}

/**
 * Convert unknown error to AppError
 * This is the primary function for converting unexpected errors at boundaries
 */
export function toAppError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }

  // Error object
  if (error instanceof Error) {
    return AppError.infra(AppErrorCode.INFRA_UNKNOWN, error.message, error, { stack: error.stack });
  }

  // String error
  if (typeof error === "string") {
    return AppError.infra(AppErrorCode.INFRA_UNKNOWN, error);
  }

  // Unknown error type
  return AppError.infra(AppErrorCode.INFRA_UNKNOWN, "An unknown error occurred", error);
}

/**
 * Exhaustiveness check helper
 * Use in switch statements to ensure all AppError types are handled
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
