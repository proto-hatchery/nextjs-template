"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { toAppError } from "../../lib/errors/app-error";
import { logUnexpectedError } from "../../lib/errors/observability";

import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";

/**
 * Request schema for getting patient assessments
 */
const getPatientAssessmentsRequestSchema = z.object({
  patientId: z.uuid(),
});
export type GetPatientAssessmentsRequest = z.infer<typeof getPatientAssessmentsRequestSchema>;

/** Response shape (inline to avoid runtime reference to DTO name in bundled code). */
export type GetPatientAssessmentsResponse = {
  assessments: Array<{
    readonly id: string;
    readonly patientId: string;
    readonly testName: string;
    readonly testType: string | null;
    readonly appliedAt: string | null;
    readonly notes: string | null;
    readonly fileUrl: string | null;
    readonly status: string | null;
    readonly createdAt: string | null;
    readonly updatedAt: string | null;
  }>;
};
export type GetPatientAssessmentsPromise = Promise<SerializedResult<GetPatientAssessmentsResponse>>;

const _getPatientAssessmentsAction = createAction<
  GetPatientAssessmentsRequest,
  GetPatientAssessmentsResponse
>({
  name: "getPatientAssessments",
  inputSchema: getPatientAssessmentsRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.getAssessments(patientId, userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      assessments: result.value,
    });
  },
});

/**
 * Get all assessments for a patient
 */
/**
 * Public boundary: always returns SerializedResult (ADR 001 – no exceptions across boundaries).
 */
export async function getPatientAssessmentsAction(
  input: GetPatientAssessmentsRequest,
): Promise<SerializedResult<GetPatientAssessmentsResponse>> {
  try {
    const result = await _getPatientAssessmentsAction(input);
    return serializeResult(result);
  } catch (error) {
    const appError = toAppError(error);
    logUnexpectedError(error, appError, {
      operation: "getPatientAssessments",
      metadata: { patientId: input.patientId },
    });
    return serializeResult(err(appError));
  }
}
