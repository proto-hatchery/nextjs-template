"use server";

import { z } from "zod";
import { ok, err } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { normalizeOptionalDateOnlyInput } from "../../utils/date-only-input";

import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import type {
  PatientDTO,
  EmergencyContactDTO,
} from "../../modules/patients/domain/dto/patient.dto";

/**
 * Emergency contact for update operation.
 */
const emergencyContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  relationship: z.string().optional(),
});

const patientAddressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

type UpdatePatientAddress = z.infer<typeof patientAddressSchema>;

function toNullableTrimmed(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function toAddressField(value: string | undefined): string | undefined {
  const normalized = toNullableTrimmed(value);
  return normalized ?? undefined;
}

function normalizePatientAddress(address: UpdatePatientAddress | undefined): PatientDTO["address"] {
  if (!address) {
    return null;
  }

  const street = toAddressField(address.street);
  const number = toAddressField(address.number);
  const complement = toAddressField(address.complement);
  const neighborhood = toAddressField(address.neighborhood);
  const city = toAddressField(address.city);
  const state = toAddressField(address.state);
  const zipCode = toAddressField(address.zipCode);
  const country = toAddressField(address.country);

  const normalized: PatientDTO["address"] = {
    ...(street !== undefined ? { street } : {}),
    ...(number !== undefined ? { number } : {}),
    ...(complement !== undefined ? { complement } : {}),
    ...(neighborhood !== undefined ? { neighborhood } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(state !== undefined ? { state } : {}),
    ...(zipCode !== undefined ? { zipCode } : {}),
    ...(country !== undefined ? { country } : {}),
  };

  const hasAddressValue = Object.keys(normalized ?? {}).length > 0;
  return hasAddressValue ? normalized : null;
}

/**
 * Request schema for updating a patient.
 */
const updatePatientRequestSchema = z
  .object({
    patientId: z.uuid(),
    fullName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    preferredName: z.string().optional(),
    gender: z.string().trim().optional(),
    cpf: z.string().trim().optional(),
    email: z.string().trim().email().or(z.literal("")).optional(),
    phone: z.string().trim().optional(),
    dateOfBirth: z.string().trim().optional(), // YYYY-MM-DD format
    address: patientAddressSchema.partial().nullable().optional(),
    attachedDocuments: z.record(z.string(), z.unknown()).nullable().optional(),
    clinicalNotes: z.string().optional(),
    preferredContactMethod: z.string().trim().optional(),
    notificationsWhatsappSessionReminders: z.boolean().optional(),
    patientOrigin: z.string().trim().optional(),
    defaultSessionPrice: z.number().optional(),
    emergencyContacts: z.array(emergencyContactSchema).optional(),
  })
  .strict();

export type UpdatePatientRequest = z.infer<typeof updatePatientRequestSchema>;

/**
 * Response for patient update.
 */
export type UpdatePatientResponse = {
  id: string;
  displayName: string;
};

/**
 * Promise alias for updatePatient action.
 */
export type UpdatePatientPromise = Promise<SerializedResult<UpdatePatientResponse>>;

const _updatePatientAction = createAction<UpdatePatientRequest, UpdatePatientResponse>({
  name: "updatePatient",
  inputSchema: updatePatientRequestSchema,
  requireAuth: true,
  handler: async (input, context) => {
    const normalizedBirthDate = normalizeOptionalDateOnlyInput(input.dateOfBirth);

    if (!normalizedBirthDate.isValid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          "Data de nascimento inválida. Use DD/MM/AAAA ou YYYY-MM-DD.",
          { field: "dateOfBirth", value: input.dateOfBirth },
        ),
      );
    }

    // Build partial updates object (not using readonly PatientDTO)
    const updates: Partial<{
      fullName: string | null;
      firstName: string | null;
      lastName: string | null;
      preferredName: string | null;
      gender: string | null;
      email: string | null;
      phone: string | null;
      dateOfBirth: string | null;
      cpf: string | null;
      address: PatientDTO["address"];
      attachedDocuments: PatientDTO["attachedDocuments"];
      clinicalNotes: string | null;
      preferredContactMethod: string | null;
      notificationsWhatsappSessionReminders: boolean;
      patientOrigin: string | null;
      defaultSessionPrice: number | null;
      isSynced: boolean;
      lastSynced: string | null;
    }> = {};

    // Map input fields to domain DTO
    if (input.fullName !== undefined) {
      updates.fullName = input.fullName?.trim() || null;
    }
    if (input.firstName !== undefined) {
      updates.firstName = input.firstName?.trim() || null;
    }
    if (input.lastName !== undefined) {
      updates.lastName = input.lastName?.trim() || null;
    }
    if (input.preferredName !== undefined) {
      updates.preferredName = toNullableTrimmed(input.preferredName);
    }
    if (input.gender !== undefined) {
      updates.gender = toNullableTrimmed(input.gender);
    }
    if (input.cpf !== undefined) {
      updates.cpf = toNullableTrimmed(input.cpf);
    }
    if (input.email !== undefined) {
      updates.email = toNullableTrimmed(input.email);
    }
    if (input.phone !== undefined) {
      updates.phone = toNullableTrimmed(input.phone);
    }
    if (input.dateOfBirth !== undefined) {
      updates.dateOfBirth = normalizedBirthDate.value ?? null;
      // Note: mapper will calculate isMinor automatically
    }
    if (input.preferredContactMethod !== undefined) {
      updates.preferredContactMethod = toNullableTrimmed(input.preferredContactMethod);
    }
    if (input.notificationsWhatsappSessionReminders !== undefined) {
      updates.notificationsWhatsappSessionReminders = input.notificationsWhatsappSessionReminders;
    }
    if (input.patientOrigin !== undefined) {
      updates.patientOrigin = toNullableTrimmed(input.patientOrigin);
    }
    if (Object.prototype.hasOwnProperty.call(input, "address")) {
      updates.address = input.address ? normalizePatientAddress(input.address) : null;
    }
    if (Object.prototype.hasOwnProperty.call(input, "attachedDocuments")) {
      updates.attachedDocuments = input.attachedDocuments ?? null;
    }
    if (input.clinicalNotes !== undefined) {
      updates.clinicalNotes = input.clinicalNotes || null;
    }
    if (input.defaultSessionPrice !== undefined) {
      updates.defaultSessionPrice = input.defaultSessionPrice;
    }

    updates.isSynced = false;
    updates.lastSynced = null;

    // Convert emergency contacts if provided
    let emergencyContacts: EmergencyContactDTO[] | undefined;
    if (Object.prototype.hasOwnProperty.call(input, "emergencyContacts")) {
      emergencyContacts = (input.emergencyContacts ?? []).map((contact) => ({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        ...(contact.relationship?.trim() ? { relationship: contact.relationship.trim() } : {}),
      }));
    }

    // Use repository to update patient
    const repository = new PatientSupabaseRepository(context.supabase);
    const result = await repository.update(
      input.patientId,
      context.userId,
      updates,
      emergencyContacts,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    const updatedPatient = result.value;
    return ok({
      id: updatedPatient.id,
      displayName: updatedPatient.displayName,
    });
  },
});

/**
 * Server action to update a patient's data.
 *
 * Supports partial updates - only provided fields are updated.
 * Uses repository pattern for data access.
 *
 * @example
 * ```tsx
 * const result = await updatePatientAction({
 *   patientId: "uuid",
 *   manualEmail: "newemail@example.com",
 *   defaultSessionPrice: 150,
 * });
 *
 * if (result.success) {
 *   console.log("Patient updated successfully");
 * }
 * ```
 */
export async function updatePatientAction(
  input: UpdatePatientRequest,
): Promise<SerializedResult<UpdatePatientResponse>> {
  const result = await _updatePatientAction(input);
  return serializeResult(result);
}
