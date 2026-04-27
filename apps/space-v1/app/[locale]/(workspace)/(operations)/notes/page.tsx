import { NotesWorkbenchShell } from "@/app/[locale]/(workspace)/(operations)/notes/_components/notes-workbench-shell"
import type { NotesFilterState } from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-types"
import { getNotesWorkbenchView } from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-view-model.server"

type NotesPageSearchParams = {
  query?: string
  status?: string
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<NotesPageSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const filters: NotesFilterState = {
    query: resolvedSearchParams.query ?? "",
    status:
      resolvedSearchParams.status === "Draft" ||
      resolvedSearchParams.status === "Needs review" ||
      resolvedSearchParams.status === "Signed"
        ? resolvedSearchParams.status
        : "all",
  }

  return <NotesWorkbenchShell notesView={await getNotesWorkbenchView(filters)} />
}
