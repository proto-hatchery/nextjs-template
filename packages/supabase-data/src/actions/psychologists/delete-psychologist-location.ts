"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { deletePsychologistLocation } from "../../modules/psychologists/application/psychologist-commands";

const deletePsychologistLocationRequestSchema = z
  .object({
    locationId: z.uuid(),
  })
  .strict();

export type DeletePsychologistLocationRequest = z.infer<
  typeof deletePsychologistLocationRequestSchema
>;
export type DeletePsychologistLocationResponse = { success: true };

const deleteLocation = createAction<
  DeletePsychologistLocationRequest,
  DeletePsychologistLocationResponse
>({
  name: "psychologists.deleteLocation",
  inputSchema: deletePsychologistLocationRequestSchema,
  handler: async (input, context) => {
    const result = await deletePsychologistLocation(
      context.supabase,
      context.userId,
      input.locationId,
    );
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function deletePsychologistLocationAction(
  input: DeletePsychologistLocationRequest,
): Promise<SerializedResult<DeletePsychologistLocationResponse>> {
  return serializeResult(await deleteLocation(input));
}
