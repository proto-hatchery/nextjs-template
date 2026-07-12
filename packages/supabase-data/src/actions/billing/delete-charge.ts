"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { deleteChargeForPsychologist } from "../../modules/charges/application/charge-commands";

const deleteChargeRequestSchema = z
  .object({
    chargeId: z.uuid(),
  })
  .strict();

export type DeleteChargeRequest = z.infer<typeof deleteChargeRequestSchema>;

export type DeleteChargeResponse = {
  success: true;
};

export type DeleteChargePromise = Promise<SerializedResult<DeleteChargeResponse>>;

const _deleteCharge = createAction<DeleteChargeRequest, DeleteChargeResponse>({
  name: "billing.deleteCharge",
  inputSchema: deleteChargeRequestSchema,
  handler: async (input, context) => {
    const result = await deleteChargeForPsychologist(
      context.supabase,
      context.userId,
      input.chargeId,
    );
    return result.isErr() ? err(result.error) : ok({ success: true });
  },
});

export async function deleteChargeAction(
  input: DeleteChargeRequest,
): Promise<SerializedResult<DeleteChargeResponse>> {
  const result = await _deleteCharge(input);
  return serializeResult(result);
}
