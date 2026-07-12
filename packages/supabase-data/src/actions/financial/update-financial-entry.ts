"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updateFinancialEntryForPsychologist } from "../../modules/finances/application/financial-entry-commands";

const FINANCIAL_ENTRY_STATUS_VALUES = ["confirmed", "pending", "cancelled"] as const;
const PAYMENT_METHOD_VALUES = ["fluripay", "card", "cash", "pix", "bank_transfer", "other"] as const;

const updateFinancialEntryRequestSchema = z
  .object({
    entryId: z.uuid(),
    data: z
      .object({
        amount: z.number().int().positive("O valor deve ser maior que zero").optional(),
        description: z.string().optional(),
        dateTime: z.string().datetime().optional(),
        categoryId: z.uuid().optional(),
        paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional(),
        status: z.enum(FINANCIAL_ENTRY_STATUS_VALUES).optional(),
        notes: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type UpdateFinancialEntryRequest = z.infer<typeof updateFinancialEntryRequestSchema>;

export type UpdateFinancialEntryResponse = {
  success: true;
};

export type UpdateFinancialEntryPromise = Promise<SerializedResult<UpdateFinancialEntryResponse>>;

const updateFinancialEntry = createAction<UpdateFinancialEntryRequest, UpdateFinancialEntryResponse>(
  {
    name: "financial.updateFinancialEntry",
    inputSchema: updateFinancialEntryRequestSchema,
    requireAuth: true,
    handler: async (input, context) => {
      const result = await updateFinancialEntryForPsychologist(
        context.supabase,
        context.userId,
        input.entryId,
        {
          ...(input.data.amount !== undefined ? { amount: input.data.amount } : {}),
          ...(input.data.description !== undefined ? { description: input.data.description } : {}),
          ...(input.data.dateTime !== undefined ? { dateTime: input.data.dateTime } : {}),
          ...(input.data.categoryId !== undefined ? { categoryId: input.data.categoryId } : {}),
          ...(input.data.paymentMethod !== undefined
            ? { paymentMethod: input.data.paymentMethod }
            : {}),
          ...(input.data.status !== undefined ? { status: input.data.status } : {}),
          ...(input.data.notes !== undefined ? { notes: input.data.notes } : {}),
        },
      );

      return result.isErr() ? err(result.error) : ok({ success: true });
    },
  },
);

export async function updateFinancialEntryAction(
  input: UpdateFinancialEntryRequest,
): Promise<UpdateFinancialEntryPromise extends Promise<infer T> ? T : never> {
  const result = await updateFinancialEntry(input);
  return serializeResult(result);
}
