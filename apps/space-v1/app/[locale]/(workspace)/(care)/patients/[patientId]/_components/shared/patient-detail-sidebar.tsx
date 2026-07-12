"use client";

import type { PatientWithDetails } from "@workspace/supabase-data/types/entities";
import { usePatientClinicalData } from "@workspace/supabase-data/hooks/patients";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { usePatientSessions } from "@workspace/supabase-data/hooks/sessions";
import { Separator } from "@workspace/ui/components/separator";
import { nowInTimezone, utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, CalendarClock, MapPin, PencilLine, Stethoscope } from "lucide-react";

// Removed unused import: import { formatPatientStatus } from "./patient-detail-subheader-helpers";

const GAUGE_SIZE = 176;
const GAUGE_CENTER = GAUGE_SIZE / 2;
const GAUGE_TICK_COUNT = 72;
const GAUGE_OUTER_RADIUS = 84;
const GAUGE_TICK_LENGTH = 14;
const GAUGE_BRAND_COLOR = "var(--primary)";

const GAUGE_TICKS = Array.from({ length: GAUGE_TICK_COUNT }, (_, index) => {
  const angle = -Math.PI / 2 + (index / GAUGE_TICK_COUNT) * Math.PI * 2;
  const innerRadius = GAUGE_OUTER_RADIUS - GAUGE_TICK_LENGTH;
  const x1 = GAUGE_CENTER + innerRadius * Math.cos(angle);
  const y1 = GAUGE_CENTER + innerRadius * Math.sin(angle);
  const x2 = GAUGE_CENTER + GAUGE_OUTER_RADIUS * Math.cos(angle);
  const y2 = GAUGE_CENTER + GAUGE_OUTER_RADIUS * Math.sin(angle);

  return {
    id: `tick-${index}`,
    x1,
    y1,
    x2,
    y2,
  };
});

interface PatientDetailSidebarProps {
  patient: PatientWithDetails;
  patientId: string;
  caseIndexScore?: number;
  onViewMissing?: () => void;
}

// Risk indicators removed

