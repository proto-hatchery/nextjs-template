"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { CancellationPolicyReferenceDTO } from "../../modules/catalogs/domain/dto/reference-value.dto";
import { CatalogSupabaseRepository } from "../../modules/catalogs/infrastructure/repositories/catalog-supabase.repository";

const getCancellationPoliciesRequestSchema = z.object({}).strict();

export type GetCancellationPoliciesRequest = z.infer<typeof getCancellationPoliciesRequestSchema>;

export type GetCancellationPoliciesResponse = {
  cancellationPolicies: readonly CancellationPolicyReferenceDTO[];
};

export type GetCancellationPoliciesPromise = Promise<
  SerializedResult<GetCancellationPoliciesResponse>
>;

const _getCancellationPoliciesAction = createAction<
  GetCancellationPoliciesRequest,
  GetCancellationPoliciesResponse
>({
  name: "catalogs.getCancellationPolicies",
  inputSchema: getCancellationPoliciesRequestSchema,
  requireAuth: false,
  handler: async (_input, context) => {
    const repository = new CatalogSupabaseRepository(context.supabase);
    const result = await repository.getCancellationPolicies();

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ cancellationPolicies: result.value });
  },
});

export async function getCancellationPoliciesAction(
  input: GetCancellationPoliciesRequest,
): Promise<SerializedResult<GetCancellationPoliciesResponse>> {
  const result = await _getCancellationPoliciesAction(input);
  return serializeResult(result);
}
