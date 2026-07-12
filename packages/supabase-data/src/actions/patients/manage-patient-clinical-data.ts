"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import {
  PatientClinicalCondition,
  PatientClinicalMedication,
} from "../../modules/patients/domain/dto/patient.dto";

type ClinicalItemRow = Database["public"]["Tables"]["psychologist_patient_medical_items"]["Row"];

const clinicalConditionKinds = [
  "mental_disorder",
  "chronic_disease",
  "physical_disability",
  "other",
] as const;

const createPatientConditionInputSchema = z.object({
  name: z.string().trim().min(1),
  conditionType: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(clinicalConditionKinds))
    .optional(),
  diagnosedDate: z.string().trim().optional(),
  icd10Code: z.string().trim().optional(),
});

const createPatientConditionRequestSchema = z.object({
  patientId: z.uuid(),
  input: createPatientConditionInputSchema,
});

const createPatientMedicationInputSchema = z.object({
  name: z.string().trim().min(1),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
});

const createPatientMedicationRequestSchema = z.object({
  patientId: z.uuid(),
  input: createPatientMedicationInputSchema,
});

const stopMedicationRequestSchema = z.object({
  patientId: z.uuid(),
  medicationId: z.uuid(),
});

type ClinicalItemKind = (typeof clinicalConditionKinds)[number];

function parseConditionKind(value?: string): ClinicalItemKind {
  if (!value) return "other";
  return (clinicalConditionKinds as readonly string[]).includes(value.toLowerCase())
    ? (value.toLowerCase() as ClinicalItemKind)
    : "other";
}

function toClinicalCondition(row: ClinicalItemRow): PatientClinicalCondition {
  return {
    id: row.id,
    name: row.name ?? "",
    conditionType: row.kind ?? null,
    diagnosedDate: row.diagnosed_date ?? null,
    icd10Code: row.icd10_code ?? null,
    status: row.is_active ? "active" : "resolved",
    notes: row.notes ?? null,
    source: "therapist",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function toClinicalMedication(row: ClinicalItemRow): PatientClinicalMedication {
  return {
    id: row.id,
    name: row.name ?? "",
    dosage: row.dosage ?? null,
    frequency: row.frequency ?? null,
    route: null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    isActive: row.is_active ?? null,
    prescribedBy: null,
    reason: null,
    notes: row.notes ?? null,
    source: "therapist",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export type CreatePatientConditionRequest = z.infer<typeof createPatientConditionRequestSchema>;
export type CreatePatientMedicationRequest = z.infer<typeof createPatientMedicationRequestSchema>;
export type UpdatePatientClinicalConditionRequest = {
  patientId: string;
  conditionId: string;
  input: z.infer<typeof createPatientConditionInputSchema>;
};
export type UpdatePatientMedicationRequest = {
  patientId: string;
  medicationId: string;
  input: z.infer<typeof createPatientMedicationInputSchema>;
};

export interface CreatePatientConditionResponse {
  condition: PatientClinicalCondition;
}

export interface UpdatePatientConditionResponse {
  condition: PatientClinicalCondition;
}

export interface CreatePatientMedicationResponse {
  medication: PatientClinicalMedication;
}

export interface UpdatePatientMedicationResponse {
  medication: PatientClinicalMedication;
}

export interface DeletePatientClinicalDataResponse {
  success: boolean;
}

export type CreatePatientConditionPromise = Promise<
  SerializedResult<CreatePatientConditionResponse>
>;
export type UpdatePatientConditionPromise = Promise<
  SerializedResult<UpdatePatientConditionResponse>
>;
export type CreatePatientMedicationPromise = Promise<
  SerializedResult<CreatePatientMedicationResponse>
>;
export type UpdatePatientMedicationPromise = Promise<
  SerializedResult<UpdatePatientMedicationResponse>
>;
export type DeletePatientClinicalDataPromise = Promise<
  SerializedResult<DeletePatientClinicalDataResponse>
>;

const _createPatientConditionAction = createAction<
  CreatePatientConditionRequest,
  CreatePatientConditionResponse
>({
  name: "createPatientCondition",
  inputSchema: createPatientConditionRequestSchema,
  handler: async (input, context) => {
    const { patientId, input: conditionInput } = input;
    const { userId, supabase } = context;

    const { data, error } = await supabase
      .from("psychologist_patient_medical_items")
      .insert({
        psychologist_id: userId,
        psychologist_patient_id: patientId,
        kind: parseConditionKind(conditionInput.conditionType),
        name: conditionInput.name.trim(),
        icd10_code: conditionInput.icd10Code?.trim() || null,
        diagnosed_date: conditionInput.diagnosedDate || null,
        is_active: true,
        notes: null,
      })
      .select("*")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create patient condition", {
          originalError: error.message,
        }),
      );
    }

    if (!data) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "No data returned after create"));
    }

    return ok({
      condition: toClinicalCondition(data as ClinicalItemRow),
    });
  },
});

