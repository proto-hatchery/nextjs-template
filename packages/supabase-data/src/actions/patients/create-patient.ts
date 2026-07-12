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
 * Emergency contact schema (matches domain DTO)
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

type CreatePatientAddress = z.infer<typeof patientAddressSchema>;

function toNullableTrimmed(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function toAddressField(value: string | undefined): string | undefined {
  const normalized = toNullableTrimmed(value);
  return normalized ?? undefined;
}

function normalizePatientAddress(address: CreatePatientAddress | undefined): PatientDTO["address"] {
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
 * Request schema for creating a patient.
 */
const createPatientRequestSchema = z
  .object({
    firstName: z.string().trim().min(1, "Nome é obrigatório"),
    lastName: z.string().trim().optional(),
    preferredName: z.string().trim().optional(),
    fullName: z.string().trim().optional(),
    email: z.string().trim().email().or(z.literal("")).optional(),
    phone: z.string().trim().optional(),
    dateOfBirth: z.string().trim().optional(),
    cpf: z.string().trim().optional(),
    address: patientAddressSchema.optional(),
    gender: z.string().trim().optional(),
    preferredContactMethod: z.string().trim().optional(),
    notificationsWhatsappSessionReminders: z.boolean().optional(),
    patientOrigin: z.string().trim().optional(),
    defaultSessionPrice: z.number().optional(),
    emergencyContacts: z.array(emergencyContactSchema).optional(),
  })
  .strict();

export type CreatePatientRequest = z.infer<typeof createPatientRequestSchema>;

/**
 * Response for patient creation.
 */
export type CreatePatientResponse = {
  id: string;
  displayName: string;
};

/**
 * Promise alias for createPatient action.
 */
export type CreatePatientPromise = Promise<SerializedResult<CreatePatientResponse>>;

const _createPatientAction = createAction<CreatePatientRequest, CreatePatientResponse>({
  name: "createPatient",
  inputSchema: createPatientRequestSchema,
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

    // Build domain DTO from request
    const patientData: Omit<
      PatientDTO,
      "id" | "psychologistId" | "createdAt" | "updatedAt" | "archivedAt"
    > = {
      firstName: input.firstName.trim(),
      lastName: toNullableTrimmed(input.lastName),
      preferredName: toNullableTrimmed(input.preferredName),
      fullName: toNullableTrimmed(input.fullName),
      email: toNullableTrimmed(input.email),
      phone: toNullableTrimmed(input.phone),
      dateOfBirth: normalizedBirthDate.value ?? null,
      cpf: toNullableTrimmed(input.cpf),
      gender: toNullableTrimmed(input.gender),
      address: normalizePatientAddress(input.address),
      preferredContactMethod: toNullableTrimmed(input.preferredContactMethod),
      notificationsWhatsappSessionReminders: input.notificationsWhatsappSessionReminders ?? true,
      patientOrigin: toNullableTrimmed(input.patientOrigin),
      attachedDocuments: null,
      clinicalNotes: null,
      isSynced: false,
      lastSynced: null,
      displayName: "", // Will be calculated by mapper
      isMinor: false, // Will be calculated by mapper
      age: null, // Will be calculated by mapper
      defaultSessionPrice: input.defaultSessionPrice ?? null,
      isActive: true,
    };

    // Convert emergency contacts to domain DTOs
    const emergencyContacts: EmergencyContactDTO[] = (input.emergencyContacts || []).map(
      (contact) => ({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        ...(contact.relationship?.trim() ? { relationship: contact.relationship.trim() } : {}),
      }),
    );

    // Use repository to create patient
    const repository = new PatientSupabaseRepository(context.supabase);
    const result = await repository.create(context.userId, patientData, emergencyContacts);

    if (result.isErr()) {
      return err(result.error);
    }

    const patient = result.value;

    return ok({
      id: patient.id,
      displayName: patient.displayName,
    });
  },
});

/**
 * Server action to create a new patient (psychologist_patients record).
 *
 * Creates the patient record and optionally emergency contacts.
 * Uses repository pattern for data access.
 *
 * @example
 * ```tsx
 * const result = await createPatientAction({
 *   manualFirstName: "João",
 *   manualLastName: "Silva",
 *   manualEmail: "joao@example.com",
 *   manualPhone: "+55 11 98765-4321",
 *   manualDateOfBirth: "2010-05-15",
 *   emergencyContacts: [
 *     { name: "Maria Silva", phone: "+55 11 12345-6789", relationship: "Mãe" }
 *   ]
 * });
 *
 * if (result.success) {
 *   console.log("Patient created:", result.data.id);
 * }
 * ```
 */
export async function createPatientAction(
  input: CreatePatientRequest,
): Promise<SerializedResult<CreatePatientResponse>> {
  const result = await _createPatientAction(input);
  return serializeResult(result);
}
