"use client";

import { type ReactNode, useCallback, useRef, type WheelEvent as ReactWheelEvent } from "react";

import { PageContainer } from "../../../../_components/layout/page-container";
import { PageContent } from "../../../../_components/layout/page-content";
import { PageHeaderStrip } from "../../../../_components/page-header-strip";

interface DetailPageLayoutProps {
  header: ReactNode;
  navigation?: (scrollRef: React.RefObject<HTMLDivElement | null>) => ReactNode;
  navigationMobile?: (scrollRef: React.RefObject<HTMLDivElement | null>) => ReactNode;
  topNavigation?: (scrollRef: React.RefObject<HTMLDivElement | null>) => ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}

/**
 * Layout genérico para páginas de detalhamento com suporte a 2 ou 3 colunas.
 */
export function DetailPageLayout({
  header,
  navigation,
  navigationMobile,
  topNavigation,
  sidebar,
  children,
}: DetailPageLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasNavigation = typeof navigation === "function";
  const hasSidebar = Boolean(sidebar);

  const handleWheelCapture = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.contains(event.target as Node)) {
      return;
    }

    event.preventDefault();
    container.scrollBy({
      top: event.deltaY,
      left: event.deltaX,
    });
  }, []);

  return (
    <PageContainer>
      <PageHeaderStrip withBackdropBlur>{header}</PageHeaderStrip>

      <PageContent withPadding={false} scrollY={false} className="px-0">
        <div
          className={`grid h-full min-h-0 ${
            hasNavigation && hasSidebar
              ? "md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[240px_minmax(0,1fr)_320px] xl:grid-cols-[240px_minmax(0,1fr)_380px]"
              : hasNavigation
                ? "lg:grid-cols-[240px_minmax(0,1fr)]"
                : hasSidebar
                  ? "md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]"
                  : "grid-cols-[minmax(0,1fr)]"
          }`}
          onWheelCapture={handleWheelCapture}
        >
          {/* Left column - Navigation (no scroll) */}
          {hasNavigation ? (
            <aside className="hidden h-full overflow-hidden lg:block">
              <div className="flex h-full min-h-0 flex-col pt-6 px-4 sm:px-6 lg:px-8">
                <div className="h-full">{navigation?.(scrollContainerRef)}</div>
              </div>
            </aside>
          ) : null}

          {/* Center column - Content (with scroll) */}
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-full min-h-0 flex-col pt-6 px-4 sm:px-6 lg:px-8">
              {topNavigation ? (
                <div className="mb-5">{topNavigation(scrollContainerRef)}</div>
              ) : null}
              {navigationMobile && (
                <div className="mb-5 lg:hidden">{navigationMobile(scrollContainerRef)}</div>
              )}

              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide min-h-0"
              >
                {children}
              </div>
            </div>
          </div>

          {/* Coluna direita - Sidebar (sem scroll, independente) */}
          {sidebar ? (
            <aside className="hidden h-full overflow-hidden md:block">
              <div className="h-full space-y-4 pt-6 px-4 sm:px-6 lg:px-8">{sidebar}</div>
            </aside>
          ) : null}
        </div>
      </PageContent>
    </PageContainer>
  );
}

export function useDetailPageScrollContainer() {
  return useRef<HTMLDivElement | null>(null);
}

export function DetailPageSection({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      {children}
    </section>
  );
}
