"use server";

import { createAction } from "../../lib/boundary/create-action";

import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { err, ok } from "neverthrow";
import { z } from "zod";
import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import type { PatientActivityWithDetails } from "../../modules/patients/domain/dto/patient.dto";

// ============================================================================
// Types
// ============================================================================

export type GetPatientActivitiesRequest = {
  patientId: string;
};

export type GetPatientActivitiesResponse = {
  activities: PatientActivityWithDetails[];
};

export type GetPatientActivitiesPromise = Promise<SerializedResult<GetPatientActivitiesResponse>>;

// ============================================================================
// Schema
// ============================================================================

const getPatientActivitiesSchema = z.object({
  patientId: z.uuid(),
});

// ============================================================================
// Action
// ============================================================================

const _getPatientActivitiesAction = createAction<
  GetPatientActivitiesRequest,
  GetPatientActivitiesResponse
>({
  name: "getPatientActivities",
  inputSchema: getPatientActivitiesSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.getActivities(patientId, userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      activities: result.value,
    });
  },
});

/**
 * Get all activity assignments for a patient
 * Verifies psychologist ownership before returning data
 */
export async function getPatientActivitiesAction(
  input: GetPatientActivitiesRequest,
): Promise<SerializedResult<GetPatientActivitiesResponse>> {
  const result = await _getPatientActivitiesAction(input);
  return serializeResult(result);
}
