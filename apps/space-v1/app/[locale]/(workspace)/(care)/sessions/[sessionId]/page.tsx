import { notFound } from "next/navigation"

import { SessionDetailShell } from "@/app/[locale]/(workspace)/(care)/sessions/[sessionId]/_components/session-detail-shell"
import { getSessionRecordById } from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-view-model.server"

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const session = await getSessionRecordById(sessionId)

  if (!session) {
    notFound()
  }

  return <SessionDetailShell session={session} />
}
