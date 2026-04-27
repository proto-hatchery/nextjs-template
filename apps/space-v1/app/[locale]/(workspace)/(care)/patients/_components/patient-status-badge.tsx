import type { PatientStatus } from "@/app/[locale]/(workspace)/(care)/patients/_lib/patient-types"
import { Badge } from "@workspace/ui/components/badge"

const patientStatusVariantMap: Record<PatientStatus, "default" | "secondary" | "outline"> = {
  "Active care": "default",
  "Needs follow-up": "secondary",
  "Intake scheduled": "outline",
  "Stepped down": "outline",
}

type PatientStatusBadgeProps = {
  status: PatientStatus
}

export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  return <Badge variant={patientStatusVariantMap[status]}>{status}</Badge>
}
