import { SkeletonDocumentList } from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentWrapper } from "../../_components/page-content-wrapper";

export default function DocumentsLoading() {
  return (
    <div className="h-full overflow-y-auto">
      <PageContentWrapper>
        {/* Document List Skeleton - matches new horizontal card layout */}
        <SkeletonDocumentList count={6} />
      </PageContentWrapper>
    </div>
  );
}
