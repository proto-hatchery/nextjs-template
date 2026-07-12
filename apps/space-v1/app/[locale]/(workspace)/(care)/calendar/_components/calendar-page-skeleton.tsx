export function CalendarPageSkeleton() {
  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-full">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-28 bg-muted animate-pulse rounded-md ml-2" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="py-2 text-center">
                <div className="h-3 w-6 bg-muted animate-pulse rounded-md mx-auto" />
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-px bg-border/50">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="bg-background p-1">
                <div className="h-3 w-3 bg-muted animate-pulse rounded-md mb-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex w-72 min-h-0 flex-col border-l-2 overflow-visible">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-visible px-6 py-4">
            <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />

            <div className="flex justify-center w-full">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                  <div className="flex items-center gap-1">
                    <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                    <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-3 w-3 bg-muted animate-pulse rounded-md mx-auto"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: 28 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-6 w-6 bg-muted animate-pulse rounded-full mx-auto"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded-md" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
