"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type {
  ChargeWithRelationsDTO,
  PaymentStatus,
} from "../../modules/charges/domain/dto/charge.dto";
import { ChargeSupabaseRepository } from "../../modules/charges/infrastructure/repositories/charge-supabase.repository";

const PAYMENT_STATUS_VALUES = ["pending", "paid", "overdue", "refunded", "cancelled"] as const;

const getChargesWithDetailsRequestSchema = z
  .object({
    patientId: z.uuid().optional(),
    paymentStatus: z
      .union([z.enum(PAYMENT_STATUS_VALUES), z.array(z.enum(PAYMENT_STATUS_VALUES))])
      .optional(),
  })
  .strict();

export type GetChargesWithDetailsRequest = z.infer<typeof getChargesWithDetailsRequestSchema>;

export type GetChargesWithDetailsResponse = {
  charges: readonly ChargeWithRelationsDTO[];
};

export type GetChargesWithDetailsPromise = Promise<SerializedResult<GetChargesWithDetailsResponse>>;

const _getChargesWithDetails = createAction<
  GetChargesWithDetailsRequest,
  GetChargesWithDetailsResponse
>({
  name: "billing.getChargesWithDetails",
  inputSchema: getChargesWithDetailsRequestSchema,
  handler: async (input, context) => {
    const repository = new ChargeSupabaseRepository(context.supabase);
    const result = await repository.findAllWithRelations(context.userId, {
      ...(input.patientId !== undefined ? { patientId: input.patientId } : {}),
      ...(input.paymentStatus !== undefined
        ? { paymentStatus: input.paymentStatus as PaymentStatus | PaymentStatus[] }
        : {}),
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ charges: result.value });
  },
});

export async function getChargesWithDetailsAction(
  input: GetChargesWithDetailsRequest,
): Promise<SerializedResult<GetChargesWithDetailsResponse>> {
  const result = await _getChargesWithDetails(input);
  return serializeResult(result);
}
