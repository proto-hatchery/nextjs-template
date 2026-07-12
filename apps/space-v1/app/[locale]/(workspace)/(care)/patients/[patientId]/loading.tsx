import { Skeleton } from "@workspace/ui/components/skeleton";
import { SkeletonList } from "@workspace/brand/patterns/components/skeleton-compositions";

import { PageContentHeader } from "../../../_components/page-content-header";

export default function PatientDetailLoading() {
  return (
    <PageContentHeader
      breadcrumbs={
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Home</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Pacientes</span>
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-32" />
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
        </div>
      }
    >
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="bg-background shrink-0 border-b">
            <div className="flex items-center gap-1 p-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-md" />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6 max-w-[52rem]">
              <Skeleton className="h-48 w-full rounded-xl" />
              <SkeletonList count={4} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:flex w-[380px] shrink-0 bg-muted/10 border-l border-border/50 flex-col">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageContentHeader>
  );
}
