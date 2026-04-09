import { notFound } from "next/navigation"

import { NoteEditorShell } from "@/app/[locale]/(workspace)/(operations)/notes/_components/note-editor-shell"
import { getNoteById } from "@/app/[locale]/(workspace)/(operations)/notes/_lib/note-view-model.server"

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>
}) {
  const { noteId } = await params
  const note = await getNoteById(noteId)

  if (!note) {
    notFound()
  }

  return <NoteEditorShell mode="detail" note={note} />
}
