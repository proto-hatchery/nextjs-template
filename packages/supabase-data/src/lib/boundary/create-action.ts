import type { Result } from "neverthrow";
import { err } from "neverthrow";
import type { ZodSchema } from "zod";
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client";
import { safeLogger } from "@workspace/supabase-data/utils/safe-logger";
import type { AppError } from "../errors/app-error";
import { AppErrorCode } from "../errors/app-error";
import { AppError as AppErrorFactory } from "../errors/app-error";
import { toAppError } from "../errors/app-error";
import { logInfraError, logUnexpectedError } from "../errors/observability";
import { formatZodError, isZodError } from "../errors/zod-formatter";
import { getCorrelationContext, OperationalEmitter } from "../observability";

/**
 * Configuration for creating a server action
 */
export type CreateActionConfig<TInput, TOutput> = {
  /**
   * Name of the action for logging/debugging
   */
  name: string;

  /**
   * Zod schema for validating input
   */
  inputSchema: ZodSchema<TInput>;

  /**
   * The action handler function
   * Receives validated input and auth context
   */
  handler: (input: TInput, context: ActionContext) => Promise<Result<TOutput, AppError>>;

  /**
   * Whether authentication is required (default: true)
   */
  requireAuth?: boolean;
};

/**
 * Context provided to action handlers
 */
export type ActionContext = {
  userId: string;
  supabase: Awaited<Awaited<ReturnType<typeof createServerAuthClient>>>;
};

function generateActionTraceId(): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `action_${randomPart}`;
}

function resolveCorrelationMetadata(): {
  traceId: string;
  correlationId?: string;
  correlationSource: "inherited" | "generated";
} {
  try {
    const context = getCorrelationContext();
    if (context?.traceId) {
      return {
        traceId: context.traceId,
        correlationId: context.correlationId,
        correlationSource: "inherited",
      };
    }
  } catch {
    // Correlation resolution is best-effort and must never fail action execution.
  }

  return {
    traceId: generateActionTraceId(),
    correlationSource: "generated",
  };
}

function emitActionLifecycleEvent(params: {
  eventName: string;
  actionName: string;
  operation: string;
  outcome: "received" | "success" | "failure" | "error";
  actorType: "authenticated" | "anonymous";
  userId?: string;
  traceId: string;
  correlationId?: string;
  correlationSource: "inherited" | "generated";
  durationMs?: number;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}): void {
  OperationalEmitter.log({
    event_name: params.eventName,
    component: "server-action",
    operation: params.operation,
    operation_type: "server_action",
    outcome: params.outcome,
    actor_type: params.actorType,
    trace_id: params.traceId,
    ...(params.correlationId !== undefined ? { correlation_id: params.correlationId } : {}),
    ...(params.durationMs !== undefined ? { duration_ms: params.durationMs } : {}),
    ...(params.errorCode !== undefined ? { error_code: params.errorCode } : {}),
    ...(params.errorMessage !== undefined ? { error_message: params.errorMessage } : {}),
    metadata: {
      action_name: params.actionName,
      correlation_source: params.correlationSource,
      ...(params.userId !== undefined ? { user_id: params.userId } : {}),
      ...params.metadata,
    },
  }).catch((error) => {
    safeLogger.error("[Action] Failed to emit lifecycle event:", error);
  });
}

