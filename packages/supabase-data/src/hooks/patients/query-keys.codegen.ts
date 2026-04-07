/**
 * TanStack Query key factory for domain "patients".
 * Import keys from this module only — avoid string literals in hooks/components.
 * 
 * @module @workspace/supabase-data/hooks/patients/query-keys.codegen
 * codegen:actions-hooks (generated) — do not hand-edit
 */
export const patientsQueryKeys = {
  all: ["patients"] as const,
  psychologistPatientActivities: () => [...patientsQueryKeys.all, "psychologist-patient-activities"] as const,
  psychologistPatientActivitiesList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatientActivities(), "list", filters ?? {}] as const,
  psychologistPatientAssessments: () => [...patientsQueryKeys.all, "psychologist-patient-assessments"] as const,
  psychologistPatientAssessmentsList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatientAssessments(), "list", filters ?? {}] as const,
  psychologistPatientEmergencyContacts: () => [...patientsQueryKeys.all, "psychologist-patient-emergency-contacts"] as const,
  psychologistPatientEmergencyContactsList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatientEmergencyContacts(), "list", filters ?? {}] as const,
  psychologistPatientGuardians: () => [...patientsQueryKeys.all, "psychologist-patient-guardians"] as const,
  psychologistPatientGuardiansList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatientGuardians(), "list", filters ?? {}] as const,
  psychologistPatientMedicalItems: () => [...patientsQueryKeys.all, "psychologist-patient-medical-items"] as const,
  psychologistPatientMedicalItemsList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatientMedicalItems(), "list", filters ?? {}] as const,
  psychologistPatientServices: () => [...patientsQueryKeys.all, "psychologist-patient-services"] as const,
  psychologistPatientServicesList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatientServices(), "list", filters ?? {}] as const,
  psychologistPatients: () => [...patientsQueryKeys.all, "psychologist-patients"] as const,
  psychologistPatientsList: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.psychologistPatients(), "list", filters ?? {}] as const,
}
