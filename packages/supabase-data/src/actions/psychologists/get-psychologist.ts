"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { PsychologistSupabaseRepository } from "../../modules/psychologists/infrastructure/repositories/psychologist-supabase.repository";
import type { PsychologistDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const getPsychologistRequestSchema = z.object({}).strict();

export type GetPsychologistRequest = Record<string, never>;
export type GetPsychologistResponse = {
  psychologist: PsychologistDTO | null;
};

const _getPsychologist = createAction<GetPsychologistRequest, GetPsychologistResponse>({
  name: "psychologists.getPsychologist",
  inputSchema: getPsychologistRequestSchema,
  handler: async (_input, { userId, supabase }) => {
    const repo = new PsychologistSupabaseRepository(supabase);
    const result = await repo.findById(userId);
    if (result.isErr()) return err(result.error);
    return ok({ psychologist: result.value });
  },
});

export async function getPsychologistAction(
  input: GetPsychologistRequest = {},
): Promise<SerializedResult<GetPsychologistResponse>> {
  const result = await _getPsychologist(input);
  return serializeResult(result);
}
