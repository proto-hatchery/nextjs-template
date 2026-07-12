"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import type { PatientDTO } from "../../modules/patients/domain/dto/patient.dto";

/**
 * Request schema for getting a patient
 */
const getPatientRequestSchema = z.object({
  patientId: z.uuid(),
});

export type GetPatientRequest = z.infer<typeof getPatientRequestSchema>;

/**
 * Response DTO for getting a patient
 */
export type GetPatientResponse = {
  patient: PatientDTO;
};

/**
 * Promise type for getting a patient
 */
export type GetPatientPromise = Promise<SerializedResult<GetPatientResponse>>;

const _getPatientAction = createAction<GetPatientRequest, GetPatientResponse>({
  name: "getPatient",
  inputSchema: getPatientRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    // Use repository instead of direct Supabase calls
    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.findById(patientId, userId);

    if (result.isErr()) {
      return err(result.error);
    }

    const patient = result.value;
    if (!patient) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_PATIENT,
          "Patient not found or you do not have access",
        ),
      );
    }

    return ok({ patient });
  },
});

/**
 * Get a patient by ID
 *
 * Retrieves a single patient record for the authenticated psychologist.
 * Ensures the patient belongs to the requesting psychologist.
 *
 * @example
 * ```typescript
 * const result = await getPatientAction({ patientId: "123" });
 *
 * if (result.isOk()) {
 *   console.log("Patient:", result.value.patient);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function getPatientAction(
  input: GetPatientRequest,
): Promise<SerializedResult<GetPatientResponse>> {
  const result = await _getPatientAction(input);
  return serializeResult(result);
}