function formatSince(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function getInterpretation(value: number) {
  if (value >= 80) {
    return { text: "Cadastro considerado completo", color: "#16a34a" };
  }
  if (value >= 60) {
    return { text: "Cadastro parcial", color: "#f97316" };
  }
  return { text: "Cadastro insuficiente", color: "#dc2626" };
}

function Gauge({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  const activeTicks = Math.round((normalized / 100) * GAUGE_TICK_COUNT);
  const inactiveColor = "var(--muted-foreground)";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        aria-hidden="true"
        focusable="false"
        role="presentation"
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
        className="pointer-events-none absolute size-44"
      >
        {GAUGE_TICKS.map((tick, index) => {
          const isActive = index < activeTicks;
          return (
            <line
              key={tick.id}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={isActive ? GAUGE_BRAND_COLOR : inactiveColor}
              strokeOpacity={isActive ? 0.95 : 0.25}
              strokeWidth={2}
              strokeLinecap="square"
            />
          );
        })}
      </svg>

      <div className="relative size-29 rounded-full bg-background/95 gauge-circle flex flex-col items-center justify-center gap-2 backdrop-blur">
        <span className="text-4xl font-light text-foreground tracking-tight">{normalized}</span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
          {normalized} / 100
        </span>
      </div>
    </div>
  );
}

function getSessionWallClockDate(iso: string | null | undefined, timezone?: string): Date | null {
  if (!iso) return null;
  try {
    return utcIsoToWallClockDate(iso, timezone);
  } catch {
    return null;
  }
}

function formatNextSession(iso: string, timezone?: string) {
  const date = getSessionWallClockDate(iso, timezone);
  if (!date) return "—";
  return format(date, "EEE, d 'de' MMM", { locale: ptBR }).replace(/^./, (char) =>
    char.toUpperCase(),
  );
}

export function PatientDetailSidebar({
  patient,
  patientId,
  caseIndexScore = 50,
  onViewMissing,
}: PatientDetailSidebarProps) {
  const normalized = Math.max(0, Math.min(100, Math.round(caseIndexScore)));
  const interpretation = getInterpretation(normalized);
  const userTimezone = usePsychologistTimezone();

  const { data: sessions } = usePatientSessions(patientId);
  const { data: clinicalData } = usePatientClinicalData(patientId);

  const address = patient.address as { city?: string; state?: string } | null;
  const city = address?.city;
  const state = address?.state;

  const now = nowInTimezone(userTimezone);
  const upcomingSessions =
    sessions?.filter((s) => {
      if ((s.status !== "scheduled" && s.status !== "open") || !s.start_time) {
        return false;
      }

      const sessionStart = getSessionWallClockDate(s.start_time, userTimezone);
      return !!sessionStart && sessionStart.getTime() > now.getTime();
    }) ?? [];
  const nextSession = [...upcomingSessions].sort((a, b) => {
    const startA =
      getSessionWallClockDate(a.start_time, userTimezone)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const startB =
      getSessionWallClockDate(b.start_time, userTimezone)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return startA - startB;
  })[0];

  const nextSessionLabel = nextSession?.start_time
    ? formatNextSession(nextSession.start_time, userTimezone)
    : "Sem agendamento";

  const medicationsCount = clinicalData?.medications?.length ?? 0;
  const medicationsLabel =
    medicationsCount === 0
      ? "Nenhuma medicação registrada"
      : medicationsCount === 1
        ? (clinicalData?.medications[0]?.name ?? "N/A")
        : `${medicationsCount} medicações registradas`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full flex-col px-3 md:px-4 lg:px-6 xl:px-8 pt-6 pb-6">
        <div className="mx-auto w-full max-w-[320px] flex flex-col gap-8 pb-8">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={patient.displayName}
              avatarUrl={patient.avatarUrl ?? null}
              className="size-12 rounded-full shadow-sm"
            />
            <div className="flex flex-col min-w-0">
              <h2 className="text-base font-semibold text-foreground truncate leading-tight">
                {patient.displayName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {patient.age ? `${patient.age} anos` : "Idade não informada"}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Case index */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-foreground">Índice do caso</p>
                <p className="text-xs text-muted-foreground">
                  Mede completude de cadastro e engajamento
                </p>
              </div>

              <div className="flex items-center justify-center py-2">
                <Gauge value={normalized} />
              </div>

              <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-foreground">{interpretation.text}</p>
                {onViewMissing ? (
                  <BrandButton
                    variant="link"
                    className="text-sm font-semibold text-primary h-auto p-0"
                    onClick={onViewMissing}
                  >
                    Ver campos faltantes
                    <ArrowUpRight className="ml-1 size-4" />
                  </BrandButton>
                ) : null}
              </div>
            </div>

            <Separator />

            {/* Indicadores */}
            <div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground">Indicadores</p>
                <p className="text-xs text-muted-foreground">
                  Acompanhe informações e sinais importantes
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3 text-left">
                  <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      Localização
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {[city, state].filter(Boolean).join(", ") || "Sem dados"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <CalendarClock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      Próxima sessão
                    </p>
                    <p className="text-sm font-medium text-foreground">{nextSessionLabel}</p>
                    {patient.relationship_start_date ? (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Em acompanhamento desde {formatSince(patient.relationship_start_date)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <Stethoscope className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                      Medicações
                    </p>
                    <p className="text-sm font-medium text-foreground">{medicationsLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            {typeof patient.default_session_price === "number" &&
            patient.default_session_price > 0 ? (
              <>
                <Separator />
                <div className="pb-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-foreground">Precificação</p>
                    <p className="text-xs text-muted-foreground">Preço padrão por sessão</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(patient.default_session_price)}
                    </p>
                  </div>

                  <BrandButton variant="neutral" size="sm" fullWidth disabled>
                    <PencilLine className="mr-2 size-4" />
                    Editar preço
                  </BrandButton>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
