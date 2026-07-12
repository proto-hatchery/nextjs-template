import {
  SkeletonForm,
  SkeletonMobileHeader,
} from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";

export default function PreferencesLoading() {
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
            <span>Preferências</span>
          </div>
        }
      >
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <SkeletonForm fields={5} />
          </PageContentWrapper>
        </div>
      </PageContentHeader>
    </>
  );
}
