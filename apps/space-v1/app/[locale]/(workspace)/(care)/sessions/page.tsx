import { SessionsBoardShell } from "@/app/[locale]/(workspace)/(care)/sessions/_components/sessions-board-shell"
import { getSessionsBoardView } from "@/app/[locale]/(workspace)/(care)/sessions/_lib/session-view-model.server"

export default async function SessionsPage() {
  return <SessionsBoardShell boardView={await getSessionsBoardView()} />
}
