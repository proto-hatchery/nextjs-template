"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updateChargeMethodForPsychologist } from "../../modules/charges/application/charge-commands";

const PAYMENT_METHOD_VALUES = [
  "fluripay",
  "card",
  "cash",
  "pix",
  "bank_transfer",
  "other",
] as const;

const updateChargeMethodRequestSchema = z
  .object({
    chargeId: z.uuid(),
    method: z.enum(PAYMENT_METHOD_VALUES),
  })
  .strict();

export type UpdateChargeMethodRequest = z.infer<typeof updateChargeMethodRequestSchema>;

export type UpdateChargeMethodResponse = {
  success: true;
};

export type UpdateChargeMethodPromise = Promise<SerializedResult<UpdateChargeMethodResponse>>;

const _updateChargeMethod = createAction<UpdateChargeMethodRequest, UpdateChargeMethodResponse>({
  name: "billing.updateChargeMethod",
  inputSchema: updateChargeMethodRequestSchema,
  handler: async (input, context) => {
    const result = await updateChargeMethodForPsychologist(
      context.supabase,
      context.userId,
      input.chargeId,
      input.method,
    );
    return result.isErr() ? err(result.error) : ok({ success: true });
  },
});

export async function updateChargeMethodAction(
  input: UpdateChargeMethodRequest,
): Promise<SerializedResult<UpdateChargeMethodResponse>> {
  const result = await _updateChargeMethod(input);
  return serializeResult(result);
}
