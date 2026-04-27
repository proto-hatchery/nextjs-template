import type { SessionStatus } from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-types"
import { Badge } from "@workspace/ui/components/badge"

const sessionStatusVariantMap: Record<SessionStatus, "default" | "secondary" | "outline"> = {
  Upcoming: "default",
  "Awaiting notes": "secondary",
  Completed: "outline",
}

type SessionStatusBadgeProps = {
  status: SessionStatus
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  return <Badge variant={sessionStatusVariantMap[status]}>{status}</Badge>
}
