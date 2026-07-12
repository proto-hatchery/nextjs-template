"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { PaymentStatus } from "../../modules/charges/domain/dto/charge.dto";
import { ChargeSupabaseRepository } from "../../modules/charges/infrastructure/repositories/charge-supabase.repository";

const PAYMENT_STATUS_VALUES = ["pending", "paid", "overdue", "refunded", "cancelled"] as const;

export type ChargeListItem = {
  id: string;
  patientId: string | null;
  priceCents: number;
  paymentStatus: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
};

const listChargesRequestSchema = z
  .object({
    limit: z.number().min(1).max(100).optional().default(50),
    offset: z.number().min(0).optional().default(0),
    paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
    patientId: z.uuid().optional(),
  })
  .strict();

export type ListChargesRequest = z.infer<typeof listChargesRequestSchema>;

export type ListChargesResponse = {
  charges: ChargeListItem[];
  total: number;
  hasMore: boolean;
};

export type ListChargesPromise = Promise<SerializedResult<ListChargesResponse>>;

const _listCharges = createAction<ListChargesRequest, ListChargesResponse>({
  name: "billing.listCharges",
  inputSchema: listChargesRequestSchema,
  handler: async (input, context) => {
    const repository = new ChargeSupabaseRepository(context.supabase);
    const result = await repository.findAll(
      context.userId,
      {
        ...(input.patientId !== undefined ? { patientId: input.patientId } : {}),
        ...(input.paymentStatus !== undefined
          ? { paymentStatus: input.paymentStatus as PaymentStatus }
          : {}),
      },
      {
        limit: input.limit,
        offset: input.offset,
      },
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      charges: result.value.charges.map((charge) => ({
        id: charge.id,
        patientId: charge.patientId,
        priceCents: charge.priceCents,
        paymentStatus: charge.paymentStatus,
        dueDate: charge.dueDate,
        paidAt: charge.paidAt,
        createdAt: charge.createdAt,
      })),
      total: result.value.totalCount,
      hasMore: result.value.hasMore,
    });
  },
});

export async function listChargesAction(
  input: ListChargesRequest,
): Promise<SerializedResult<ListChargesResponse>> {
  const result = await _listCharges(input);
  return serializeResult(result);
}