export async function createPatientConditionAction(
  input: CreatePatientConditionRequest,
): Promise<CreatePatientConditionPromise> {
  return serializeResult(await _createPatientConditionAction(input));
}

const updatePatientConditionRequestSchema = z.object({
  patientId: z.uuid(),
  conditionId: z.uuid(),
  input: createPatientConditionInputSchema,
});

const _updatePatientConditionAction = createAction<
  UpdatePatientClinicalConditionRequest,
  UpdatePatientConditionResponse
>({
  name: "updatePatientCondition",
  inputSchema: updatePatientConditionRequestSchema,
  handler: async (input, context) => {
    const { patientId, conditionId, input: conditionInput } = input;
    const { userId, supabase } = context;

    const { data, error } = await supabase
      .from("psychologist_patient_medical_items")
      .update({
        kind: parseConditionKind(conditionInput.conditionType),
        name: conditionInput.name.trim(),
        icd10_code: conditionInput.icd10Code?.trim() || null,
        diagnosed_date: conditionInput.diagnosedDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conditionId)
      .eq("psychologist_patient_id", patientId)
      .eq("psychologist_id", userId)
      .select("*")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update patient condition", {
          originalError: error.message,
        }),
      );
    }

    if (!data) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient condition not found"));
    }

    return ok({
      condition: toClinicalCondition(data as ClinicalItemRow),
    });
  },
});

export async function updatePatientConditionAction(
  input: UpdatePatientClinicalConditionRequest,
): Promise<UpdatePatientConditionPromise> {
  const result = await _updatePatientConditionAction(input);
  return serializeResult(result);
}

const _deletePatientConditionRequestSchema = z.object({
  patientId: z.uuid(),
  conditionId: z.uuid(),
});

const _deletePatientMedicationRequestSchema = z.object({
  patientId: z.uuid(),
  medicationId: z.uuid(),
});

const _deletePatientConditionAction = createAction<
  { patientId: string; conditionId: string },
  DeletePatientClinicalDataResponse
>({
  name: "deletePatientCondition",
  inputSchema: _deletePatientConditionRequestSchema,
  handler: async (input, context) => {
    const { patientId, conditionId } = input;
    const { userId, supabase } = context;

    const { error, count } = await supabase
      .from("psychologist_patient_medical_items")
      .delete({ count: "exact" })
      .eq("id", conditionId)
      .eq("psychologist_patient_id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to delete patient condition", {
          originalError: error.message,
        }),
      );
    }

    if (count === 0) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient condition not found"));
    }

    return ok({ success: true });
  },
});

export async function deletePatientConditionAction(input: {
  patientId: string;
  conditionId: string;
}): Promise<DeletePatientClinicalDataPromise> {
  const result = await _deletePatientConditionAction(input);
  return serializeResult(result);
}

const _createPatientMedicationAction = createAction<
  CreatePatientMedicationRequest,
  CreatePatientMedicationResponse
