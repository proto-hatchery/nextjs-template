"use server";

import { z } from "zod";
import { err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";

const updateChargeValueRequestSchema = z
  .object({
    chargeId: z.uuid(),
    value: z.number().int().positive("O valor deve ser maior que zero"),
  })
  .strict();

export type UpdateChargeValueRequest = z.infer<typeof updateChargeValueRequestSchema>;

export type UpdateChargeValueResponse = {
  success: true;
};

export type UpdateChargeValuePromise = Promise<SerializedResult<UpdateChargeValueResponse>>;

const _updateChargeValue = createAction<UpdateChargeValueRequest, UpdateChargeValueResponse>({
  name: "billing.updateChargeValue",
  inputSchema: updateChargeValueRequestSchema,
  handler: async () => {
    return err(
      AppError.validation(
        AppErrorCode.VALIDATION_INVALID_INPUT,
        "O valor da cobrança segue o snapshot da sessão. Altere o preço da sessão para refletir novos valores.",
      ),
    );
  },
});

export async function updateChargeValueAction(
  input: UpdateChargeValueRequest,
): Promise<SerializedResult<UpdateChargeValueResponse>> {
  const result = await _updateChargeValue(input);
  return serializeResult(result);
}
