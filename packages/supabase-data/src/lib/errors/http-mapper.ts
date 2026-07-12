import type { AppError } from "./app-error";
import { assertNever } from "./app-error";

/**
 * HTTP Response for AppError mapping
 */
export type HttpErrorResponse = {
  status: number;
  body: {
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  };
};

/**
 * Map AppError to HTTP status code and response body
 * This ensures consistent error responses across all API endpoints
 *
 * @param error - The AppError to map
 * @returns HTTP status code and standardized error response body
 *
 * @example
 * ```typescript
 * const result = await someOperation();
 * if (result.isErr()) {
 *   const httpResponse = mapAppErrorToHttp(result.error);
 *   return NextResponse.json(httpResponse.body, { status: httpResponse.status });
 * }
 * ```
 */
export function mapAppErrorToHttp(error: AppError): HttpErrorResponse {
  switch (error.type) {
    case "Validation":
      return {
        status: 400,
        body: {
          error: {
            code: error.code,
            message: error.message,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        },
      };

    case "Auth": {
      // Distinguish between 401 (not authenticated) and 403 (not authorized)
      const isUnauthorized =
        error.code === "auth.unauthorized" ||
        error.code === "auth.token_expired" ||
        error.code === "auth.token_invalid" ||
        error.code === "auth.session_required";

      return {
        status: isUnauthorized ? 401 : 403,
        body: {
          error: {
            code: error.code,
            message: error.message,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        },
      };
    }

    case "NotFound":
      return {
        status: 404,
        body: {
          error: {
            code: error.code,
            message: error.message,
            details: {
              ...(error.resourceType !== undefined ? { resourceType: error.resourceType } : {}),
              ...(error.resourceId !== undefined ? { resourceId: error.resourceId } : {}),
            },
          },
        },
      };

    case "Conflict":
      return {
        status: 409,
        body: {
          error: {
            code: error.code,
            message: error.message,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        },
      };

    case "Infra":
      // Don't leak internal error details to clients
      return {
        status: 500,
        body: {
          error: {
            code: error.code,
            message: "An internal error occurred. Please try again later.",
            // Only include safe details, never the cause or stack trace
            ...(error.details && isSafeDetails(error.details) ? { details: error.details } : {}),
          },
        },
      };

    default:
      // Exhaustiveness check - will cause compile error if new error type added
      assertNever(error);
  }
}

/**
 * Check if error details are safe to expose to clients
 * Filters out sensitive information like stack traces, internal paths, etc.
 */
function isSafeDetails(details: Record<string, unknown>): boolean {
  const sensitiveKeys = ["stack", "cause", "stackTrace", "internalError"];
  return !Object.keys(details).some((key) => sensitiveKeys.includes(key));
}
