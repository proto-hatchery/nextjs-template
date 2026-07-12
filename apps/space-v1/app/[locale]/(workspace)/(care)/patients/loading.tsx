import {
  SkeletonList,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../_components/page-content-header";
import { PageContentWrapper } from "../../_components/page-content-wrapper";

export default function PatientsLoading() {
  return (
    <>
      <SkeletonMobileHeader />
      <PageContentHeader
        breadcrumbs={
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Home</span>
            <span className="text-muted-foreground">/</span>
            <span>Pacientes</span>
          </div>
        }
        actions={<div className="h-8 w-32 bg-muted animate-pulse rounded-md" />}
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <div className="max-w-5xl space-y-4 py-6">
              <SkeletonList count={6} hasMetadata />
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>
    </>
  );
}
