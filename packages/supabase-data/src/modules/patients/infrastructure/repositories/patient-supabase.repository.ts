import { ok, err, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type PatientGuardian,
  type GuardianDocument,
  type PatientRepository,
} from "../../domain/ports/patient-repository.port";
import {
  PatientDTO,
  PatientWithContactsDTO,
  PatientsCollectionDTO,
  EmergencyContactDTO,
  PatientAssessment,
  PatientActivityWithDetails,
  PatientClinicalData,
  PatientClinicalCondition,
  PatientClinicalMedication,
  type PatientFilters,
} from "../../domain/dto/patient.dto";
import { AppError, AppErrorCode } from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import {
  fromDatabaseRow,
  fromDatabaseRowToSummary,
  fromEmergencyContactRow,
  withEmergencyContacts,
  toDatabaseInsert,
  fromAssessmentRow,
  fromActivityAssignmentRow,
} from "../mappers/patient.mapper";

/** Shape returned by the guardians select (subset of Row). */
type GuardianSelectRow = Pick<
  Database["public"]["Tables"]["psychologist_patient_guardians"]["Row"],
  | "id"
  | "guardian_type"
  | "full_name"
  | "relationship"
  | "phone"
  | "email"
  | "patient_id"
  | "created_at"
>;
/** Shape returned by the guardian documents select (subset of Row). */
type GuardianDocumentSelectRow = Pick<
  Database["public"]["Tables"]["psychologist_patient_guardian_documents"]["Row"],
  | "id"
  | "psychologist_id"
  | "guardian_id"
  | "patient_id"
  | "file_url"
  | "file_name"
  | "document_type"
  | "title"
  | "created_at"
  | "updated_at"
>;
type AssessmentRow = Database["public"]["Tables"]["psychologist_patient_assessments"]["Row"];
type ActivityAssignmentRow = Database["public"]["Tables"]["psychologist_patient_activities"]["Row"];
type ClinicalItemRow = Database["public"]["Tables"]["psychologist_patient_medical_items"]["Row"];
/** Join shape from activities select; activity.name may be null from DB. */
type ActivityAssignmentRowWithActivity = ActivityAssignmentRow & {
  activity: {
    name: string | null;
    description: string | null;
    activity_kind: string | null;
    duration_min: number | null;
  } | null;
};

const toClinicalCondition = (row: ClinicalItemRow): PatientClinicalCondition => ({
  id: row.id,
  name: row.name ?? "",
  conditionType: row.kind ?? null,
  diagnosedDate: row.diagnosed_date,
  icd10Code: row.icd10_code,
  status: row.is_active ? "active" : "resolved",
  notes: row.notes,
  source: "therapist",
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
});

const toClinicalMedication = (row: ClinicalItemRow): PatientClinicalMedication => ({
  id: row.id,
  name: row.name ?? "",
  dosage: row.dosage,
  frequency: row.frequency,
  route: null,
  startDate: row.start_date,
  endDate: row.end_date,
  isActive: row.is_active,
  prescribedBy: null,
  reason: null,
  notes: row.notes,
  source: "therapist",
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
});

/**
 * Supabase implementation of PatientRepository
 *
 * This is the ONLY file that imports Database types from database.types.ts
 * All other layers work with domain DTOs.
 */
