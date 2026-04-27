import { notFound } from "next/navigation"

import { DocumentEditorShell } from "@/app/[locale]/(workspace)/(operations)/documents/_components/document-editor-shell"
import { getDocumentById } from "@/app/[locale]/(workspace)/(operations)/documents/_lib/document-view-model.server"

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = await params
  const document = await getDocumentById(documentId)

  if (!document) {
    notFound()
  }

  return <DocumentEditorShell mode="detail" document={document} />
}
