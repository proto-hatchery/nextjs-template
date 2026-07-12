"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updateChargeStatusForPsychologist } from "../../modules/charges/application/charge-commands";

const PAYMENT_STATUS_VALUES = ["pending", "paid", "cancelled", "overdue", "refunded"] as const;

const updateChargeStatusRequestSchema = z
  .object({
    chargeId: z.uuid(),
    status: z.enum(PAYMENT_STATUS_VALUES),
  })
  .strict();

export type UpdateChargeStatusRequest = z.infer<typeof updateChargeStatusRequestSchema>;

export type UpdateChargeStatusResponse = {
  success: true;
};

export type UpdateChargeStatusPromise = Promise<SerializedResult<UpdateChargeStatusResponse>>;

const _updateChargeStatus = createAction<UpdateChargeStatusRequest, UpdateChargeStatusResponse>({
  name: "billing.updateChargeStatus",
  inputSchema: updateChargeStatusRequestSchema,
  handler: async (input, context) => {
    const result = await updateChargeStatusForPsychologist(
      context.supabase,
      context.userId,
      input.chargeId,
      input.status,
    );
    return result.isErr() ? err(result.error) : ok({ success: true });
  },
});

export async function updateChargeStatusAction(
  input: UpdateChargeStatusRequest,
): Promise<SerializedResult<UpdateChargeStatusResponse>> {
  const result = await _updateChargeStatus(input);
  return serializeResult(result);
}
