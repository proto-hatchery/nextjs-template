"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { refreshSessionAction } from "../auth/refresh-session";
// Note: deserializeResult is used here for server-side composition only (calling another server action).
// This is acceptable since both actions run on the server and share the same serialization boundary.
import { deserializeResult } from "../../lib/boundary/serialize-result";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { logWarning } from "../../lib/observability/action-logger";
import { completeOnboardingForUser } from "../../modules/onboarding/application/onboarding-commands";

/**
 * Request schema for completing onboarding (no input needed).
 */
const completeOnboardingRequestSchema = z.object({}).strict();
type CompleteOnboardingRequest = z.infer<typeof completeOnboardingRequestSchema>;

/**
 * Response for onboarding completion.
 */
export type CompleteOnboardingResponse = {
  success: true;
};

/**
 * Promise alias for completeOnboarding action.
 */
export type CompleteOnboardingPromise = Promise<SerializedResult<CompleteOnboardingResponse>>;

const _completeOnboardingAction = createAction<
  CompleteOnboardingRequest,
  CompleteOnboardingResponse
>({
  name: "completeOnboarding",
  inputSchema: completeOnboardingRequestSchema,
  requireAuth: true,
  handler: async (_input, context) => {
    const result = await completeOnboardingForUser(context.supabase);

    if (result.isErr()) {
      return err(result.error);
    }

    // Sync the onboarding_completed status to app_metadata
    // This ensures getUser() returns the updated value
    const { error: syncError } = await context.supabase.rpc("sync_user_app_metadata", {
      p_onboarding_completed: true,
    });

    if (syncError) {
      logWarning({
        event: "onboarding_metadata_sync_failed",
        error: syncError,
        context,
        metadata: {
          operation: "sync_user_app_metadata",
        },
      });
    }

    // Refresh the session to get updated JWT claims
    const refreshSerialized = await refreshSessionAction({});
    const refreshResult = deserializeResult(refreshSerialized);

    if (refreshResult.isErr()) {
      logWarning({
        event: "onboarding_session_refresh_failed",
        error: refreshResult.error,
        context,
        metadata: {
          operation: "refreshSession",
        },
      });
    }

    return ok(result.value);
  },
});

/**
 * Server action to mark the psychologist's onboarding as completed.
 *
 * This calls the database function and then refreshes the session
 * so the JWT includes the updated onboarding_completed claim.
 *
 * @example
 * ```tsx
 * const result = await completeOnboardingAction({});
 * if (result.isOk()) {
 *   router.push('/home');
 * }
 * ```
 */
export async function completeOnboardingAction(
  input: CompleteOnboardingRequest,
): Promise<SerializedResult<CompleteOnboardingResponse>> {
  const result = await _completeOnboardingAction(input);
  return serializeResult(result);
}