>({
  name: "createPatientMedication",
  inputSchema: createPatientMedicationRequestSchema,
  handler: async (input, context) => {
    const { patientId, input: medicationInput } = input;
    const { userId, supabase } = context;

    const { data, error } = await supabase
      .from("psychologist_patient_medical_items")
      .insert({
        psychologist_id: userId,
        psychologist_patient_id: patientId,
        kind: "medication_intake",
        name: medicationInput.name.trim(),
        dosage: medicationInput.dosage?.trim() || null,
        frequency: medicationInput.frequency?.trim() || null,
        start_date: medicationInput.startDate || null,
        is_active: true,
        notes: null,
      })
      .select("*")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create patient medication", {
          originalError: error.message,
        }),
      );
    }

    if (!data) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "No data returned after create"));
    }

    return ok({
      medication: toClinicalMedication(data as ClinicalItemRow),
    });
  },
});

export async function createPatientMedicationAction(
  input: CreatePatientMedicationRequest,
): Promise<CreatePatientMedicationPromise> {
  const result = await _createPatientMedicationAction(input);
  return serializeResult(result);
}

const _updatePatientMedicationInputSchema = z.object({
  patientId: z.uuid(),
  medicationId: z.uuid(),
  input: createPatientMedicationInputSchema,
});

const _updatePatientMedicationAction = createAction<
  UpdatePatientMedicationRequest,
  UpdatePatientMedicationResponse
>({
  name: "updatePatientMedication",
  inputSchema: _updatePatientMedicationInputSchema,
  handler: async (input, context) => {
    const { patientId, medicationId, input: medicationInput } = input;
    const { userId, supabase } = context;

    const { data, error } = await supabase
      .from("psychologist_patient_medical_items")
      .update({
        name: medicationInput.name.trim(),
        dosage: medicationInput.dosage?.trim() || null,
        frequency: medicationInput.frequency?.trim() || null,
        start_date: medicationInput.startDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", medicationId)
      .eq("psychologist_patient_id", patientId)
      .eq("psychologist_id", userId)
      .select("*")
      .single();

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update patient medication", {
          originalError: error.message,
        }),
      );
    }

    if (!data) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient medication not found"));
    }

    return ok({
      medication: toClinicalMedication(data as ClinicalItemRow),
    });
  },
});

export async function updatePatientMedicationAction(
  input: UpdatePatientMedicationRequest,
): Promise<UpdatePatientMedicationPromise> {
  const result = await _updatePatientMedicationAction(input);
  return serializeResult(result);
}

const _deletePatientMedicationAction = createAction<
  { patientId: string; medicationId: string },
  DeletePatientClinicalDataResponse
>({
  name: "deletePatientMedication",
  inputSchema: _deletePatientMedicationRequestSchema,
  handler: async (input, context) => {
    const { patientId, medicationId } = input;
    const { userId, supabase } = context;

    const { error, count } = await supabase
      .from("psychologist_patient_medical_items")
      .delete({ count: "exact" })
      .eq("id", medicationId)
      .eq("psychologist_patient_id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to delete patient medication", {
          originalError: error.message,
        }),
      );
    }

    if (count === 0) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient medication not found"));
    }

    return ok({ success: true });
  },
});

export async function deletePatientMedicationAction(input: {
  patientId: string;
  medicationId: string;
}): Promise<DeletePatientClinicalDataPromise> {
  const result = await _deletePatientMedicationAction(input);
  return serializeResult(result);
}

const _stopPatientMedicationAction = createAction<
  { patientId: string; medicationId: string },
  DeletePatientClinicalDataResponse
>({
  name: "stopPatientMedication",
  inputSchema: stopMedicationRequestSchema,
  handler: async (input, context) => {
    const { patientId, medicationId } = input;
    const { userId, supabase } = context;

    const { error } = await supabase
      .from("psychologist_patient_medical_items")
      .update({
        is_active: false,
        end_date: new Date().toISOString().split("T")[0] ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", medicationId)
      .eq("psychologist_patient_id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to stop patient medication", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

export async function stopPatientMedicationAction(input: {
  patientId: string;
  medicationId: string;
}): Promise<DeletePatientClinicalDataPromise> {
  const result = await _stopPatientMedicationAction(input);
  return serializeResult(result);
}
