"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { normalizeOptionalDateOnlyInput } from "../../utils/date-only-input";

import type { PatientActivityAssignment } from "../../types/entities";

// ============================================================================
// Types
// ============================================================================

export type AssignPatientActivityResponse = {
  activity: PatientActivityAssignment;
};

export type AssignPatientActivityPromise = Promise<SerializedResult<AssignPatientActivityResponse>>;

// ============================================================================
// Schema
// ============================================================================

const assignPatientActivitySchema = z.object({
  patientId: z.uuid(),
  activityId: z.uuid(),
  dueDate: z.string().optional(),
  instructions: z.string().optional(),
});

export type AssignPatientActivityRequest = z.infer<typeof assignPatientActivitySchema>;

// ============================================================================
// Action
// ============================================================================

/**
 * Assign a therapeutic activity to a patient
 */
const _assignPatientActivityAction = createAction<
  AssignPatientActivityRequest,
  AssignPatientActivityResponse
>({
  name: "assignPatientActivity",
  inputSchema: assignPatientActivitySchema,
  handler: async (input, context) => {
    const { patientId, activityId, dueDate, instructions } = input;
    const { userId, supabase } = context;
    const normalizedDueDate = normalizeOptionalDateOnlyInput(dueDate);

    if (!normalizedDueDate.isValid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          "Data de entrega inválida. Use DD/MM/AAAA ou YYYY-MM-DD.",
          { field: "dueDate", value: dueDate },
        ),
      );
    }

    const { data, error } = await supabase
      .from("psychologist_patient_activities")
      .insert({
        patient_id: patientId,
        activity_id: activityId,
        due_date: normalizedDueDate.value ?? null,
        instructions: instructions ?? null,
        status: "pending",
        assigned_at: new Date().toISOString(),
        created_by: userId,
        psychologist_id: userId,
      })
      .select()
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, `Erro ao atribuir atividade: ${error.message}`),
      );
    }

    const activity = data as PatientActivityAssignment;

    return ok({
      activity,
    });
  },
});

export async function assignPatientActivityAction(
  input: AssignPatientActivityRequest,
): Promise<SerializedResult<AssignPatientActivityResponse>> {
  const result = await _assignPatientActivityAction(input);
  return serializeResult(result);
}
