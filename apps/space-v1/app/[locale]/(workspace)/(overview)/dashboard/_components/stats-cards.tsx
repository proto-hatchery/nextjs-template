import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { Info as InformationCircleIcon } from "lucide-react";

import type { DashboardStats, StatCardData, StatValue } from "../types/dashboard-stats";

interface StatsCardsProps {
  stats: DashboardStats;
}

function StatCardHeader({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6">
      <p className="text-muted-foreground text-sm font-normal sm:text-base lg:text-lg">{label}</p>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InformationCircleIcon
              className="text-muted-foreground hover:text-foreground size-4 cursor-help sm:size-5"
              aria-label={`Informações sobre ${label}`}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardHeader>
  );
}

function StatMainValue({ value }: { value: StatValue }) {
  if (value.type === "currency") {
    return (
      <div className="text-foreground text-2xl font-bold sm:text-3xl lg:text-4xl">
        {value.value}
      </div>
    );
  }

  if (value.type === "counter") {
    return (
      <div className="flex flex-row items-center gap-1">
        <span className="text-foreground text-2xl font-bold sm:text-3xl lg:text-4xl">
          {value.current}
        </span>
        <span className="text-muted-foreground text-base font-normal sm:text-lg lg:text-xl">
          de {value.total}
        </span>
      </div>
    );
  }

  return null;
}

function StatCard({ data, className }: { data: StatCardData; className?: string }) {
  const { label, tooltip, mainValue } = data;

  return (
    <Card
      className={cn(
        "my-2 flex h-[120px] p-0 flex-col border-none bg-muted/50 shadow-none transition-all hover:bg-muted/70 sm:h-[130px] lg:h-[150px]",
        className,
      )}
    >
      <StatCardHeader label={label} tooltip={tooltip} />

      <CardContent className="flex flex-1 flex-col px-4 sm:px-5 lg:px-6">
        <StatMainValue value={mainValue} />
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData: StatCardData[] = [
    {
      id: "sessions-completed",
      label: "Sessões realizadas",
      tooltip: "Número de sessões completadas neste mês",
      mainValue: {
        type: "counter",
        current: stats.sessions_completed.toString(),
        total: stats.sessions_completed.toString(),
      },
      hasGoal: false,
    },
    {
      id: "monthly-revenue",
      label: "Receita mensal",
      tooltip: "Receita total faturada no mês atual",
      mainValue: {
        type: "currency",
        value: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(stats.monthly_revenue),
      },
      hasGoal: false,
    },
    {
      id: "active-patients",
      label: "Pacientes ativos",
      tooltip: "Pacientes com pelo menos uma sessão nos últimos 30 dias",
      mainValue: {
        type: "counter",
        current: stats.active_patients.toString(),
        total: stats.active_patients.toString(),
      },
      hasGoal: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.id}
          data={stat}
          className={index === statsData.length - 1 ? "hidden xl:flex" : ""}
        />
      ))}
    </div>
  );
}
