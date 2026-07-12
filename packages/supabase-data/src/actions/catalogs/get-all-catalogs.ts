"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { AllCatalogsDTO } from "../../modules/catalogs/domain/dto/reference-value.dto";
import { CatalogSupabaseRepository } from "../../modules/catalogs/infrastructure/repositories/catalog-supabase.repository";

const getAllCatalogsRequestSchema = z.object({}).strict();

export type GetAllCatalogsRequest = z.infer<typeof getAllCatalogsRequestSchema>;

export type GetAllCatalogsResponse = AllCatalogsDTO;

export type GetAllCatalogsPromise = Promise<SerializedResult<GetAllCatalogsResponse>>;

const _getAllCatalogsAction = createAction<GetAllCatalogsRequest, GetAllCatalogsResponse>({
  name: "catalogs.getAllCatalogs",
  inputSchema: getAllCatalogsRequestSchema,
  requireAuth: false,
  handler: async (_input, context) => {
    const repository = new CatalogSupabaseRepository(context.supabase);
    const result = await repository.getAllCatalogs();

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function getAllCatalogsAction(
  input: GetAllCatalogsRequest,
): Promise<SerializedResult<GetAllCatalogsResponse>> {
  const result = await _getAllCatalogsAction(input);
  return serializeResult(result);
}
