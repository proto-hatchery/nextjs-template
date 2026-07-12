"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import {
  serializeResultVoid,
  type SerializedResultVoid,
} from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

const deletePatientRequestSchema = z.object({
  patientId: z.uuid(),
});

export type DeletePatientRequest = z.infer<typeof deletePatientRequestSchema>;

export type DeletePatientResult = SerializedResultVoid;

const _deletePatientAction = createAction<DeletePatientRequest, void>({
  name: "deletePatient",
  inputSchema: deletePatientRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const deletedAt = new Date();
    const recoveryDeadline = new Date(deletedAt);
    recoveryDeadline.setDate(recoveryDeadline.getDate() + 30);

    const { data, error } = await supabase
      .from("psychologist_patients")
      .update({
        deleted_at: deletedAt.toISOString(),
        deleted_by: userId,
        recovery_deadline: recoveryDeadline.toISOString(),
        updated_at: deletedAt.toISOString(),
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId)
      .is("deleted_at", null)
      .select("id")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to delete patient", {
          originalError: error.message,
        }),
      );
    }

    if (!data) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
    }

    return ok();
  },
});

export async function deletePatientAction(
  input: DeletePatientRequest,
): Promise<DeletePatientResult> {
  const result = await _deletePatientAction(input);
  return serializeResultVoid(result);
}
