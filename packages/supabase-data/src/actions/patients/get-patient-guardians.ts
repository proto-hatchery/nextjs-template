"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { verifyPatientOwnership } from "../../utils/authorization";
import type { GuardianDocument, PatientGuardian } from "../../types/entities";

/**
 * Request DTO for getting patient guardians
 */
const getPatientGuardiansRequestSchema = z.object({
  patientId: z.uuid(),
});

export type GetPatientGuardiansRequest = z.infer<typeof getPatientGuardiansRequestSchema>;

/**
 * Response DTO for getting patient guardians
 */
export type GetPatientGuardiansResponse = {
  primary: PatientGuardian | null;
  secondary: PatientGuardian | null;
  documents: GuardianDocument[];
};

/**
 * Promise type for getting patient guardians
 */
export type GetPatientGuardiansPromise = Promise<SerializedResult<GetPatientGuardiansResponse>>;

const _getPatientGuardiansAction = createAction<
  GetPatientGuardiansRequest,
  GetPatientGuardiansResponse
>({
  name: "getPatientGuardians",
  inputSchema: getPatientGuardiansRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    // 1. Verify patient ownership
    const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    // 2. Fetch guardians and documents in parallel
    const [guardiansResponse, documentsResponse] = await Promise.all([
      supabase
        .from("psychologist_patient_guardians")
        .select("*")
        .eq("patient_id", patientId)
        .eq("psychologist_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("psychologist_patient_guardian_documents")
        .select("*")
        .eq("patient_id", patientId)
        .eq("psychologist_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    // 3. Handle errors
    if (guardiansResponse.error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch guardians", {
          originalError: guardiansResponse.error.message,
        }),
      );
    }

    if (documentsResponse.error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch guardian documents", {
          originalError: documentsResponse.error.message,
        }),
      );
    }

    // 4. Classify guardians as primary/secondary
    const guardians = guardiansResponse.data;

    // Find primary: explicit type or first guardian
    const primary = guardians.find((g) => g.guardian_type === "primary") ?? guardians[0] ?? null;

    // Find secondary: explicit type or second guardian (not same as primary)
    const secondary =
      guardians.find((g) => g.guardian_type === "secondary") ??
      (guardians[0]?.id === primary?.id ? guardians[1] : guardians[0]) ??
      null;

    return ok({
      primary,
      secondary: secondary?.id === primary?.id ? null : secondary,
      documents: documentsResponse.data,
    });
  },
});

/**
 * Get patient guardians and their documents
 *
 * Fetches primary and secondary guardians along with all guardian documents.
 * Guardian classification is based on:
 * 1. Explicit guardian_type field (primary/secondary)
 * 2. Fallback to creation order if types not set
 *
 * @example
 * ```typescript
 * const result = await getPatientGuardiansAction({ patientId: "123" });
 *
 * if (result.isOk()) {
 *   const { primary, secondary, documents } = result.value;
 *   console.log("Primary:", primary);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function getPatientGuardiansAction(
  input: GetPatientGuardiansRequest,
): Promise<SerializedResult<GetPatientGuardiansResponse>> {
  const result = await _getPatientGuardiansAction(input);
  return serializeResult(result);
}
