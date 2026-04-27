import { PatientsDirectoryShell } from "@/app/[locale]/(workspace)/(care)/patients/_components/patients-directory-shell"
import type { PatientDirectoryFilterState } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-types"
import { getPatientDirectoryView } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-view-model.server"

type PatientsPageSearchParams = {
  query?: string
  status?: string
  sort?: string
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<PatientsPageSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const filters: PatientDirectoryFilterState = {
    query: resolvedSearchParams.query ?? "",
    status:
      resolvedSearchParams.status === "Active care" ||
      resolvedSearchParams.status === "Needs follow-up" ||
      resolvedSearchParams.status === "Intake scheduled" ||
      resolvedSearchParams.status === "Stepped down"
        ? resolvedSearchParams.status
        : "all",
    sort:
      resolvedSearchParams.sort === "next-session" ||
      resolvedSearchParams.sort === "recent-activity"
        ? resolvedSearchParams.sort
        : "name",
  }

  return <PatientsDirectoryShell directoryView={await getPatientDirectoryView(filters)} />
}
