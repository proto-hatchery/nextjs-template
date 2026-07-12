"use client";

import type { ActivityReference } from "@workspace/supabase-data/types/entities";
import { useActivitiesInfinite } from "@workspace/supabase-data/hooks/catalogs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Home, Send, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";
import { ActivitiesGrid } from "./activities-grid";
import { ActivitiesInfiniteScroll } from "./activities-infinite-scroll";
import { ActivityDetailsDialog } from "./activity-details-dialog";

export function ActivitiesPageClient() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityReference | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useActivitiesInfinite(12);

  const activities = useMemo(() => {
    const pages = (data as { pages: { activities: ActivityReference[] }[] } | undefined)?.pages;
    return pages?.flatMap((page) => page.activities) ?? [];
  }, [data]);

  useEffect(() => {
    if (!isDetailsOpen) {
      setSelectedActivity(null);
    }
  }, [isDetailsOpen]);

  const breadcrumbs = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home" className="inline-flex items-center gap-1.5">
            <Home className="size-4" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="inline-flex items-center gap-1.5">
            <Target className="size-4" />
            Atividades
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  const actions = (
    <BrandButton
      variant="primary"
      size="small"
      onClick={() => {
        setSelectedActivity(null);
        setIsDetailsOpen(true);
      }}
    >
      <Send className="size-4 mr-2" />
      Atribuir atividade
    </BrandButton>
  );

  return (
    <>
      <PageContentHeader breadcrumbs={breadcrumbs} actions={actions}>
        <div className="h-full overflow-y-auto">
          <PageContentWrapper className="py-6 md:py-8">
            <div className="flex flex-col gap-8">
              <ActivitiesGrid
                activities={activities}
                isPending={isPending}
                onActivitySelect={(activity) => {
                  setSelectedActivity(activity);
                  setIsDetailsOpen(true);
                }}
              />

              <ActivitiesInfiniteScroll
                hasNextPage={!!hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={() => {
                  void fetchNextPage();
                }}
                hasItems={activities.length > 0}
              />
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>

      <ActivityDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        activity={selectedActivity}
      />
    </>
  );
}
