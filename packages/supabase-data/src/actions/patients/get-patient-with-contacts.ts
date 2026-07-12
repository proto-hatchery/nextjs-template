"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import type { PatientWithContactsDTO } from "../../modules/patients/domain/dto/patient.dto";

/**
 * Request schema for getting a patient with contacts
 */
const getPatientWithContactsRequestSchema = z
  .object({
    patientId: z.uuid(),
  })
  .strict();

export type GetPatientWithContactsRequest = z.infer<typeof getPatientWithContactsRequestSchema>;

/**
 * Response DTO for getting a patient with contacts
 */
export type GetPatientWithContactsResponse = {
  patient: PatientWithContactsDTO;
};

/**
 * Promise type for getting a patient with contacts
 */
export type GetPatientWithContactsPromise = Promise<
  SerializedResult<GetPatientWithContactsResponse>
>;

const _getPatientWithContactsAction = createAction<
  GetPatientWithContactsRequest,
  GetPatientWithContactsResponse
>({
  name: "patients.getPatientWithContacts",
  inputSchema: getPatientWithContactsRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    // Use repository instead of direct Supabase calls
    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.findByIdWithContacts(patientId, userId);

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
 * Get a patient by ID with emergency contacts
 *
 * Retrieves a single patient record with their emergency contacts for the authenticated psychologist.
 * Ensures the patient belongs to the requesting psychologist.
 */
export async function getPatientWithContactsAction(
  input: GetPatientWithContactsRequest,
): Promise<SerializedResult<GetPatientWithContactsResponse>> {
  const result = await _getPatientWithContactsAction(input);
  return serializeResult(result);
}
