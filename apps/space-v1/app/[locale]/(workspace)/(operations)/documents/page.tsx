import { DocumentsLibraryShell } from "@/app/[locale]/(workspace)/(operations)/documents/_components/documents-library-shell"
import type { DocumentsFilterState } from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-types"
import { getDocumentsLibraryView } from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-view-model.server"

type DocumentsPageSearchParams = {
  query?: string
  status?: string
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<DocumentsPageSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const filters: DocumentsFilterState = {
    query: resolvedSearchParams.query ?? "",
    status:
      resolvedSearchParams.status === "Draft" ||
      resolvedSearchParams.status === "Needs review" ||
      resolvedSearchParams.status === "Shared"
        ? resolvedSearchParams.status
        : "all",
  }

  return <DocumentsLibraryShell documentsView={await getDocumentsLibraryView(filters)} />
}
