import {
  SkeletonForm,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";

export default function ProfileDataLoading() {
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
            <span>Sobre Mim</span>
          </div>
        }
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <SkeletonForm fields={8} />
          </PageContentWrapper>
        </div>
      </PageContentHeader>
    </>
  );
}
