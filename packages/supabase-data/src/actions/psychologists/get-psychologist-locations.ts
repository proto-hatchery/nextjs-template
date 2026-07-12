"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { PsychologistSupabaseRepository } from "../../modules/psychologists/infrastructure/repositories/psychologist-supabase.repository";
import type { PsychologistLocationDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const getPsychologistLocationsRequestSchema = z.object({}).strict();

export type GetPsychologistLocationsRequest = z.infer<typeof getPsychologistLocationsRequestSchema>;
export type GetPsychologistLocationsResponse = {
  locations: PsychologistLocationDTO[];
};
export type GetPsychologistLocationsPromise = Promise<
  SerializedResult<GetPsychologistLocationsResponse>
>;

const _getPsychologistLocationsAction = createAction<
  GetPsychologistLocationsRequest,
  GetPsychologistLocationsResponse
>({
  name: "psychologists.getLocations",
  inputSchema: getPsychologistLocationsRequestSchema,
  handler: async (_input, context) => {
    const { userId } = context;

    const repository = new PsychologistSupabaseRepository(context.supabase);
    const result = await repository.findLocations(userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ locations: result.value });
  },
});

/**
 * Get locations for the authenticated psychologist.
 */
export async function getPsychologistLocationsAction(
  input: GetPsychologistLocationsRequest = {},
): GetPsychologistLocationsPromise {
  const result = await _getPsychologistLocationsAction(input);
  return serializeResult(result);
}
