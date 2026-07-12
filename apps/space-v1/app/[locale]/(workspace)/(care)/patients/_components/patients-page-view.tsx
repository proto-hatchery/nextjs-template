"use client";

import { adaptPatientSummariesToLegacyPatients } from "@workspace/supabase-data/hooks/patients";
import { usePatients as usePsychologistPatients } from "@workspace/supabase-data/hooks/patients";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Home, UserCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { PageContentHeader, PageContentWrapper } from "../../../_components/page-content-header";
import type { getPatientsPageData } from "../_lib/get-patients-page-data";
import { CreatePatientDropdownButton } from "./create-patient-dropdown-button";
import { PatientListItem } from "./patient-list-item";

type PatientsPageData = Awaited<ReturnType<typeof getPatientsPageData>>;

export function PatientsPageView({ patients }: PatientsPageData) {
  const { data } = usePsychologistPatients(undefined, {
    initialData: patients,
  });
  const patientsList =
    data ??
    adaptPatientSummariesToLegacyPatients(
      patients.filter((patient) => !("psychologist_id" in patient)),
    );

  return (
    <PageContentHeader
      breadcrumbs={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
                <Home className="size-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="inline-flex items-center gap-1.5">
                <UserCircle className="size-4" />
                Pacientes
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={<CreatePatientDropdownButton />}
    >
      <div className="h-full overflow-y-auto">
        <PageContentWrapper>
          <div className="max-w-5xl space-y-4 py-6">
            <AnimatePresence mode="popLayout">
              {patientsList.map((patient) => (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <PatientListItem patient={patient} />
                </motion.div>
              ))}
            </AnimatePresence>
            {patientsList.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum paciente encontrado.
              </div>
            )}
          </div>
        </PageContentWrapper>
      </div>
    </PageContentHeader>
  );
}
