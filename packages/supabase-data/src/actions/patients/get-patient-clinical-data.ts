"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import type { PatientClinicalData } from "../../modules/patients/domain/dto/patient.dto";

const getPatientClinicalDataRequestSchema = z.object({
  patientId: z.uuid(),
});

export type GetPatientClinicalDataRequest = z.infer<typeof getPatientClinicalDataRequestSchema>;

export interface GetPatientClinicalDataResponse {
  clinicalData: PatientClinicalData;
}

export type GetPatientClinicalDataPromise = Promise<
  SerializedResult<GetPatientClinicalDataResponse>
>;

const _getPatientClinicalDataAction = createAction<
  GetPatientClinicalDataRequest,
  GetPatientClinicalDataResponse
>({
  name: "getPatientClinicalData",
  inputSchema: getPatientClinicalDataRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.getClinicalData(patientId, userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      clinicalData: result.value,
    });
  },
});

export async function getPatientClinicalDataAction(
  input: GetPatientClinicalDataRequest,
): Promise<SerializedResult<GetPatientClinicalDataResponse>> {
  const result = await _getPatientClinicalDataAction(input);
  return serializeResult(result);
}
