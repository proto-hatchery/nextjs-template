"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

const guardianTypeSchema = z.enum(["legal_guardian", "parent", "tutor", "caregiver", "other"]);

const createGuardianInputSchema = z.object({
  fullName: z.string().trim().min(1),
  guardianType: guardianTypeSchema,
  relationship: z.string().trim().optional(),
  email: z.string().trim().email().or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  cpf: z.string().trim().optional(),
});

const createGuardianRequestSchema = z.object({
  patientId: z.uuid(),
  input: createGuardianInputSchema,
});

const updateGuardianInputSchema = z
  .object({
    fullName: z.string().trim().optional(),
    guardianType: guardianTypeSchema.optional(),
    relationship: z.string().trim().optional(),
    email: z.string().trim().email().or(z.literal("")).optional(),
    phone: z.string().trim().optional(),
    cpf: z.string().trim().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine(
    (value) => Object.keys(value).some((key) => value[key as keyof typeof value] !== undefined),
    {
      message: "At least one field is required",
    },
  );

const updateGuardianRequestSchema = z.object({
  patientId: z.uuid(),
  guardianId: z.uuid(),
  data: updateGuardianInputSchema,
});

const guardianMutationRequestSchema = z.object({
  patientId: z.uuid(),
  guardianId: z.uuid(),
});

export type CreatePatientGuardianRequest = z.infer<typeof createGuardianRequestSchema>;
export type UpdatePatientGuardianRequest = z.infer<typeof updateGuardianRequestSchema>;
export type DeletePatientGuardianRequest = z.infer<typeof guardianMutationRequestSchema>;

export interface CreatePatientGuardianResponse {
  guardianId: string;
}

export interface UpdatePatientGuardianResponse {
  success: boolean;
}

export type CreatePatientGuardianPromise = Promise<SerializedResult<CreatePatientGuardianResponse>>;
export type UpdatePatientGuardianPromise = Promise<SerializedResult<UpdatePatientGuardianResponse>>;
export type DeletePatientGuardianPromise = Promise<SerializedResult<UpdatePatientGuardianResponse>>;

const _createPatientGuardianAction = createAction<
  CreatePatientGuardianRequest,
  CreatePatientGuardianResponse
>({
  name: "createPatientGuardian",
  inputSchema: createGuardianRequestSchema,
  handler: async (input, context) => {
    const { patientId, input: guardianInput } = input;
    const { userId, supabase } = context;

    const { data: patient, error: patientError } = await supabase
      .from("psychologist_patients")
      .select("id")
      .eq("id", patientId)
      .eq("psychologist_id", userId)
      .single();

    if (patientError || !patient) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
    }

    const { data, error } = await supabase
      .from("psychologist_patient_guardians")
      .insert({
        psychologist_id: userId,
        patient_id: patientId,
        full_name: guardianInput.fullName.trim(),
        guardian_type: guardianInput.guardianType,
        relationship: guardianInput.relationship?.trim() || null,
        email: guardianInput.email?.trim() || null,
        phone: guardianInput.phone?.trim() || null,
        cpf: guardianInput.cpf?.trim() || null,
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create guardian", {
          originalError: error.message,
        }),
      );
    }

    if (!data) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "No data returned after create"));
    }

    return ok({ guardianId: data.id });
  },
});

export async function createPatientGuardianAction(
  input: CreatePatientGuardianRequest,
): Promise<CreatePatientGuardianPromise> {
  const result = await _createPatientGuardianAction(input);
  return serializeResult(result);
}

const _updatePatientGuardianAction = createAction<
  UpdatePatientGuardianRequest,
  UpdatePatientGuardianResponse
>({
  name: "updatePatientGuardian",
  inputSchema: updateGuardianRequestSchema,
  handler: async (input, context) => {
    const { patientId, guardianId, data } = input;
    const { userId, supabase } = context;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.fullName !== undefined) {
      updateData.full_name = data.fullName?.trim() || null;
    }
    if (data.guardianType !== undefined) {
      updateData.guardian_type = data.guardianType;
    }
    if (data.relationship !== undefined) {
      updateData.relationship = data.relationship?.trim() || null;
    }
    if (data.email !== undefined) {
      updateData.email = data.email?.trim() || null;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone?.trim() || null;
    }
    if (data.cpf !== undefined) {
      updateData.cpf = data.cpf?.trim() || null;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const { error, data: updated } = await supabase
      .from("psychologist_patient_guardians")
      .update(updateData)
      .eq("id", guardianId)
      .eq("psychologist_id", userId)
      .eq("patient_id", patientId)
      .select("id");

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update guardian", {
          originalError: error.message,
        }),
      );
    }

    if (!updated || updated.length === 0) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Guardian not found"));
    }

    return ok({ success: true });
  },
});

export async function updatePatientGuardianAction(
  input: UpdatePatientGuardianRequest,
): Promise<UpdatePatientGuardianPromise> {
  const result = await _updatePatientGuardianAction(input);
  return serializeResult(result);
}

const _deletePatientGuardianAction = createAction<
  DeletePatientGuardianRequest,
  UpdatePatientGuardianResponse
>({
  name: "deletePatientGuardian",
  inputSchema: guardianMutationRequestSchema,
  handler: async (input, context) => {
    const { patientId, guardianId } = input;
    const { userId, supabase } = context;

    const { error, data: removed } = await supabase
      .from("psychologist_patient_guardians")
      .update({
        status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", guardianId)
      .eq("psychologist_id", userId)
      .eq("patient_id", patientId)
      .select("id");

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to remove guardian", {
          originalError: error.message,
        }),
      );
    }

    if (!removed || removed.length === 0) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Guardian not found"));
    }

    return ok({ success: true });
  },
});

export async function deletePatientGuardianAction(
  input: DeletePatientGuardianRequest,
): Promise<DeletePatientGuardianPromise> {
  const result = await _deletePatientGuardianAction(input);
  return serializeResult(result);
}
