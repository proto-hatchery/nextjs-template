/**
 * Zod schemas for Patient DTOs
 *
 * These schemas mirror the TypeScript interfaces in patient.dto.ts
 * for contract testing and runtime validation (ADR-014).
 *
 * @module @workspace/supabase/patients/domain/dto
 */

import { z } from "zod";

/**
 * Schema for patient address information
 *
 * Mirrors: {@link PatientAddressDTO}
 */
export const PatientAddressDTOSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Inferred type for patient address from schema
 */
export type PatientAddressDTOFromSchema = z.infer<typeof PatientAddressDTOSchema>;

/**
 * Schema for emergency contact information
 *
 * Mirrors: {@link EmergencyContactDTO}
 */
export const EmergencyContactDTOSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string().optional(),
});

/**
 * Inferred type for emergency contact from schema
 */
export type EmergencyContactDTOFromSchema = z.infer<typeof EmergencyContactDTOSchema>;

/**
 * Schema for attached documents (compatibility-safe JSONB shape)
 *
 * Mirrors: {@link PatientAttachedDocumentsDTO}
 */
export const PatientAttachedDocumentsDTOSchema = z
  .record(z.string(), z.unknown())
  .or(z.array(z.unknown()))
  .nullable();

/**
 * Inferred type for attached documents from schema
 */
export type PatientAttachedDocumentsDTOFromSchema = z.infer<
  typeof PatientAttachedDocumentsDTOSchema
>;

/**
 * Schema for core patient information (read model)
 *
 * Mirrors: {@link PatientDTO}
 */
export const PatientDTOSchema = z.object({
  id: z.string(),
  psychologistId: z.string(),

  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  preferredName: z.string().nullable(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().nullable(), // YYYY-MM-DD
  cpf: z.string().nullable(),
  gender: z.string().nullable(),
  address: PatientAddressDTOSchema.nullable(),
  preferredContactMethod: z.string().nullable(),
  notificationsWhatsappSessionReminders: z.boolean(),
  patientOrigin: z.string().nullable(),
  attachedDocuments: PatientAttachedDocumentsDTOSchema,
  clinicalNotes: z.string().nullable(),
  isSynced: z.boolean(),
  lastSynced: z.string().nullable(),

  // Computed/derived fields
  displayName: z.string(), // Built from available name fields
  isMinor: z.boolean(), // Calculated from date of birth
  age: z.number().nullable(), // Calculated from date of birth

  // Session defaults
  defaultSessionPrice: z.number().nullable(),

  // Metadata
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});

/**
 * Inferred type for patient DTO from schema
 */
export type PatientDTOFromSchema = z.infer<typeof PatientDTOSchema>;

/**
 * Schema for lightweight patient summary (for lists)
 *
 * Mirrors: {@link PatientSummaryDTO}
 */
export const PatientSummaryDTOSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  isMinor: z.boolean(),
  isActive: z.boolean(),
  defaultSessionPrice: z.number().nullable(),
});

/**
 * Inferred type for patient summary from schema
 */
export type PatientSummaryDTOFromSchema = z.infer<typeof PatientSummaryDTOSchema>;

/**
 * Schema for patient with emergency contacts (extended read model)
 *
 * Mirrors: {@link PatientWithContactsDTO}
 */
export const PatientWithContactsDTOSchema = PatientDTOSchema.extend({
  emergencyContacts: z.array(EmergencyContactDTOSchema),
});

/**
 * Inferred type for patient with contacts from schema
 */
export type PatientWithContactsDTOFromSchema = z.infer<typeof PatientWithContactsDTOSchema>;
