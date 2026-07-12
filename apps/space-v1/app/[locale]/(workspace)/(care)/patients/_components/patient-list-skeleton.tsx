import { Skeleton } from "@workspace/ui/components/skeleton";

export function PatientListSkeleton() {
  return (
    <div className="max-w-5xl space-y-4 py-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-full max-w-xl">
          <div className="bg-muted/50 rounded-xl border border-border/60 p-5">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-3 w-52" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
