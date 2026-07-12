import { BillingMobileSkeleton, BillingTableSkeleton } from "./_components/billing-skeleton";

export default function BillingLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header da página (breadcrumb + ação) */}
      <div className="hidden md:flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 border-b border-border/50">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Home</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm">Cobranças</span>
        </div>

        {/* Botão Nova cobrança */}
        <div className="h-8 w-36 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-4 w-10 bg-muted animate-pulse rounded-md" />
          <span className="text-muted-foreground">/</span>
          <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop */}
          <div className="hidden md:block">
            <BillingTableSkeleton />
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <BillingMobileSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
