import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";

export function getDisplayName(patient: Partial<PatientWithDetails>): string {
  return patient.displayName ?? patient.full_name ?? patient.preferred_name ?? "Sem nome";
}

export function getDisplayPhone(patient: Partial<PatientWithDetails>): string | undefined {
  return patient.phone ?? undefined;
}

export function hasAccount(patient: Partial<PatientWithDetails>): boolean {
  return !!patient.patient_id;
}
