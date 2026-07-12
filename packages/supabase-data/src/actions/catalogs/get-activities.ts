"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { ActivityReferenceDTO } from "../../modules/catalogs/domain/dto/reference-value.dto";
import { CatalogSupabaseRepository } from "../../modules/catalogs/infrastructure/repositories/catalog-supabase.repository";
import { queryKeys } from "../../utils/query-keys";

const getActivitiesRequestSchema = z
  .object({
    page: z.number().int().min(0).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
  })
  .strict();

export type GetActivitiesRequest = z.infer<typeof getActivitiesRequestSchema>;

export type GetActivitiesResponse = {
  activities: readonly ActivityReferenceDTO[];
};

export type GetActivitiesPromise = Promise<SerializedResult<GetActivitiesResponse>>;

const _getActivitiesAction = createAction<GetActivitiesRequest, GetActivitiesResponse>({
  name: "catalogs.getActivities",
  inputSchema: getActivitiesRequestSchema,
  requireAuth: false,
  handler: async (input, context) => {
    const repository = new CatalogSupabaseRepository(context.supabase);
    const result = await repository.getActivities({
      ...(input.page !== undefined ? { page: input.page } : {}),
      ...(input.pageSize !== undefined ? { pageSize: input.pageSize } : {}),
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ activities: result.value });
  },
});

export async function getActivitiesAction(
  input: GetActivitiesRequest,
): Promise<SerializedResult<GetActivitiesResponse>> {
  const result = await _getActivitiesAction(input);
  return serializeResult(result);
}
