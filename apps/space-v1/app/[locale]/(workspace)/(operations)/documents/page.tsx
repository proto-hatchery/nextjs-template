import { listDocumentTemplatesAction } from "@workspace/supabase-data/actions/documents/list-document-templates";

import { DocumentsPageClient } from "./_components/documents-page-client";

export default async function DocumentsPage() {
  const result = await listDocumentTemplatesAction({});
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return <DocumentsPageClient templates={result.data.templates} />;
}
