import type { DocumentTemplate } from "@workspace/supabase-data/hooks/documents";

import { DOCUMENT_TYPE_MAP } from "./constants";

export function getDocumentCategoryLabel(category?: string | null): string {
  if (!category) return "Geral";
  return DOCUMENT_TYPE_MAP[category.toLowerCase()] ?? category;
}

export function formatDocumentDate(template: DocumentTemplate): string {
  const date = template.updated_at ?? template.created_at ?? new Date().toISOString();
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}
