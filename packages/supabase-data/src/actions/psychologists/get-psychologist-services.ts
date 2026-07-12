"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { PsychologistSupabaseRepository } from "../../modules/psychologists/infrastructure/repositories/psychologist-supabase.repository";
import type { PsychologistServiceWithReferenceDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const getPsychologistServicesRequestSchema = z.object({}).strict();

export type GetPsychologistServicesRequest = Record<string, never>;
export type GetPsychologistServicesResponse = {
  services: PsychologistServiceWithReferenceDTO[];
};

const _getPsychologistServices = createAction<
  GetPsychologistServicesRequest,
  GetPsychologistServicesResponse
>({
  name: "psychologists.getPsychologistServices",
  inputSchema: getPsychologistServicesRequestSchema,
  handler: async (_input, { userId, supabase }) => {
    const repo = new PsychologistSupabaseRepository(supabase);
    const result = await repo.findServices(userId);
    if (result.isErr()) return err(result.error);
    return ok({ services: result.value });
  },
});

export async function getPsychologistServicesAction(
  input: GetPsychologistServicesRequest = {},
): Promise<SerializedResult<GetPsychologistServicesResponse>> {
  const result = await _getPsychologistServices(input);
  return serializeResult(result);
}
