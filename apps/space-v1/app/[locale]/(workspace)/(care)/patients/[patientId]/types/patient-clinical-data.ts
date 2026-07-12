/**
 * Re-export clinical data types from @workspace/supabase-data/types/entities.
 * This file is kept for backwards compatibility with existing imports.
 * New code should import directly from @workspace/supabase-data/types/entities.
 */
export type {
  ClinicalDataSource,
  ClinicalNoteType,
  PatientClinicalCondition,
  PatientClinicalData,
  PatientClinicalMedication,
  RiskLevelType,
} from "@workspace/supabase-data/types/entities";
