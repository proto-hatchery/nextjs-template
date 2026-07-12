"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { upsertPsychologistLocation } from "../../modules/psychologists/application/psychologist-commands";
import type { UpsertPsychologistLocationDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const upsertPsychologistLocationRequestSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().min(1),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpsertPsychologistLocationRequest = z.infer<
  typeof upsertPsychologistLocationRequestSchema
>;
export type UpsertPsychologistLocationResponse = { id: string };

const upsertLocation = createAction<
  UpsertPsychologistLocationRequest,
  UpsertPsychologistLocationResponse
>({
  name: "psychologists.upsertLocation",
  inputSchema: upsertPsychologistLocationRequestSchema,
  handler: async (input, context) => {
    const normalizedInput: UpsertPsychologistLocationDTO = {
      name: input.name,
      ...(input.id !== undefined ? { id: input.id } : {}),
      ...(input.street !== undefined ? { street: input.street } : {}),
      ...(input.number !== undefined ? { number: input.number } : {}),
      ...(input.complement !== undefined ? { complement: input.complement } : {}),
      ...(input.neighborhood !== undefined ? { neighborhood: input.neighborhood } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.state !== undefined ? { state: input.state } : {}),
      ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };
    const result = await upsertPsychologistLocation(
      context.supabase,
      context.userId,
      normalizedInput,
    );
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function upsertPsychologistLocationAction(
  input: UpsertPsychologistLocationRequest,
): Promise<SerializedResult<UpsertPsychologistLocationResponse>> {
  return serializeResult(await upsertLocation(input));
}
