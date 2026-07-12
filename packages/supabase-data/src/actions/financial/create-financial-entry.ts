"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createFinancialEntryForPsychologist } from "../../modules/finances/application/financial-entry-commands";

const PAYMENT_METHOD_VALUES = ["fluripay", "card", "cash", "pix", "bank_transfer", "other"] as const;

const createFinancialEntryRequestSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z.number().positive("O valor deve ser maior que zero"),
    description: z.string().optional(),
    dateTime: z.string().datetime().optional(),
    categoryId: z.uuid().optional(),
    sessionId: z.uuid().optional(),
    paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional(),
    notes: z.string().optional(),
  })
  .strict();

export type CreateFinancialEntryRequest = z.infer<typeof createFinancialEntryRequestSchema>;

export type CreateFinancialEntryResponse = {
  id: string;
};

export type CreateFinancialEntryPromise = Promise<SerializedResult<CreateFinancialEntryResponse>>;

const createFinancialEntry = createAction<CreateFinancialEntryRequest, CreateFinancialEntryResponse>(
  {
    name: "financial.createFinancialEntry",
    inputSchema: createFinancialEntryRequestSchema,
    requireAuth: true,
    handler: async (input, context) => {
      const result = await createFinancialEntryForPsychologist(context.supabase, context.userId, {
        type: input.type,
        amount: input.amount,
        ...(input.description !== undefined ? { description: input.description } : {}),
        dateTime: input.dateTime ?? new Date().toISOString(),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
        ...(input.paymentMethod !== undefined ? { paymentMethod: input.paymentMethod } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      });

      if (result.isErr()) {
        return err(result.error);
      }

      return ok({ id: result.value.id });
    },
  },
);

export async function createFinancialEntryAction(
  input: CreateFinancialEntryRequest,
): Promise<CreateFinancialEntryPromise extends Promise<infer T> ? T : never> {
  const result = await createFinancialEntry(input);
  return serializeResult(result);
}
