import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";

export function calculateCaseIndexScore(patient: PatientWithDetails | null | undefined): number {
  if (!patient) return 0;
  let score = 0;
  if (patient.displayName) score += 20;
  if (patient.phone) score += 15;
  if (patient.email) score += 10;
  if (patient.dateOfBirth) score += 10;
  return Math.min(100, score);
}
