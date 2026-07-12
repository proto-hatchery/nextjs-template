import {
  SkeletonCardGrid,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../_components/page-content-header";
import { PageContentWrapper } from "../../_components/page-content-wrapper";

export default function CommunityLoading() {
  return (
    <>
      <SkeletonMobileHeader />
      <PageContentHeader
        breadcrumbs={
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Home</span>
            <span className="text-muted-foreground">/</span>
            <span>Comunidade</span>
          </div>
        }
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <div className="space-y-6">
              {/* Coming Soon Banner */}
              <div className="h-32 rounded-xl border bg-muted/50 animate-pulse" />

              {/* Community Preview Cards */}
              <SkeletonCardGrid count={4} columns={2} />
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>
    </>
  );
}
