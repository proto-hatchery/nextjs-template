"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { deleteFinancialEntryForPsychologist } from "../../modules/finances/application/financial-entry-commands";

const deleteFinancialEntryRequestSchema = z
  .object({
    entryId: z.uuid(),
  })
  .strict();

export type DeleteFinancialEntryRequest = z.infer<typeof deleteFinancialEntryRequestSchema>;

export type DeleteFinancialEntryResponse = {
  success: true;
};

export type DeleteFinancialEntryPromise = Promise<SerializedResult<DeleteFinancialEntryResponse>>;

const deleteFinancialEntry = createAction<DeleteFinancialEntryRequest, DeleteFinancialEntryResponse>(
  {
    name: "financial.deleteFinancialEntry",
    inputSchema: deleteFinancialEntryRequestSchema,
    requireAuth: true,
    handler: async (input, context) => {
      const result = await deleteFinancialEntryForPsychologist(
        context.supabase,
        context.userId,
        input.entryId,
      );

      return result.isErr() ? err(result.error) : ok({ success: true });
    },
  },
);

export async function deleteFinancialEntryAction(
  input: DeleteFinancialEntryRequest,
): Promise<DeleteFinancialEntryPromise extends Promise<infer T> ? T : never> {
  const result = await deleteFinancialEntry(input);
  return serializeResult(result);
}
