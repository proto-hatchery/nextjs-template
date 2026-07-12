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

export type UpdatePatientActivityResponse = {
  activity: PatientActivityAssignment;
};

export type UpdatePatientActivityPromise = Promise<SerializedResult<UpdatePatientActivityResponse>>;

// ============================================================================
// Schema
// ============================================================================

const updatePatientActivitySchema = z.object({
  assignmentId: z.uuid(),
  updates: z.object({
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
    due_date: z.string().nullable().optional(),
    instructions: z.string().nullable().optional(),
    is_archived: z.boolean().optional(),
    completed_at: z.string().nullable().optional(),
  }),
});

export type PatientActivityUpdate = z.infer<typeof updatePatientActivitySchema.shape.updates>;
export type UpdatePatientActivityRequest = z.infer<typeof updatePatientActivitySchema>;

// ============================================================================
// Action
// ============================================================================

/**
 * Update a patient activity assignment
 */
const _updatePatientActivityAction = createAction<
  UpdatePatientActivityRequest,
  UpdatePatientActivityResponse
>({
  name: "updatePatientActivity",
  inputSchema: updatePatientActivitySchema,
  handler: async (input, context) => {
    const { assignmentId, updates } = input;
    const { supabase } = context;
    const normalizedDueDate = normalizeOptionalDateOnlyInput(updates.due_date);

    if (!normalizedDueDate.isValid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          "Data de entrega inválida. Use DD/MM/AAAA ou YYYY-MM-DD.",
          { field: "due_date", value: updates.due_date },
        ),
      );
    }

    const updatePayload: {
      status?: "pending" | "in_progress" | "completed" | "cancelled";
      due_date?: string | null;
      instructions?: string | null;
      is_archived?: boolean;
      completed_at?: string | null;
    } = {
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.due_date !== undefined ? { due_date: normalizedDueDate.value ?? null } : {}),
      ...(updates.instructions !== undefined ? { instructions: updates.instructions } : {}),
      ...(updates.is_archived !== undefined ? { is_archived: updates.is_archived } : {}),
      ...(updates.completed_at !== undefined ? { completed_at: updates.completed_at } : {}),
    };

    const { data, error } = await supabase
      .from("psychologist_patient_activities")
      .update(updatePayload)
      .eq("id", assignmentId)
      .select()
      .single();

    if (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          `Erro ao atualizar atividade: ${error.message}`,
        ),
      );
    }

    const activity = data as PatientActivityAssignment;

    return ok({
      activity,
    });
  },
});

export async function updatePatientActivityAction(
  input: UpdatePatientActivityRequest,
): Promise<SerializedResult<UpdatePatientActivityResponse>> {
  const result = await _updatePatientActivityAction(input);
  return serializeResult(result);
}
