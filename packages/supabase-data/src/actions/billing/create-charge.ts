"use server";

import { z } from "zod";
import { err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";

const PAYMENT_STATUS_VALUES = ["pending", "paid", "cancelled", "overdue", "refunded"] as const;

const createChargeRequestSchema = z
  .object({
    patientId: z.uuid(),
    priceCents: z.number().int().positive("O valor deve ser maior que zero"),
    description: z.string().optional(),
    sessionId: z.uuid().optional(),
    serviceId: z.uuid().optional(),
    dueDate: z.string().optional(),
    paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
  })
  .strict();

export type CreateChargeRequest = z.infer<typeof createChargeRequestSchema>;

export type CreateChargeResponse = {
  id: string;
};

export type CreateChargePromise = Promise<SerializedResult<CreateChargeResponse>>;

const _createCharge = createAction<CreateChargeRequest, CreateChargeResponse>({
  name: "billing.createCharge",
  inputSchema: createChargeRequestSchema,
  handler: async () => {
    return err(
      AppError.validation(
        AppErrorCode.VALIDATION_INVALID_INPUT,
        "A criação manual de cobranças foi desativada. As cobranças são geradas automaticamente pelas sessões faturáveis.",
      ),
    );
  },
});

export async function createChargeAction(
  input: CreateChargeRequest,
): Promise<SerializedResult<CreateChargeResponse>> {
  const result = await _createCharge(input);
  return serializeResult(result);
}
