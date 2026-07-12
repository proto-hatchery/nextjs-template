"use client";

import { DocumentCard } from "@/compat/features/patients/ui/document-card";
import type { DocumentTemplate } from "@workspace/supabase-data/hooks/documents";

import { formatDocumentDate, getDocumentCategoryLabel } from "../_lib/utils";
import { DocumentsEmptyState } from "./documents-empty-state";

interface DocumentsGridProps {
  templates: DocumentTemplate[];
  onSelectTemplate: (templateId: string) => void;
}

export function DocumentsGrid({ templates, onSelectTemplate }: DocumentsGridProps) {
  if (templates.length === 0) {
    return <DocumentsEmptyState />;
  }

  return (
    <ul className="grid gap-0">
      {templates.map((template) => {
        return (
          <DocumentCard
            key={template.id}
            title={template.title}
            category={getDocumentCategoryLabel(template.template_category)}
            description={template.description ?? "Sem descrição disponível."}
            date={formatDocumentDate(template)}
            onOpenTemplate={() => onSelectTemplate(template.id)}
          />
        );
      })}
    </ul>
  );
}
