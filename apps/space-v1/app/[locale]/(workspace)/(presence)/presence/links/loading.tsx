import {
  SkeletonCard,
  SkeletonList,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";

export default function LinksLoading() {
  return (
    <>
      <SkeletonMobileHeader />
      <PageContentHeader
        breadcrumbs={
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Home</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Meu Site</span>
            <span className="text-muted-foreground">/</span>
            <span>Linktree</span>
          </div>
        }
        actions={<div className="h-8 w-32 bg-muted animate-pulse rounded-md" />}
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <div className="space-y-6 max-w-2xl">
              <SkeletonCard />
              <SkeletonList count={5} hasMetadata={false} />
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>
    </>
  );
}
