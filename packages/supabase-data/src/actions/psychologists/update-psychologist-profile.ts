"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { updatePsychologistProfile } from "../../modules/psychologists/application/psychologist-commands";
import type { UpdatePsychologistProfileDTO } from "../../modules/psychologists/domain/dto/psychologist.dto";

const updatePsychologistProfileRequestSchema = z
  .object({
    fullName: z.string().optional(),
    displayName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    pronouns: z.string().optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    avatarUrl: z.string().optional(),
    businessType: z.string().optional(),
    cnpj: z.string().optional(),
    companyName: z.string().optional(),
    timezone: z.string().optional(),
  })
  .strict();

export type UpdatePsychologistProfileRequest = z.infer<
  typeof updatePsychologistProfileRequestSchema
>;
export type UpdatePsychologistProfileResponse = { success: true };

const updateProfile = createAction<
  UpdatePsychologistProfileRequest,
  UpdatePsychologistProfileResponse
>({
  name: "psychologists.updateProfile",
  inputSchema: updatePsychologistProfileRequestSchema,
  handler: async (input, context) => {
    const normalizedInput = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as UpdatePsychologistProfileDTO;
    const result = await updatePsychologistProfile(
      context.supabase,
      context.userId,
      normalizedInput,
    );
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function updatePsychologistProfileAction(
  input: UpdatePsychologistProfileRequest,
): Promise<SerializedResult<UpdatePsychologistProfileResponse>> {
  return serializeResult(await updateProfile(input));
}
