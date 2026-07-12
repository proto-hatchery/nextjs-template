"use server";

import { createAction } from "../../lib/boundary/create-action";
import { AppErrorCode } from "../../lib/errors/app-error";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { err, ok } from "neverthrow";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export type DeletePatientActivityRequest = {
  assignmentId: string;
};

export type DeletePatientActivityResponse = {
  success: true;
};

export type DeletePatientActivityPromise = Promise<SerializedResult<DeletePatientActivityResponse>>;

// ============================================================================
// Schema
// ============================================================================

const deletePatientActivitySchema = z.object({
  assignmentId: z.uuid(),
});

// ============================================================================
// Action
// ============================================================================

const _deletePatientActivityAction = createAction<
  DeletePatientActivityRequest,
  DeletePatientActivityResponse
>({
  name: "deletePatientActivity",
  inputSchema: deletePatientActivitySchema,
  handler: async (input, context) => {
    const { assignmentId } = input;
    const { supabase } = context;

    const { error } = await supabase
      .from("psychologist_patient_activities")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      return err({
        type: "Infra" as const,
        code: AppErrorCode.INFRA_SUPABASE,
        message: `Erro ao deletar atividade: ${error.message}`,
      });
    }

    return ok({
      success: true,
    });
  },
});

/**
 * Delete a patient activity assignment
 */
export async function deletePatientActivityAction(
  input: DeletePatientActivityRequest,
): Promise<SerializedResult<DeletePatientActivityResponse>> {
  const result = await _deletePatientActivityAction(input);
  return serializeResult(result);
}
