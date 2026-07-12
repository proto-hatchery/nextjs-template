/**
 * Skeleton Compositions
 *
 * Page-level skeleton components for optimistic navigation loading states.
 * These provide pixel-accurate, layout-faithful placeholders while data loads.
 *
 * @example
 * // In loading.tsx
 * export default function Loading() {
 *   return <SkeletonPageHeader />;
 * }
 */

import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

// ============================================================================
// Page Structure Skeletons
// ============================================================================

/**
 * Standard page header skeleton with breadcrumbs and optional actions
 * Matches: PageContentHeader component structure
 */
function SkeletonPageHeader({
  actionCount = 1,
  hasExtension = false,
}: {
  actionCount?: number;
  hasExtension?: boolean;
}) {
  return (
    <header className="hidden md:block shrink-0 bg-background">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center min-w-0 flex-1 gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {Array.from({ length: actionCount }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32" />
          ))}
        </div>
      </div>

      {/* Extension area (filters, etc) */}
      {hasExtension && (
        <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3 bg-muted/5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Mobile page header skeleton
 * Matches: MobilePageHeader component structure
 */
function SkeletonMobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border/50">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-8" />
    </div>
  );
}

// ============================================================================
// Content Skeletons
// ============================================================================

/**
 * Stat card skeleton for dashboard/finances pages
 * Matches: Stats cards in home page and finances
 */
function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border rounded-xl bg-muted/50 p-4 sm:p-5 lg:p-6",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between">
        <Skeleton className="h-[14px] w-24 sm:h-4 sm:w-28 lg:h-[18px] lg:w-32" />
        <Skeleton className="h-4 w-4 rounded-full sm:h-5 sm:w-5" />
      </div>
      <div className="flex flex-1 flex-col justify-center pt-2">
        <Skeleton className="h-6 w-20 sm:h-[30px] sm:w-24 lg:h-9 lg:w-28" />
      </div>
    </div>
  );
}

/**
 * Grid of stat cards
 */
function SkeletonStatCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} className={i === 2 ? "hidden xl:flex" : ""} />
      ))}
    </div>
  );
}

/**
 * Patient/Session list item skeleton
 * Matches: PatientListItem and SessionCard components
 */
function SkeletonListItem({ hasMetadata = true }: { hasMetadata?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        {hasMetadata && <Skeleton className="h-3 w-48" />}
      </div>
      <Skeleton className="h-8 w-8 shrink-0" />
    </div>
  );
}

/**
 * List of items skeleton
 */
function SkeletonList({
  count = 6,
  hasMetadata = true,
}: {
  count?: number;
  hasMetadata?: boolean;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} hasMetadata={hasMetadata} />
      ))}
    </div>
  );
}

/**
 * Table skeleton with header and rows
 * Matches: BillingTable and similar data tables
 */
function SkeletonTable({
  columns = 5,
  rows = 6,
  hasHeader = true,
}: {
  columns?: number;
  rows?: number;
  hasHeader?: boolean;
}) {
  return (
    <div className="rounded-md border">
      {hasHeader && (
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-4", i === 0 ? "w-32" : i === columns - 1 ? "w-20" : "w-24")}
              />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={cn(
                  "h-4",
                  colIdx === 0 ? "w-32" : colIdx === columns - 1 ? "w-20" : "w-24",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Document/Card grid item skeleton
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Horizontal document card skeleton
 * Matches: DocumentCard component with horizontal layout (image + content side by side)
 */
function SkeletonDocumentCard() {
  return (
    <li>
      <div className="grid gap-6 rounded-lg p-4 grid-cols-[200px_1fr]">
        {/* Image Preview */}
        <Skeleton className="h-36 w-full rounded-md" />

        {/* Content */}
        <div className="flex flex-col space-y-2">
          {/* Title */}
          <Skeleton className="h-6 w-48" />

          {/* Metadata Row */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-2" /> {/* separator dot */}
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Description - line-clamp-3 equivalent */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * List of horizontal document cards skeleton
 */
function SkeletonDocumentList({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-0">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDocumentCard key={i} />
      ))}
    </ul>
  );
}

/**
 * Grid of cards skeleton
 */
function SkeletonCardGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Calendar cell skeleton
 */
function SkeletonCalendarCell() {
  return (
    <div className="aspect-square p-1">
      <Skeleton className="h-full w-full rounded-md" />
    </div>
  );
}

/**
 * Full calendar skeleton
 * Matches: CalendarPageLayout structure with sidebar
 */
function SkeletonCalendar() {
  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Main calendar area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Calendar header - mais delicado */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-28 ml-2" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Week day headers - mais delicado */}
        <div className="grid grid-cols-7 border-b">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2 text-center">
              <Skeleton className="h-3 w-6 mx-auto" />
            </div>
          ))}
        </div>

        {/* Calendar grid - mais delicado, sem eventos fictícios */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-px bg-border/50">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-background p-1">
              <Skeleton className="h-3 w-3 mb-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar - matches CalendarPageLayout sidebar */}
      <div className="hidden lg:flex w-72 min-h-0 flex-col border-l-2 overflow-visible">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-visible px-6 py-4">
          {/* Agendar button */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Mini calendar area */}
          <div className="flex justify-center w-full">
            <div className="w-full space-y-3">
              {/* Mini calendar header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
              {/* Mini calendar grid - mais delicado */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-3 mx-auto" />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-6 mx-auto rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Filters area */}
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-16" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Chat interface skeleton
 * Matches: FluriChat component structure
 */
function SkeletonChatInterface() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row" : "flex-row-reverse")}>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className={cn("space-y-2 max-w-[70%]", i % 2 === 0 ? "items-start" : "items-end")}>
              <Skeleton className={cn("h-16 w-48", i % 2 === 0 ? "rounded-lg" : "rounded-lg")} />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Quick actions grid skeleton (for /all page)
 */
function SkeletonQuickActions() {
  return (
    <div className="px-4 py-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Navigation grid skeleton (for /all page explore section)
 */
function SkeletonNavGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="px-4 py-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton for settings/preferences pages
 */
function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// ============================================================================
// Page Layout Wrapper
// ============================================================================

/**
 * Standard page content wrapper with consistent padding
 * Matches: PageContentWrapper component
 */
function SkeletonPageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 sm:px-6 lg:px-8 py-0 md:py-6", className)}>{children}</div>;
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Page structure
  SkeletonPageHeader,
  SkeletonMobileHeader,
  SkeletonPageContent,

  // Content primitives
  SkeletonStatCard,
  SkeletonStatCards,
  SkeletonListItem,
  SkeletonList,
  SkeletonTable,
  SkeletonCard,
  SkeletonCardGrid,
  SkeletonDocumentCard,
  SkeletonDocumentList,
  SkeletonCalendarCell,
  SkeletonCalendar,
  SkeletonChatInterface,
  SkeletonQuickActions,
  SkeletonNavGrid,
  SkeletonForm,
};
