"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import type { Database } from "@workspace/supabase-infra/types/database";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode, toAppError } from "../../lib/errors/app-error";
import { fromAssessmentRow } from "../../modules/patients/infrastructure/mappers/patient.mapper";
import { logUnexpectedError } from "../../lib/errors/observability";
import type { PatientAssessment } from "../../modules/patients/domain/dto/patient.dto";

// ============================================================================
// Types
// ============================================================================

export type CreatePatientTestRequest = {
  patientId: string;
  testName: string;
  testType: string;
  appliedAt: string;
};

export type CreatePatientTestResponse = {
  assessment: PatientAssessment;
};

export type CreatePatientTestPromise = Promise<SerializedResult<CreatePatientTestResponse>>;

export type UpdatePatientTestResponse = {
  assessment: PatientAssessment;
};

export type UpdatePatientTestPromise = Promise<SerializedResult<UpdatePatientTestResponse>>;

export type DeletePatientTestRequest = {
  testId: string;
};

export type DeletePatientTestResponse = {
  success: true;
};

export type DeletePatientTestPromise = Promise<SerializedResult<DeletePatientTestResponse>>;

// ============================================================================
// Validation
// ============================================================================

const createPatientTestSchema = z.object({
  patientId: z.uuid(),
  testName: z.string().trim().min(1, "Test name is required"),
  testType: z.string().trim().min(1, "Test type is required"),
  appliedAt: z.string().trim().min(1, "Applied date is required"),
});

const patientTestUpdatesSchema = z
  .object({
    testName: z.string().trim().optional(),
    testType: z.string().trim().optional(),
    appliedAt: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
    fileUrl: z.string().trim().optional().nullable(),
    status: z.string().trim().optional().nullable(),
  })
  .refine((updates) => Object.values(updates).some((value) => value !== undefined), {
    message: "At least one field must be provided to update the test",
  });

const updatePatientTestSchema = z.object({
  testId: z.uuid(),
  updates: patientTestUpdatesSchema,
});

export type UpdatePatientTestRequest = z.infer<typeof updatePatientTestSchema>;

const deletePatientTestSchema = z.object({
  testId: z.uuid(),
});

const toAssessment = (
  row: Database["public"]["Tables"]["psychologist_patient_assessments"]["Row"],
): PatientAssessment => fromAssessmentRow(row);

// ============================================================================
// Create
// ============================================================================

const _createPatientTestAction = createAction<CreatePatientTestRequest, CreatePatientTestResponse>({
  name: "createPatientTest",
  inputSchema: createPatientTestSchema,
  handler: async (input, context) => {
    const { patientId, testName, testType, appliedAt } = input;
    const { userId, supabase } = context;

    const { data: patientRow, error: patientError } = await supabase
      .from("psychologist_patients")
      .select("id")
      .eq("id", patientId)
      .eq("psychologist_id", userId)
      .single();

    if (patientError || !patientRow) {
      if (patientError?.code === "PGRST116") {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to validate patient ownership"),
      );
    }

    const { data, error } = await supabase
      .from("psychologist_patient_assessments")
      .insert({
        patient_id: patientId,
        psychologist_id: userId,
        test_name: testName,
        test_type: testType,
        applied_at: appliedAt,
        status: "pending",
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create patient test"));
    }

    return ok({ assessment: toAssessment(data) });
  },
});

export async function createPatientTestAction(
  input: CreatePatientTestRequest,
): CreatePatientTestPromise {
  try {
    const result = await _createPatientTestAction(input);
    return serializeResult(result);
  } catch (error) {
    const appError = toAppError(error);
    logUnexpectedError(error, appError, {
      operation: "createPatientTest",
      metadata: { patientId: input.patientId },
    });
    return serializeResult(err(appError));
  }
}

// ============================================================================
// Update
// ============================================================================

const _updatePatientTestAction = createAction<UpdatePatientTestRequest, UpdatePatientTestResponse>({
  name: "updatePatientTest",
  inputSchema: updatePatientTestSchema,
  handler: async (input, context) => {
    const { testId, updates } = input;
    const { userId, supabase } = context;

    const updatePayload = {
      ...(updates.testName !== undefined ? { test_name: updates.testName } : {}),
      ...(updates.testType !== undefined ? { test_type: updates.testType } : {}),
      ...(updates.appliedAt !== undefined ? { applied_at: updates.appliedAt } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      ...(updates.fileUrl !== undefined ? { file_url: updates.fileUrl } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
    };

    const { data, error } = await supabase
      .from("psychologist_patient_assessments")
      .update(updatePayload)
      .eq("id", testId)
      .eq("psychologist_id", userId)
      .select()
      .single();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update patient test"));
    }

    if (!data) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient test not found"));
    }

    return ok({ assessment: toAssessment(data) });
  },
});

export async function updatePatientTestAction(
  input: UpdatePatientTestRequest,
): UpdatePatientTestPromise {
  try {
    const result = await _updatePatientTestAction(input);
    return serializeResult(result);
  } catch (error) {
    const appError = toAppError(error);
    logUnexpectedError(error, appError, {
      operation: "updatePatientTest",
      metadata: { testId: input.testId },
    });
    return serializeResult(err(appError));
  }
}

// ============================================================================
// Delete
// ============================================================================

const _deletePatientTestAction = createAction<DeletePatientTestRequest, DeletePatientTestResponse>({
  name: "deletePatientTest",
  inputSchema: deletePatientTestSchema,
  handler: async (input, context) => {
    const { testId } = input;
    const { userId, supabase } = context;

    const { error } = await supabase
      .from("psychologist_patient_assessments")
      .delete()
      .eq("id", testId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to delete patient test"));
    }

    return ok({ success: true });
  },
});

export async function deletePatientTestAction(
  input: DeletePatientTestRequest,
): DeletePatientTestPromise {
  try {
    const result = await _deletePatientTestAction(input);
    return serializeResult(result);
  } catch (error) {
    const appError = toAppError(error);
    logUnexpectedError(error, appError, {
      operation: "deletePatientTest",
      metadata: { testId: input.testId },
    });
    return serializeResult(err(appError));
  }
}