/**
 * Create a type-safe server action with automatic error handling
 *
 * Benefits:
 * - Automatic input validation with Zod
 * - Authentication check
 * - Error conversion to AppError
 * - Observability logging
 * - Consistent error handling
 *
 * @example
 * ```typescript
 * const createPatient = createAction({
 *   name: "createPatient",
 *   inputSchema: z.object({
 *     fullName: z.string().min(1),
 *     email: z.string().email().optional(),
 *   }),
 *   handler: async (input, context) => {
 *     // Business logic here
 *     return ok({ id: "123", ...input });
 *   },
 * });
 *
 * // Usage in components
 * const result = await createPatient({ fullName: "John Doe" });
 * if (result.isOk()) {
 *   console.log("Created:", result.value);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export function createAction<TInput, TOutput>(
  config: CreateActionConfig<TInput, TOutput>,
): (input: unknown) => Promise<Result<TOutput, AppError>> {
  return async (input: unknown): Promise<Result<TOutput, AppError>> => {
    const requireAuth = config.requireAuth ?? true;
    const actionStartedAt = Date.now();
    const correlation = resolveCorrelationMetadata();
    const operation = `action:${config.name}`;

    try {
      // 1. Validate input
      const parseResult = config.inputSchema.safeParse(input);
      if (!parseResult.success) {
        const validationError = formatZodError(parseResult.error);

        emitActionLifecycleEvent({
          eventName: "action_failed",
          actionName: config.name,
          operation,
          outcome: "failure",
          actorType: "anonymous",
          traceId: correlation.traceId,
          ...(correlation.correlationId !== undefined
            ? { correlationId: correlation.correlationId }
            : {}),
          correlationSource: correlation.correlationSource,
          durationMs: Date.now() - actionStartedAt,
          errorCode: validationError.code,
          errorMessage: validationError.message,
          metadata: {
            app_error_type: validationError.type,
            phase: "validation",
          },
        });

        return err(validationError);
      }

      // 2. Get auth context
      const supabase = await createServerAuthClient();
      const { data: claimsData, error: authError } = await supabase.auth.getClaims();
      const userId = claimsData?.claims?.sub as string | undefined;
      const actorType = userId ? "authenticated" : "anonymous";

      if (requireAuth && (!userId || authError)) {
        emitActionLifecycleEvent({
          eventName: "action_failed",
          actionName: config.name,
          operation,
          outcome: "failure",
          actorType,
          ...(userId !== undefined ? { userId } : {}),
          traceId: correlation.traceId,
          ...(correlation.correlationId !== undefined
            ? { correlationId: correlation.correlationId }
            : {}),
          correlationSource: correlation.correlationSource,
          durationMs: Date.now() - actionStartedAt,
          errorCode: AppErrorCode.AUTH_SESSION_REQUIRED,
          errorMessage: "Authentication required",
          metadata: {
            phase: "auth",
            ...(authError ? { auth_error: String(authError.message ?? authError) } : {}),
          },
        });

        return err(
          AppErrorFactory.auth(AppErrorCode.AUTH_SESSION_REQUIRED, "Authentication required"),
        );
      }

      const context: ActionContext = {
        userId: userId || "",
        supabase,
      };

      emitActionLifecycleEvent({
        eventName: "action_started",
        actionName: config.name,
        operation,
        outcome: "received",
        actorType,
        ...(context.userId ? { userId: context.userId } : {}),
        traceId: correlation.traceId,
        ...(correlation.correlationId !== undefined
          ? { correlationId: correlation.correlationId }
          : {}),
        correlationSource: correlation.correlationSource,
        metadata: {
          phase: "handler_start",
          require_auth: requireAuth,
        },
      });

      // 3. Execute handler
      const result = await config.handler(parseResult.data, context);
      const durationMs = Date.now() - actionStartedAt;

      // 4. Log infrastructure errors
      if (result.isErr() && result.error.type === "Infra") {
        logInfraError(result.error, {
          operation,
          userId: context.userId,
        });

        // Duplicate to unified_events
        OperationalEmitter.log({
          event_name: "infra_error",
          component: "server-action",
          operation,
          operation_type: "server_action",
          outcome: "error",
          actor_type: userId ? "authenticated" : "anonymous",
          error_code: result.error.code,
          error_message: result.error.message,
          trace_id: correlation.traceId,
          ...(correlation.correlationId !== undefined
            ? { correlation_id: correlation.correlationId }
            : {}),
          metadata: {
            userId: context.userId,
            error_details: result.error.details,
            correlation_source: correlation.correlationSource,
          },
        }).catch((err) => safeLogger.error("[Action] Failed to emit event:", err));
      }

      if (result.isErr()) {
        emitActionLifecycleEvent({
          eventName: "action_failed",
          actionName: config.name,
          operation,
          outcome: result.error.type === "Infra" ? "error" : "failure",
          actorType,
          ...(context.userId ? { userId: context.userId } : {}),
          traceId: correlation.traceId,
          ...(correlation.correlationId !== undefined
            ? { correlationId: correlation.correlationId }
            : {}),
          correlationSource: correlation.correlationSource,
          durationMs,
          errorCode: result.error.code,
          errorMessage: result.error.message,
          metadata: {
            app_error_type: result.error.type,
            phase: "handler",
          },
        });
      } else {
        emitActionLifecycleEvent({
          eventName: "action_completed",
          actionName: config.name,
          operation,
          outcome: "success",
          actorType,
          ...(context.userId ? { userId: context.userId } : {}),
          traceId: correlation.traceId,
          ...(correlation.correlationId !== undefined
            ? { correlationId: correlation.correlationId }
            : {}),
          correlationSource: correlation.correlationSource,
          durationMs,
          metadata: {
            phase: "handler",
          },
        });
      }

      return result;
    } catch (error) {
      // Unexpected error - convert and log
      const appError = isZodError(error) ? formatZodError(error) : toAppError(error);

      logUnexpectedError(error, appError, {
        operation,
        metadata: { input },
      });

      emitActionLifecycleEvent({
        eventName: "action_failed",
        actionName: config.name,
        operation,
        outcome: "error",
        actorType: "anonymous",
        traceId: correlation.traceId,
        ...(correlation.correlationId !== undefined
          ? { correlationId: correlation.correlationId }
          : {}),
        correlationSource: correlation.correlationSource,
        durationMs: Date.now() - actionStartedAt,
        errorCode: appError.code,
        errorMessage: appError.message,
        metadata: {
          app_error_type: appError.type,
          phase: "unexpected",
        },
      });

      return err(appError);
    }
  };
}
