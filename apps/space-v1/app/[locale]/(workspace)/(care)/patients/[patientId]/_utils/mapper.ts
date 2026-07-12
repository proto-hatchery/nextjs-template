import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";
import { parsePatientDocuments } from "@/compat/supabase/utils/json-field-parsers";

import type { PatientRecordCollections, PatientRecordSection } from "../types";

interface AddressFields {
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

/**
 * Normalize WhatsApp session reminders toggle from DB/UI/API to boolean.
 * Default is on when unknown (matches column default and product expectation).
 * Avoid Boolean("false") === true.
 */
export function coerceWhatsappSessionRemindersValue(value: unknown): boolean {
  if (value === false || value === "false" || value === 0) {
    return false;
  }
  if (value === true || value === "true" || value === 1) {
    return true;
  }
  return true;
}

export function mapPatientToRecordCollections(
  patient: PatientWithDetails,
): PatientRecordCollections {
  // Helper to get address fields safely
  const address: AddressFields | null = (patient.address as AddressFields | null) ?? null;
  const lastUpdated = patient.updated_at ?? patient.created_at;
  const mappedPhone = patient.phone;

  const personalSection: PatientRecordSection = {
    id: "personal",
    title: "Informações Pessoais",
    fields: [
      {
        key: "firstName",
        label: "Nome",
        value: patient.first_name ?? null,
        required: true,
      },
      {
        key: "lastName",
        label: "Sobrenome(s)",
        value: patient.last_name ?? null,
        required: true,
      },
      {
        key: "socialName",
        label: "Nome preferido",
        value: patient.preferred_name,
      },
      {
        key: "dateOfBirth",
        label: "Data de nascimento",
        value: patient.date_of_birth,
        required: true,
        type: "date",
      },
      {
        key: "phone",
        label: "Telefone",
        value: patient.phone,
        type: "phone",
      },
      {
        key: "whatsappRemindersEnabled",
        label: "Lembretes por WhatsApp",
        value: coerceWhatsappSessionRemindersValue(
          patient.notifications_whatsapp_session_reminders,
        ),
        type: "boolean",
      },
      {
        key: "email",
        label: "E-mail",
        value: patient.email,
        type: "email",
      },
      { key: "cpf", label: "CPF", value: patient.cpf, required: true },
      { key: "address", label: "Endereço", value: address?.street ?? null, type: "text" },
    ],
    ...(typeof lastUpdated === "string" ? { lastUpdated } : {}),
  };

  const identificationSection: PatientRecordSection = {
    id: "identification",
    title: "Identificação",
    fields: [],
  };

  const contactSection: PatientRecordSection = {
    id: "contact",
    title: "Contato",
    fields: [
      { key: "number", label: "Número", value: address?.number ?? null },
      { key: "complement", label: "Complemento", value: address?.complement ?? null },
      { key: "neighborhood", label: "Bairro", value: address?.neighborhood ?? null },
      { key: "city", label: "Cidade", value: address?.city ?? null },
      { key: "state", label: "Estado", value: address?.state ?? null },
      { key: "postalCode", label: "CEP", value: address?.postalCode ?? null },
      { key: "country", label: "País", value: address?.country ?? null },
    ],
  };

  return {
    patientId: patient.id,
    fullName:
      patient.full_name ??
      patient.display_name ??
      [patient.first_name, patient.last_name].filter(Boolean).join(" ").trim(),
    status: patient.status ?? "active",
    ...(patient.avatarUrl !== undefined ? { avatarUrl: patient.avatarUrl ?? null } : {}),
    ...(typeof address?.city === "string" ? { city: address.city } : {}),
    ...(typeof address?.state === "string" ? { state: address.state } : {}),
    ...(typeof mappedPhone === "string" ? { phone: mappedPhone } : {}),
    isDataIncomplete: false,
    nextSessionAt: null,
    lastSessionDate: null,
    totalSessionsCount: 0,
    relationshipStartDate: patient.created_at,
    isMinor: Boolean(patient.is_minor ?? false),
    requiresLegalGuardian: Boolean(patient.requires_legal_guardian ?? false),
    hasInformedConsent: false,
    hasClinicalNotes: false,
    sections: [personalSection, identificationSection, contactSection],
    documentsSummary: parsePatientDocuments(patient.attached_documents),
  };
}
