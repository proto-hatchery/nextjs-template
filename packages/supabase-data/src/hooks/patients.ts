"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";

import { getPatientActivitiesAction } from "../actions/patients/get-patient-activities";
import { getPatientAssessmentsAction } from "../actions/patients/get-patient-assessments";
import { getPatientClinicalDataAction } from "../actions/patients/get-patient-clinical-data";
import { getPatientCountAction } from "../actions/patients/get-patient-count";
import { getPatientGuardiansDataAction } from "../actions/patients/get-patient-guardians-data";
import { getPatientWithContactsAction } from "../actions/patients/get-patient-with-contacts";
import { getPatientAction } from "../actions/patients/get-patient";
import { getPatientsAction } from "../actions/patients/get-patients";
import { ActionError } from "../lib/boundary/action-error";
import { unwrapActionResult } from "../lib/boundary/unwrap-action";
import type {
  PatientActivityWithDetails,
  PatientAssessment,
  PatientClinicalData,
  PatientFilters,
  PatientSummaryDTO,
  PatientWithContactsDTO,
} from "../modules/patients/domain/dto/patient.dto";
import type { PatientWithDetails } from "../types/entities";
import { queryKeys } from "../utils/query-keys";
import {
  adaptPatientDTOToLegacyPatient,
  adaptPatientSummariesToLegacyPatients,
  adaptPatientSummaryToLegacyPatient,
} from "./patient-dto-adapter";

export {
  adaptPatientDTOToLegacyPatient,
  adaptPatientSummariesToLegacyPatients,
  adaptPatientSummaryToLegacyPatient,
} from "./patient-dto-adapter";
export { ActionError };

const PatientsResponseSchema = z.object({
  patients: z.array(z.any()),
});
const PatientResponseSchema = z.object({
  patient: z.any(),
});
const PatientCountSchema = z.object({
  count: z.number(),
});
const PatientActivitiesSchema = z.object({
  activities: z.array(z.any()),
});
const PatientAssessmentsSchema = z.object({
  assessments: z.array(z.any()),
});
const PatientGuardiansSchema = z.object({
  primary: z.any().nullable(),
  secondary: z.any().nullable(),
  documents: z.array(z.any()),
});

export function usePatients(
  filters?: PatientFilters,
  options?: {
    enabled?: boolean;
    initialData?: readonly PatientWithDetails[] | readonly PatientSummaryDTO[];
  },
) {
  const { enabled = true, initialData } = options ?? {};
  const normalizedInitialData = initialData
    ? initialData.map((patient) =>
        "psychologist_id" in patient
          ? patient
          : adaptPatientSummaryToLegacyPatient(patient, { psychologistId: "" }),
      )
    : undefined;

  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: async () => {
      const data = unwrapActionResult(
        await getPatientsAction({
          status: filters?.status,
          search: filters?.search,
          isMinor: filters?.isMinor,
          dateFrom: filters?.dateFrom,
          dateTo: filters?.dateTo,
          patientIds: filters?.patientIds,
          limit: filters?.limit,
          offset: filters?.offset,
        }),
        PatientsResponseSchema,
      );

      return adaptPatientSummariesToLegacyPatients(data.patients, {
        psychologistId: "",
      });
    },
    enabled,
    ...(normalizedInitialData ? { initialData: normalizedInitialData } : {}),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatient(
  patientId: string | undefined,
): UseQueryResult<PatientWithDetails | null, Error> {
  return useQuery({
    queryKey: queryKeys.patients.detail(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return null;

      const data = unwrapActionResult(await getPatientAction({ patientId }), PatientResponseSchema);

      return adaptPatientDTOToLegacyPatient(data.patient);
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientWithContacts(
  patientId: string | undefined,
): UseQueryResult<PatientWithContactsDTO | null, Error> {
  return useQuery({
    queryKey: [...queryKeys.patients.detail(patientId ?? ""), "with-contacts"],
    queryFn: async () => {
      if (!patientId) return null;

      const data = unwrapActionResult(
        await getPatientWithContactsAction({ patientId }),
        PatientResponseSchema,
      );

      return data.patient as PatientWithContactsDTO;
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

export const usePsychologistPatients = usePatients;
export const usePsychologistPatientDetails = usePatient;

export function usePatientCount(status?: string | string[]): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: [...queryKeys.patients.all, "count", status],
    queryFn: async () => {
      const data = unwrapActionResult(await getPatientCountAction({ status }), PatientCountSchema);
      return data.count;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientActivities(
  patientId: string | undefined,
): UseQueryResult<PatientActivityWithDetails[], Error> {
  return useQuery({
    queryKey: queryKeys.patients.activities(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return [];

      const data = unwrapActionResult(
        await getPatientActivitiesAction({ patientId }),
        PatientActivitiesSchema,
      );
      return data.activities as PatientActivityWithDetails[];
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientAssessments(
  patientId: string | undefined,
): UseQueryResult<PatientAssessment[], Error> {
  return useQuery({
    queryKey: queryKeys.tests.byPatient(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return [];

      const data = unwrapActionResult(
        await getPatientAssessmentsAction({ patientId }),
        PatientAssessmentsSchema,
      );
      return data.assessments as PatientAssessment[];
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientGuardiansData(patientId: string | undefined): UseQueryResult<
  {
    primary: unknown | null;
    secondary: unknown | null;
    documents: unknown[];
  } | null,
  Error
> {
  return useQuery({
    queryKey: queryKeys.patients.guardians(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return null;

      return unwrapActionResult(
        await getPatientGuardiansDataAction({ patientId }),
        PatientGuardiansSchema,
      );
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientClinicalData(
  patientId: string | undefined,
): UseQueryResult<PatientClinicalData | null, Error> {
  return useQuery({
    queryKey: queryKeys.patients.clinicalData(patientId ?? ""),
    queryFn: async () => {
      if (!patientId) return null;

      const response = await getPatientClinicalDataAction({ patientId });
      if (!response.success) {
        throw new Error(response.error?.message ?? "Failed to fetch patient clinical data");
      }

      return response.data.clinicalData;
    },
    enabled: Boolean(patientId),
    staleTime: 5 * 60 * 1000,
  });
}
