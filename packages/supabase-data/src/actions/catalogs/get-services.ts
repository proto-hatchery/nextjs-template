"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ServiceReferenceDTO } from "../../modules/catalogs/domain/dto/reference-value.dto";
import { CatalogSupabaseRepository } from "../../modules/catalogs/infrastructure/repositories/catalog-supabase.repository";

const getServicesRequestSchema = z.object({}).strict();

export type GetServicesRequest = z.infer<typeof getServicesRequestSchema>;

export type GetServicesResponse = {
  services: readonly ServiceReferenceDTO[];
};

export type GetServicesPromise = Promise<SerializedResult<GetServicesResponse>>;

const _getServicesAction = createAction<GetServicesRequest, GetServicesResponse>({
  name: "catalogs.getServices",
  inputSchema: getServicesRequestSchema,
  requireAuth: false,
  handler: async (_input, context) => {
    const repository = new CatalogSupabaseRepository(context.supabase);
    const result = await repository.getServices();

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ services: result.value });
  },
});

export async function getServicesAction(
  input: GetServicesRequest,
): Promise<SerializedResult<GetServicesResponse>> {
  const result = await _getServicesAction(input);
  return serializeResult(result);
}
