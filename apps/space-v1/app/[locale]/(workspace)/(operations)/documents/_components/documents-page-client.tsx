"use client";

import type { DocumentTemplate } from "@workspace/supabase-data/hooks/documents";
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query";
import { useState } from "react";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";
import { CreateDocumentModal } from "./create-document-modal";
import { CreateDocumentSheet } from "./create-document-sheet";
import { DocumentsBreadcrumb } from "./documents-breadcrumb";
import { DocumentsGrid } from "./documents-grid";
import { DocumentsHeaderAction } from "./documents-header-action";

interface DocumentsPageClientProps {
  templates: DocumentTemplate[];
}

export function DocumentsPageClient({ templates }: DocumentsPageClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsCreateOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTemplateId(undefined);
    setIsCreateOpen(true);
  };

  return (
    <>
      <PageContentHeader
        breadcrumbs={<DocumentsBreadcrumb />}
        actions={<DocumentsHeaderAction onCreate={handleCreateNew} />}
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <DocumentsGrid templates={templates} onSelectTemplate={handleSelectTemplate} />
          </PageContentWrapper>
        </div>
      </PageContentHeader>

      {/* Mobile: Sheet, Desktop: Modal */}
      {isMobile ? (
        <CreateDocumentSheet
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          {...(selectedTemplateId !== undefined ? { defaultTemplateId: selectedTemplateId } : {})}
        />
      ) : (
        <CreateDocumentModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          {...(selectedTemplateId !== undefined ? { defaultTemplateId: selectedTemplateId } : {})}
        />
      )}
    </>
  );
}