export class PatientSupabaseRepository implements PatientRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientDTO | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_patients")
        .select("*")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .is("deleted_at", null)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return ok(null);
        }
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch patient"));
      }

      if (!data) {
        return ok(null);
      }

      const patientDTO = fromDatabaseRow(data);
      return ok(patientDTO);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching patient"));
    }
  }

  async findByIdWithContacts(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientWithContactsDTO | null, AppError>> {
    try {
      const patientResult = await this.findById(patientId, psychologistId);
      if (patientResult.isErr()) {
        return err(patientResult.error);
      }

      const patient = patientResult.value;
      if (!patient) {
        return ok(null);
      }

      const { data: contactsData, error: contactsError } = await this.supabase
        .from("psychologist_patient_emergency_contacts")
        .select("id, psychologist_patient_id, contact_name, phone, relationship, created_at")
        .eq("psychologist_patient_id", patientId)
        .order("created_at", { ascending: true });

      if (contactsError) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch emergency contacts"),
        );
      }

      const contacts = (contactsData || []).map(fromEmergencyContactRow);
      return ok(withEmergencyContacts(patient, contacts));
    } catch (_error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Unexpected error fetching patient with contacts",
        ),
      );
    }
  }

  async findAll(
    psychologistId: string,
    options: PatientFilters = {},
  ): Promise<Result<PatientsCollectionDTO, AppError>> {
    try {
      const {
        status,
        search,
        isMinor,
        dateFrom,
        dateTo,
        patientIds,
        limit = 100,
        offset = 0,
      } = options;

      let query = this.supabase
        .from("psychologist_patients")
        .select("*", { count: "exact" })
        .eq("psychologist_id", psychologistId)
        .is("deleted_at", null);

      if (status) {
        if (Array.isArray(status)) {
          query = query.in("status", status);
        } else {
          query = query.eq("status", status);
        }
      } else {
        query = query.neq("status", "archived").is("archived_at", null);
      }

      if (isMinor !== undefined) {
        query = query.eq("is_minor", isMinor);
      }

      if (patientIds && patientIds.length > 0) {
        query = query.in("id", patientIds);
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("created_at", dateTo);
      }

      if (search) {
        const searchTerm = `%${search}%`;
        query = query.or(
          `display_name.ilike.${searchTerm},full_name.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},preferred_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`,
        );
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch patients"));
      }

      const patients = (data || []).map(fromDatabaseRowToSummary);
      const totalCount = count ?? 0;
      const hasMore = totalCount > offset + limit;

      return ok({
        patients,
        totalCount,
        hasMore,
      });
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching patients"));
    }
  }

  async create(
    psychologistId: string,
    patient: Omit<PatientDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "archivedAt">,
    emergencyContacts: readonly EmergencyContactDTO[] = [],
  ): Promise<Result<PatientDTO, AppError>> {
    try {
      const insertData = toDatabaseInsert(patient);

      const { data: patientData, error: patientError } = await this.supabase
        .from("psychologist_patients")
        .insert({
          psychologist_id: psychologistId,
          ...insertData,
        })
        .select()
        .single();

      if (patientError || !patientData) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create patient"));
      }

      if (emergencyContacts.length > 0) {
        const contactsToInsert = emergencyContacts.map((contact) => ({
          psychologist_patient_id: patientData.id,
          contact_name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship ?? null,
        }));

        const { error: contactsError } = await this.supabase
          .from("psychologist_patient_emergency_contacts")
          .insert(contactsToInsert);

        // Ignore contacts error - patient was created successfully
      }

      const createdPatient = fromDatabaseRow(patientData);
      return ok(createdPatient);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error creating patient"));
    }
  }

  async update(
    patientId: string,
    psychologistId: string,
    updates: Partial<
      Omit<PatientDTO, "id" | "psychologistId" | "createdAt" | "updatedAt" | "archivedAt">
    >,
    emergencyContacts?: readonly EmergencyContactDTO[],
  ): Promise<Result<PatientDTO, AppError>> {
    try {
      const updateData = toDatabaseInsert(updates);
      const hasUpdates = Object.keys(updateData).length > 0;

      // Only update patient table if there are actual fields to update
      if (hasUpdates) {
        const { data: patientData, error: patientError } = await this.supabase
          .from("psychologist_patients")
          .update(updateData)
          .eq("id", patientId)
          .eq("psychologist_id", psychologistId)
          .select()
          .single();

        if (patientError || !patientData) {
          if (patientError?.code === "PGRST116") {
            return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
          }
          return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to update patient"));
        }
      }

      // Always handle emergency contacts if provided
      if (emergencyContacts !== undefined) {
        await this.supabase
          .from("psychologist_patient_emergency_contacts")
          .delete()
          .eq("psychologist_patient_id", patientId);

        if (emergencyContacts.length > 0) {
          const contactsToInsert = emergencyContacts.map((contact) => ({
            psychologist_patient_id: patientId,
            contact_name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship ?? null,
          }));

          const { error: contactsError } = await this.supabase
            .from("psychologist_patient_emergency_contacts")
            .insert(contactsToInsert);

          // Ignore contacts error - patient was updated successfully
        }
      }

      // Fetch updated patient data
      const { data: finalPatientData, error: fetchError } = await this.supabase
        .from("psychologist_patients")
        .select()
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (fetchError || !finalPatientData) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      const updatedPatient = fromDatabaseRow(finalPatientData);
      return ok(updatedPatient);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error updating patient"));
    }
  }

  async archive(patientId: string, psychologistId: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from("psychologist_patients")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to archive patient"));
      }

      return ok(undefined);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error archiving patient"));
    }
  }

  async unarchive(patientId: string, psychologistId: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from("psychologist_patients")
        .update({ archived_at: null })
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to unarchive patient"));
      }

      return ok(undefined);
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error unarchiving patient"),
      );
    }
  }

  async changeStatus(
    patientId: string,
    psychologistId: string,
    isActive: boolean,
  ): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from("psychologist_patients")
        .update({ status: isActive ? "active" : "inactive" })
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to change patient status"));
      }

      return ok(undefined);
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error changing patient status"),
      );
    }
  }

  async exists(patientId: string, psychologistId: string): Promise<Result<boolean, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_patients")
        .select("id")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return ok(false);
        }
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to check patient existence"),
        );
      }

      return ok(!!data);
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error checking patient existence"),
      );
    }
  }

  async count(
    psychologistId: string,
    options: { status?: string | string[] } = {},
  ): Promise<Result<number, AppError>> {
    try {
      const { status } = options;

      let query = this.supabase
        .from("psychologist_patients")
        .select("id", { count: "exact", head: true })
        .eq("psychologist_id", psychologistId)
        .is("deleted_at", null);

      if (status) {
        if (Array.isArray(status)) {
          query = query.in("status", status);
        } else {
          query = query.eq("status", status);
        }
      } else {
        query = query.neq("status", "archived");
      }

      const { count, error } = await query;

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to count patients"));
      }

      return ok(count ?? 0);
    } catch (_error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error counting patients"));
    }
  }

  async getGuardiansData(
    patientId: string,
    psychologistId: string,
  ): Promise<
    Result<
      {
        primary: PatientGuardian | null;
        secondary: PatientGuardian | null;
        documents: GuardianDocument[];
      },
      AppError
    >
  > {
    try {
      const [guardiansResponse, documentsResponse] = await Promise.all([
        this.supabase
          .from("psychologist_patient_guardians")
          .select(
            "id, guardian_type, full_name, relationship, phone, email, patient_id, created_at",
          )
          .eq("patient_id", patientId)
          .eq("psychologist_id", psychologistId)
          .order("created_at", { ascending: true }),
        this.supabase
          .from("psychologist_patient_guardian_documents")
          .select(
            "id, psychologist_id, guardian_id, patient_id, file_url, file_name, document_type, title, created_at, updated_at",
          )
          .eq("patient_id", patientId)
          .eq("psychologist_id", psychologistId)
          .order("created_at", { ascending: false }),
      ]);

      if (guardiansResponse.error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, guardiansResponse.error.message, {
            originalError: guardiansResponse.error,
          }),
        );
      }

      if (documentsResponse.error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, documentsResponse.error.message, {
            originalError: documentsResponse.error,
          }),
        );
      }

      const guardians = (guardiansResponse.data ?? []).map((g: GuardianSelectRow) => ({
        id: g.id,
        name: g.full_name ?? "",
        relationship: g.relationship,
        phone: g.phone,
        email: g.email,
        cpf: null, // CPF not in this table
        guardian_type: g.guardian_type,
      }));
      const primary = guardians.find((g) => g.guardian_type === "primary") ?? guardians[0] ?? null;
      const secondary =
        guardians.find((g) => g.guardian_type === "secondary") ??
        (guardians[0]?.id === primary?.id ? guardians[1] : guardians[0]) ??
        null;

      return ok({
        primary,
        secondary: secondary?.id === primary?.id ? null : secondary,
        documents: (documentsResponse.data ?? []).map((d: GuardianDocumentSelectRow) => ({
          id: d.id,
          name: d.file_name ?? d.title ?? "Documento",
          type: d.document_type,
          fileUrl: d.file_url,
          createdAt: d.created_at,
        })),
      });
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching guardians data"),
      );
    }
  }

  async getAssessments(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientAssessment[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_patient_assessments")
        .select(
          "id, patient_id, test_name, test_type, applied_at, notes, file_url, status, created_at, updated_at",
        )
        .eq("patient_id", patientId)
        .eq("psychologist_id", psychologistId)
        .order("created_at", { ascending: false });

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch assessments"));
      }

      const rows = (data ?? []) as AssessmentRow[];
      return ok(rows.map(fromAssessmentRow));
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching assessments"),
      );
    }
  }

  async getActivities(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientActivityWithDetails[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_patient_activities")
        .select(
          `
          *,
          activity:catalog_clinical_activities!patient_activity_assignments_activity_id_fkey(
            name,
            description,
            activity_kind,
            duration_min
          )
        `,
        )
        .eq("patient_id", patientId)
        .eq("psychologist_id", psychologistId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch activities"));
      }

      const rows = (data ?? []) as ActivityAssignmentRowWithActivity[];
      return ok(
        rows.map((row) =>
          fromActivityAssignmentRow({
            ...row,
            activity: row.activity ? { ...row.activity, name: row.activity.name ?? "" } : null,
          }),
        ),
      );
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching activities"),
      );
    }
  }

  async getClinicalData(
    patientId: string,
    psychologistId: string,
  ): Promise<Result<PatientClinicalData, AppError>> {
    try {
      const { data: patientRow, error } = await this.supabase
        .from("psychologist_patients")
        .select("id, psychologist_id, patient_id")
        .eq("id", patientId)
        .eq("psychologist_id", psychologistId)
        .single();

      if (error) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch patient clinical header"),
        );
      }

      if (!patientRow) {
        return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
      }

      const { data: medicalItems, error: medicalError } = await this.supabase
        .from("psychologist_patient_medical_items")
        .select("*")
        .eq("psychologist_patient_id", patientId)
        .eq("psychologist_id", psychologistId)
        .order("created_at", { ascending: false });

      if (medicalError) {
        return err(
          AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch patient clinical data"),
        );
      }

      const rows = (medicalItems ?? []) as ClinicalItemRow[];
      const conditions = rows
        .filter((row) => row.kind !== "medication_intake")
        .map(toClinicalCondition);
      const medications = rows
        .filter((row) => row.kind === "medication_intake")
        .map(toClinicalMedication);

      return ok({
        patientId: patientRow.id,
        psychologistId: patientRow.psychologist_id,
        hasLinkedClientAccount: !!patientRow.patient_id,
        initialComplaint: null,
        conditions,
        medications,
      });
    } catch (_error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Unexpected error fetching clinical data"),
      );
    }
  }
}
