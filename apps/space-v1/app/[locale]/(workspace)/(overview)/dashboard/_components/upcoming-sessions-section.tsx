"use client";

import { useUpcomingSessions } from "@workspace/supabase-data/hooks/sessions";

import type { UpcomingSession } from "../types/session";
import { UpcomingSessionsSkeleton } from "./skeletons";
import { UpcomingSessionsClient } from "./upcoming-sessions-client";

const DEFAULT_LIMIT = 8;
const DEFAULT_STATUS: UpcomingSession["status"] = "scheduled";

function normalizeSessionStatus(status: string | null | undefined): UpcomingSession["status"] {
  if (
    status === "scheduled" ||
    status === "open" ||
    status === "completed" ||
    status === "cancelled" ||
    status === "no_show"
  ) {
    return status;
  }
  return DEFAULT_STATUS;
}

export function UpcomingSessionsSection() {
  const { data: sessions, isPending, error } = useUpcomingSessions(DEFAULT_LIMIT);

  if (isPending) {
    return <UpcomingSessionsSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
        Não foi possível carregar as próximas sessões agora.
      </div>
    );
  }

  const upcomingSessions: UpcomingSession[] =
    sessions
      ?.filter(
        (session): session is typeof session & { id: string; start_time: string } =>
          !!session.id && !!session.start_time,
      )
      .map((session) => {
        const sessionType = session.locationName ? "presencial" : "online";

        return {
          id: session.id,
          timeISO: session.start_time,
          clientName: session.patientName ?? "Paciente",
          status: normalizeSessionStatus(session.status),
          sessionType,
          ...(session.locationName ? { location: session.locationName } : {}),
          price: session.snapshot_price_cents ?? session.price ?? null,
          paymentStatus: session.charge?.payment_status ?? null,
          isConfirmed: session.status === "scheduled",
          reminderSent: false,
        };
      }) ?? [];

  return <UpcomingSessionsClient sessions={upcomingSessions} />;
}
