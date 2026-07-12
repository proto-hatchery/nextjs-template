"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { deletePsychologistService } from "../../modules/psychologists/application/psychologist-commands";

const deletePsychologistServiceRequestSchema = z
  .object({
    serviceId: z.uuid(),
  })
  .strict();

export type DeletePsychologistServiceRequest = z.infer<
  typeof deletePsychologistServiceRequestSchema
>;
export type DeletePsychologistServiceResponse = { success: true };

const deleteService = createAction<
  DeletePsychologistServiceRequest,
  DeletePsychologistServiceResponse
>({
  name: "psychologists.deleteService",
  inputSchema: deletePsychologistServiceRequestSchema,
  handler: async (input, context) => {
    const result = await deletePsychologistService(context.supabase, context.userId, input.serviceId);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function deletePsychologistServiceAction(
  input: DeletePsychologistServiceRequest,
): Promise<SerializedResult<DeletePsychologistServiceResponse>> {
  return serializeResult(await deleteService(input));
}
