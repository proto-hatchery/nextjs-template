"use client";

import type { SessionWithDetails } from "@workspace/supabase-data/types/entities";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { startOfDay } from "date-fns";
import { Blend, Home, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PageContentHeader } from "../../../_components/page-content-header";
import { PageContentWrapper } from "../../../_components/page-content-wrapper";
import { SpaceEventCreationModal } from "../../../_components/session-creation/space-event-creation-modal";
import { SessionDayGroup } from "./session-day-group";

interface SessionsPageClientProps {
  sessions: SessionWithDetails[];
}

type SessionWithStartTime = SessionWithDetails & {
  start_time: string;
};

export function SessionsPageClient({ sessions }: SessionsPageClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();
  const userTimezone = usePsychologistTimezone();

  // Group all sessions by date
  const sessionsByDay = useMemo(() => {
    if (!sessions) return new Map<string, SessionWithDetails[]>();

    const sessionsMap = new Map<string, SessionWithDetails[]>();

    sessions
      .filter((session): session is SessionWithStartTime => typeof session.start_time === "string")
      .forEach((session) => {
        const sessionDate = startOfDay(utcIsoToWallClockDate(session.start_time, userTimezone));
        const dateKey = sessionDate.toISOString();

        if (!sessionsMap.has(dateKey)) {
          sessionsMap.set(dateKey, []);
        }
        sessionsMap.get(dateKey)?.push(session);
      });

    return sessionsMap;
  }, [sessions, userTimezone]);

  const breadcrumbs = useMemo(() => {
    return (
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
              <Blend className="size-4" />
              Sessões
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }, []);

  const actions = useMemo(() => {
    return (
      <BrandButton
        variant="default"
        size="sm"
        className="gap-2"
        onClick={() => setIsCreateOpen(true)}
      >
        <Plus className="size-4" />
        Nova sessão
      </BrandButton>
    );
  }, []);

  return (
    <>
      <PageContentHeader breadcrumbs={breadcrumbs} actions={actions}>
        <div className="h-full overflow-y-auto">
          <PageContentWrapper>
            <div className="max-w-5xl space-y-4 md:space-y-8 py-6">
              {sessionsByDay.size > 0 ? (
                Array.from(sessionsByDay.entries())
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([dateKey, daySessions]) => {
                    const sortedDaySessions = daySessions
                      .filter(
                        (session): session is SessionWithStartTime =>
                          typeof session.start_time === "string",
                      )
                      .sort((sessionA, sessionB) => {
                        const dateA = utcIsoToWallClockDate(sessionA.start_time, userTimezone);
                        const dateB = utcIsoToWallClockDate(sessionB.start_time, userTimezone);

                        return dateB.getTime() - dateA.getTime();
                      });

                    if (sortedDaySessions.length === 0) {
                      return null;
                    }

                    const [latestSession] = sortedDaySessions;

                    if (!latestSession) {
                      return null;
                    }

                    const status = latestSession.status ?? "scheduled";
                    const timelineColor =
                      status === "completed" || status === "cancelled" || status === "no_show"
                        ? "green"
                        : "blue";

                    return (
                      <SessionDayGroup
                        key={dateKey}
                        date={new Date(dateKey)}
                        sessions={sortedDaySessions}
                        timelineColor={timelineColor}
                      />
                    );
                  })
                  .filter((group): group is React.JSX.Element => group !== null)
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma sessão encontrada</p>
                  <BrandButton
                    variant="neutral"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <Plus className="size-4" />
                    Criar primeira sessão
                  </BrandButton>
                </div>
              )}
            </div>
          </PageContentWrapper>
        </div>
      </PageContentHeader>

      <SpaceEventCreationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          router.refresh(); // Refresh server data
        }}
      />
    </>
  );
}
