"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { upsertPsychologistService } from "../../modules/psychologists/application/psychologist-commands";
import type { UpsertPsychologistServiceDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const upsertPsychologistServiceRequestSchema = z
  .object({
    id: z.uuid().optional(),
    serviceId: z.uuid(),
    price: z.number().int().min(0),
    durationMinutes: z.number().int().positive(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpsertPsychologistServiceRequest = z.infer<
  typeof upsertPsychologistServiceRequestSchema
>;
export type UpsertPsychologistServiceResponse = { id: string };

const upsertService = createAction<
  UpsertPsychologistServiceRequest,
  UpsertPsychologistServiceResponse
>({
  name: "psychologists.upsertService",
  inputSchema: upsertPsychologistServiceRequestSchema,
  handler: async (input, context) => {
    const normalizedInput: UpsertPsychologistServiceDTO = {
      serviceId: input.serviceId,
      price: input.price,
      durationMinutes: input.durationMinutes,
      ...(input.id !== undefined ? { id: input.id } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };
    const result = await upsertPsychologistService(context.supabase, context.userId, normalizedInput);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function upsertPsychologistServiceAction(
  input: UpsertPsychologistServiceRequest,
): Promise<SerializedResult<UpsertPsychologistServiceResponse>> {
  return serializeResult(await upsertService(input));
}
