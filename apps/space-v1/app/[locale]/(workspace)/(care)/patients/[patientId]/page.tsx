import { notFound } from "next/navigation"

import { PatientDetailShell } from "@/app/[locale]/(workspace)/(care)/patients/[patientId]/_components/patient-detail-shell"
import { getPatientProfileById } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-view-model.server"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>
}) {
  const { patientId } = await params
  const patient = await getPatientProfileById(patientId)

  if (!patient) {
    notFound()
  }

  return <PatientDetailShell patient={patient} />
}
