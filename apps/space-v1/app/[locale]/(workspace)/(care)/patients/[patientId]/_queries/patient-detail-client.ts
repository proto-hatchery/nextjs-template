import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import type {
  ActivityAssignmentWithActivity,
  GuardianDocument,
  PatientGuardian,
  PatientTest,
} from "@workspace/supabase-data/types/entities";

export interface PatientGuardiansData {
  primary: PatientGuardian | null;
  secondary: PatientGuardian | null;
  documents: GuardianDocument[];
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parsePatientGuardians(value: unknown): PatientGuardian[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const id = typeof row.id === "string" ? row.id : null;
      const patientId = typeof row.patient_id === "string" ? row.patient_id : null;
      const fullName = typeof row.full_name === "string" ? row.full_name : null;
      const guardianType = typeof row.guardian_type === "string" ? row.guardian_type : null;
      const psychologistId = typeof row.psychologist_id === "string" ? row.psychologist_id : null;

      if (!id || !patientId || !fullName || !guardianType || !psychologistId) {
        return null;
      }

      const parsed: PatientGuardian = {
        id,
        name: fullName,
        patient_id: patientId,
        full_name: fullName,
        guardian_type: guardianType,
        psychologist_id: psychologistId,
        city: toNullableString(row.city),
        complement: toNullableString(row.complement),
        country: toNullableString(row.country),
        cpf: toNullableString(row.cpf),
        created_at: toNullableString(row.created_at),
        date_of_birth: toNullableString(row.date_of_birth),
        email: toNullableString(row.email),
        neighborhood: toNullableString(row.neighborhood),
        number: toNullableString(row.number),
        phone: toNullableString(row.phone),
        postal_code: toNullableString(row.postal_code),
        relationship: toNullableString(row.relationship),
        rg: toNullableString(row.rg),
        state: toNullableString(row.state),
        status: toNullableString(row.status),
        street: toNullableString(row.street),
        updated_at: toNullableString(row.updated_at),
      };

      return parsed;
    })
    .filter((item): item is PatientGuardian => item !== null);
}

export async function fetchPatientGuardiansData(patientId: string): Promise<PatientGuardiansData> {
  const supabase = createBrowserAuthClient();

  const [guardiansResponse, documentsResponse] = await Promise.all([
    supabase
      .from("psychologist_patient_guardians")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: true }),
    supabase
      .from("psychologist_patient_guardian_documents")
      .select("id, psychologist_id, guardian_id, patient_id, file_url, created_at, updated_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
  ]);

  if (guardiansResponse.error) {
    throw guardiansResponse.error;
  }

  if (documentsResponse.error) {
    throw documentsResponse.error;
  }

  const guardians = parsePatientGuardians(guardiansResponse.data);
  const primary = guardians.find((g) => g.guardian_type === "primary") ?? guardians[0] ?? null;
  const secondary =
    guardians.find((g) => g.guardian_type === "secondary") ??
    (guardians[0]?.id === primary?.id ? guardians[1] : guardians[0]) ??
    null;

  return {
    primary,
    secondary: secondary?.id === primary?.id ? null : secondary,
    documents: (documentsResponse.data ?? []) as GuardianDocument[],
  };
}

export async function fetchPatientTests(patientId: string): Promise<PatientTest[]> {
  const supabase = createBrowserAuthClient();

  const { data, error } = await supabase
    .from("psychologist_patient_assessments")
    .select(
      "id, patient_id, test_id, test_date, results, interpretation, psychologist_notes, created_at, updated_at",
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as PatientTest[];
}

export async function fetchPatientActivityAssignments(
  patientId: string,
): Promise<ActivityAssignmentWithActivity[]> {
  const supabase = createBrowserAuthClient();

  const { data, error } = await supabase
    .from("psychologist_patient_activities")
    .select(
      `
      *,
      activity:catalog_clinical_activities!patient_activity_assignments_activity_id_fkey(name)
    `,
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ActivityAssignmentWithActivity[];
}
