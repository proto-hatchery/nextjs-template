import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export function WelcomeBannerSkeleton() {
  return <Skeleton className="h-8 w-64" />;
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className={cn(
            "my-2 flex h-[120px] flex-col gap-1.5 border-none bg-muted/50 shadow-none sm:h-[130px] sm:gap-2 lg:h-[150px]",
            i === 3 ? "hidden xl:flex" : "",
          )}
        >
          <div className="flex flex-row items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6">
            <Skeleton className="h-[14px] w-24 bg-muted sm:h-4 sm:w-28 lg:h-[18px] lg:w-32" />
            <Skeleton className="h-4 w-4 rounded-full bg-muted sm:h-5 sm:w-5" />
          </div>

          <div className="flex flex-1 flex-col justify-center px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
            <Skeleton className="h-6 w-20 bg-muted sm:h-[30px] sm:w-24 lg:h-9 lg:w-28" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function UpcomingSessionsSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
