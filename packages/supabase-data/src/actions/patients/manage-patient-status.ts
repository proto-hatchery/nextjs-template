"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

/**
 * Request schema for archiving a patient
 */
const archivePatientRequestSchema = z.object({
  patientId: z.uuid(),
});

export type ArchivePatientRequest = z.infer<typeof archivePatientRequestSchema>;

/**
 * Response DTO for archiving a patient
 */
export type ArchivePatientResponse = {
  success: boolean;
};

/**
 * Promise type for archiving a patient
 */
export type ArchivePatientPromise = Promise<SerializedResult<ArchivePatientResponse>>;

const _archivePatientAction = createAction<ArchivePatientRequest, ArchivePatientResponse>({
  name: "archivePatient",
  inputSchema: archivePatientRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const now = new Date().toISOString();

    // Archive patient with ownership verification
    const { error } = await supabase
      .from("psychologist_patients")
      .update({
        status: "archived",
        archived_at: now,
        archived_by: userId,
        updated_at: now,
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to archive patient", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

/**
 * Archive a patient
 *
 * Sets the patient status to "archived" and records the archive timestamp.
 * The patient remains in the database but is hidden from active lists.
 *
 * @example
 * ```typescript
 * const result = await archivePatientAction({ patientId: "123" });
 *
 * if (result.isOk()) {
 *   console.log("Patient archived successfully");
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function archivePatientAction(
  input: ArchivePatientRequest,
): Promise<SerializedResult<ArchivePatientResponse>> {
  const result = await _archivePatientAction(input);
  return serializeResult(result);
}

/**
 * Request schema for unarchiving a patient
 */
const unarchivePatientRequestSchema = z.object({
  patientId: z.uuid(),
});

export type UnarchivePatientRequest = z.infer<typeof unarchivePatientRequestSchema>;

/**
 * Response DTO for unarchiving a patient
 */
export type UnarchivePatientResponse = {
  success: boolean;
};

/**
 * Promise type for unarchiving a patient
 */
export type UnarchivePatientPromise = Promise<SerializedResult<UnarchivePatientResponse>>;

const _unarchivePatientAction = createAction<UnarchivePatientRequest, UnarchivePatientResponse>({
  name: "unarchivePatient",
  inputSchema: unarchivePatientRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const now = new Date().toISOString();

    // Unarchive patient with ownership verification
    const { error } = await supabase
      .from("psychologist_patients")
      .update({
        status: "active",
        archived_at: null,
        archived_by: null,
        updated_at: now,
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to unarchive patient", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

/**
 * Unarchive a patient
 *
 * Restores an archived patient to active status.
 * Clears the archive timestamp and restores full access.
 *
 * @example
 * ```typescript
 * const result = await unarchivePatientAction({ patientId: "123" });
 *
 * if (result.isOk()) {
 *   console.log("Patient restored successfully");
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function unarchivePatientAction(
  input: UnarchivePatientRequest,
): Promise<SerializedResult<UnarchivePatientResponse>> {
  const result = await _unarchivePatientAction(input);
  return serializeResult(result);
}

/**
 * Request schema for changing patient status
 */
const changePatientStatusRequestSchema = z.object({
  patientId: z.uuid(),
  status: z.enum(["active", "inactive", "on_break"]),
});

export type ChangePatientStatusRequest = z.infer<typeof changePatientStatusRequestSchema>;

/**
 * Response DTO for changing patient status
 */
export type ChangePatientStatusResponse = {
  success: boolean;
};

/**
 * Promise type for changing patient status
 */
export type ChangePatientStatusPromise = Promise<SerializedResult<ChangePatientStatusResponse>>;

const _changePatientStatusAction = createAction<
  ChangePatientStatusRequest,
  ChangePatientStatusResponse
>({
  name: "changePatientStatus",
  inputSchema: changePatientStatusRequestSchema,
  handler: async (input, context) => {
    const { patientId, status } = input;
    const { userId, supabase } = context;

    const now = new Date().toISOString();

    // Update status with ownership verification
    const { error } = await supabase
      .from("psychologist_patients")
      .update({
        status,
        updated_at: now,
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update patient status", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

/**
 * Change patient status
 *
 * Updates a patient's status to active, inactive, or on_break.
 * Status transitions help track the current state of the therapeutic relationship.
 *
 * @example
 * ```typescript
 * const result = await changePatientStatusAction({
 *   patientId: "123",
 *   status: "on_break",
 * });
 *
 * if (result.isOk()) {
 *   console.log("Status updated successfully");
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function changePatientStatusAction(
  input: ChangePatientStatusRequest,
): Promise<SerializedResult<ChangePatientStatusResponse>> {
  const result = await _changePatientStatusAction(input);
  return serializeResult(result);
}
