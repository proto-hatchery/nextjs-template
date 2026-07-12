import { Skeleton } from "@workspace/ui/components/skeleton";

export function SessionListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-5 border-b border-border px-4 -mx-4"
        >
          <div className="flex items-center gap-4">
            {/* Date Box Skeleton */}
            <Skeleton className="h-12 w-12 rounded-md" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
