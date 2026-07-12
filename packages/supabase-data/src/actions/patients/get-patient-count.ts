"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";

import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";

const getPatientCountRequestSchema = z.object({
  status: z.union([z.string(), z.array(z.string())]).optional(),
});
type GetPatientCountRequest = z.infer<typeof getPatientCountRequestSchema>;

export type GetPatientCountResponse = {
  count: number;
};

export type GetPatientCountPromise = Promise<SerializedResult<GetPatientCountResponse>>;

const _getPatientCountAction = createAction<GetPatientCountRequest, GetPatientCountResponse>({
  name: "getPatientCount",
  inputSchema: getPatientCountRequestSchema,
  handler: async (input, context) => {
    const { status } = input;
    const { userId, supabase } = context;

    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.count(userId, {
      ...(status !== undefined ? { status } : {}),
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      count: result.value,
    });
  },
});

/**
 * Get the count of patients for the authenticated psychologist.
 *
 * @returns SerializedResult that can be safely passed to Client Components
 */
export async function getPatientCountAction(
  input: GetPatientCountRequest,
): Promise<SerializedResult<GetPatientCountResponse>> {
  const result = await _getPatientCountAction(input);
  return serializeResult(result);
}
