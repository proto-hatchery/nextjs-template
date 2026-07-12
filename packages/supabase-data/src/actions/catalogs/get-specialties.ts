"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { SpecialtyReferenceDTO } from "../../modules/catalogs/domain/dto/reference-value.dto";
import { CatalogSupabaseRepository } from "../../modules/catalogs/infrastructure/repositories/catalog-supabase.repository";

const getSpecialtiesRequestSchema = z.object({}).strict();

export type GetSpecialtiesRequest = z.infer<typeof getSpecialtiesRequestSchema>;

export type GetSpecialtiesResponse = {
  specialties: readonly SpecialtyReferenceDTO[];
};

export type GetSpecialtiesPromise = Promise<SerializedResult<GetSpecialtiesResponse>>;

const _getSpecialtiesAction = createAction<GetSpecialtiesRequest, GetSpecialtiesResponse>({
  name: "catalogs.getSpecialties",
  inputSchema: getSpecialtiesRequestSchema,
  requireAuth: false,
  handler: async (_input, context) => {
    const repository = new CatalogSupabaseRepository(context.supabase);
    const result = await repository.getSpecialties();

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ specialties: result.value });
  },
});

export async function getSpecialtiesAction(
  input: GetSpecialtiesRequest,
): Promise<SerializedResult<GetSpecialtiesResponse>> {
  const result = await _getSpecialtiesAction(input);
  return serializeResult(result);
}
