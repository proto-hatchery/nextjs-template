"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";

import type {
  PatientGuardian,
  GuardianDocument,
} from "../../modules/patients/domain/ports/patient-repository.port";

import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";

/**
 * Request schema for getting patient guardians data
 */
const getPatientGuardiansDataRequestSchema = z.object({
  patientId: z.uuid(),
});
export type GetPatientGuardiansDataRequest = z.infer<typeof getPatientGuardiansDataRequestSchema>;

export interface PatientGuardiansDataResponse {
  primary: PatientGuardian | null;
  secondary: PatientGuardian | null;
  documents: GuardianDocument[];
}
export type GetPatientGuardiansDataPromise = Promise<
  SerializedResult<PatientGuardiansDataResponse>
>;

const _getPatientGuardiansDataAction = createAction<
  GetPatientGuardiansDataRequest,
  PatientGuardiansDataResponse
>({
  name: "getPatientGuardiansData",
  inputSchema: getPatientGuardiansDataRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.getGuardiansData(patientId, userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

/**
 * Get all guardians and documents for a patient
 */
export async function getPatientGuardiansDataAction(
  input: GetPatientGuardiansDataRequest,
): Promise<SerializedResult<PatientGuardiansDataResponse>> {
  const result = await _getPatientGuardiansDataAction(input);
  return serializeResult(result);
}
