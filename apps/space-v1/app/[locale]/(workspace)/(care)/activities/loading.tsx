import {
  SkeletonCardGrid,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../_components/page-content-header";
import { PageContentWrapper } from "../../_components/page-content-wrapper";

export default function ActivitiesLoading() {
  return (
    <>
      <SkeletonMobileHeader />
      <PageContentHeader
        breadcrumbs={
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Home</span>
            <span className="text-muted-foreground">/</span>
            <span>Atividades</span>
          </div>
        }
        actions={<div className="h-8 w-32 bg-muted animate-pulse rounded-md" />}
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <div className="space-y-6">
              {/* Activities Catalog Grid */}
              <SkeletonCardGrid count={8} columns={2} />
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>
    </>
  );
}
