"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { setCancellationPolicy } from "../../modules/sessions/application/cancellation-policy";

const setCancellationPolicyRequestSchema = z
  .object({
    policyCode: z.string().min(1),
  })
  .strict();

export type SetCancellationPolicyRequest = z.infer<typeof setCancellationPolicyRequestSchema>;
export type SetCancellationPolicyResponse = { success: true };

const _setCancellationPolicy = createAction<
  SetCancellationPolicyRequest,
  SetCancellationPolicyResponse
>({
  name: "sessions.setCancellationPolicy",
  inputSchema: setCancellationPolicyRequestSchema,
  handler: async (input, context) => {
    await setCancellationPolicy(context.supabase, context.userId, input.policyCode);
    return ok({ success: true });
  },
});

export async function setCancellationPolicyAction(
  input: SetCancellationPolicyRequest,
): Promise<SerializedResult<SetCancellationPolicyResponse>> {
  const result = await _setCancellationPolicy(input);
  return serializeResult(result);
}
