import type { ChargeWithRelations } from "@workspace/supabase-data/types/entities";
import { buildPatientDisplayName } from "@/compat/supabase/utils/patient-display-name";

type ChargePatient = NonNullable<ChargeWithRelations["patient"]>;

export function resolveBillingPatientName(patient: ChargePatient | null | undefined): string {
  if (!patient) return "Sem nome";

  const derivedManualDisplayName = buildPatientDisplayName({
    name: patient.first_name ?? null,
    surname: patient.last_name ?? null,
    preferredName: patient.preferred_name ?? null,
  });

  return patient.display_name ?? derivedManualDisplayName ?? patient.full_name ?? "Sem nome";
}
