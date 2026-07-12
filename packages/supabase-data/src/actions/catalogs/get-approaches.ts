"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ApproachReferenceDTO } from "../../modules/catalogs/domain/dto/reference-value.dto";
import { CatalogSupabaseRepository } from "../../modules/catalogs/infrastructure/repositories/catalog-supabase.repository";

const getApproachesRequestSchema = z.object({}).strict();

export type GetApproachesRequest = z.infer<typeof getApproachesRequestSchema>;

export type GetApproachesResponse = {
  approaches: readonly ApproachReferenceDTO[];
};

export type GetApproachesPromise = Promise<SerializedResult<GetApproachesResponse>>;

const _getApproachesAction = createAction<GetApproachesRequest, GetApproachesResponse>({
  name: "catalogs.getApproaches",
  inputSchema: getApproachesRequestSchema,
  requireAuth: false,
  handler: async (_input, context) => {
    const repository = new CatalogSupabaseRepository(context.supabase);
    const result = await repository.getApproaches();

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ approaches: result.value });
  },
});

export async function getApproachesAction(
  input: GetApproachesRequest,
): Promise<SerializedResult<GetApproachesResponse>> {
  const result = await _getApproachesAction(input);
  return serializeResult(result);
}
