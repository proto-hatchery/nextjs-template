"use client";

import { RiAddLine, RiArrowDownSLine, RiArrowUpSLine, RiPencilLine } from "@remixicon/react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2TimeSegmented } from "@workspace/forms/components/specialized/v2/fluri-field-v2-time-segmented";
import { Switch } from "@workspace/ui/components/switch";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

import {
  getLocationSelectValue,
  normalizeAvailabilityIntervalForLocations,
  ONLINE_LOCATION_SENTINEL,
  type WeeklyAvailabilityInterval,
} from "../../../_lib/availability-delivery";

interface IntervalRowProps {
  index: number;
  interval: WeeklyAvailabilityInterval;
  onUpdate: (interval: WeeklyAvailabilityInterval) => void;
  onDelete: () => void;
  canDelete: boolean;
  locations: { id: string; name: string }[];
  initialEditing?: boolean;
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-[110px]">
      <FluriFieldV2TimeSegmented
        label={label}
        value={value}
        onChange={(event) => {
          const val = event.target.value;
          if (val?.length === 4) {
            onChange(`${val.slice(0, 2)}:${val.slice(2, 4)}`);
          }
        }}
        size="md"
      />
    </div>
  );
}

const DELIVERY_LABEL: Record<string, string> = {
  hybrid: "Presencial + Online",
  telehealth: "Somente Online",
  in_person: "Somente Presencial",
};

export function IntervalRow({
  index,
  interval,
  onUpdate,
  onDelete,
  canDelete,
  locations,
  initialEditing = false,
}: IntervalRowProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const resolvedInterval = normalizeAvailabilityIntervalForLocations(
    interval,
    locations[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<WeeklyAvailabilityInterval>(() => resolvedInterval);

  useEffect(() => {
    setDraft(normalizeAvailabilityIntervalForLocations(interval, locations[0]?.id ?? null));
  }, [interval, locations]);

  const isOnlineOnly = (draft.deliveryMode as string) === "telehealth" && !draft.locationId;
  const locationName = locations.find((location) => location.id === resolvedInterval.locationId)?.name;
  const locationDisplayName =
    locationName ??
    ((resolvedInterval.deliveryMode as string) === "telehealth" ? "Remoto" : "Local obrigatório");

  const handleSave = () => {
    onUpdate(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(resolvedInterval);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-2xl bg-muted/40 p-5 shadow-none pointer-events-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex flex-col shrink-0 md:w-1/2 md:max-w-[50%]">
            <h3 className="text-lg font-semibold leading-tight tracking-tight">Editar Horário</h3>
            {draft.startTime && draft.endTime && (
              <p className="mt-0.5 text-sm font-medium text-muted-foreground tabular-nums">
                {draft.startTime} - {draft.endTime}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Configure o horário de início, fim, local de atendimento e modalidade.
            </p>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex gap-3">
              <TimeInput
                label="Início"
                value={draft.startTime}
                onChange={(value) => setDraft((current) => ({ ...current, startTime: value }))}
              />
              <TimeInput
                label="Fim"
                value={draft.endTime}
                onChange={(value) => setDraft((current) => ({ ...current, endTime: value }))}
              />
            </div>

            <FluriFieldV2Select
              label="Local de Atendimento"
              value={getLocationSelectValue(draft)}
              onValueChange={(value) => {
                if (value === ONLINE_LOCATION_SENTINEL) {
                  setDraft((current) => ({
                    ...current,
                    locationId: null,
                    deliveryMode: "telehealth",
                  }));
                  return;
                }

                setDraft((current) => ({
                  ...current,
                  locationId: value ?? null,
                  deliveryMode:
                    current.deliveryMode === "telehealth" && value
                      ? "hybrid"
                      : current.deliveryMode,
                }));
              }}
              options={[
                { value: ONLINE_LOCATION_SENTINEL, label: "Remoto" },
                ...locations.map((location) => ({ value: location.id, label: location.name })),
              ]}
              showClearButton={false}
              fullWidth
            />

            <div
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3",
                isOnlineOnly ? "bg-muted/30" : "bg-muted/50",
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isOnlineOnly ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  Disponível Online
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnlineOnly
                    ? "Definido automaticamente pelo modo Remoto"
                    : "Habilitar atendimentos por videochamada neste horário"}
                </p>
              </div>
              <Switch
                id={`edit-online-${draft.id}`}
                checked={draft.deliveryMode === "hybrid" || draft.deliveryMode === "telehealth"}
                onCheckedChange={(checked) => {
                  if (isOnlineOnly) return;
                  setDraft((current) => ({
                    ...current,
                    deliveryMode: checked ? "hybrid" : "in_person",
                  }));
                }}
                className="data-checked:bg-[#34C759]"
                disabled={isOnlineOnly}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                {canDelete && (
                  <BrandButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive/70 hover:bg-destructive/5 hover:text-destructive"
                    onClick={onDelete}
                  >
                    Remover
                  </BrandButton>
                )}
              </div>
              <div className="flex gap-2">
                <BrandButton type="button" variant="ghost" size="sm" onClick={handleCancel}>
                  Cancelar
                </BrandButton>
                <BrandButton type="button" variant="secondary" size="sm" onClick={handleSave}>
                  Salvar
                </BrandButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-4 rounded-2xl bg-muted/40 px-4 py-3 pointer-events-auto">
      <div className="shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {index}
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
        <div className="shrink-0 sm:min-w-[130px]">
          <p className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:block leading-none mb-1">
            Horário
          </p>
          <p className="text-sm font-normal text-foreground tabular-nums">
            {resolvedInterval.startTime} - {resolvedInterval.endTime}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:block leading-none mb-1">
            Local
          </p>
          <p className="text-sm font-normal text-foreground truncate">{locationDisplayName}</p>
        </div>

        <div className="hidden sm:block min-w-[160px]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-1">
            Modalidade
          </p>
          <p className="text-sm font-normal text-foreground">
            {DELIVERY_LABEL[resolvedInterval.deliveryMode] ?? resolvedInterval.deliveryMode}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <BrandButton
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:text-primary hover:bg-primary/5"
          onClick={() => setIsEditing(true)}
        >
          <RiPencilLine className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">Editar</span>
        </BrandButton>
      </div>
    </div>
  );
}

interface WeeklyDayEditorProps {
  dayOfWeek: number;
  isActive: boolean;
  intervals: WeeklyAvailabilityInterval[];
  onToggleDay: (active: boolean) => void;
  onAddInterval: () => void;
  onUpdateInterval: (intervalId: string, updates: WeeklyAvailabilityInterval) => void;
  onDeleteInterval: (intervalId: string) => void;
  onApplyToWeekdays: () => void;
  onOpenMobile?: (day: number) => void;
  locations: { id: string; name: string }[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const WEEKDAYS = [1, 2, 3, 4, 5];

export function WeeklyDayEditor({
  dayOfWeek,
  isActive,
  intervals,
  onToggleDay,
  onAddInterval,
  onUpdateInterval,
  onDeleteInterval,
  onApplyToWeekdays,
  onOpenMobile,
  locations,
  isExpanded: isExpandedProp,
  onToggleExpand,
}: WeeklyDayEditorProps) {
  const [isExpandedLocal, setIsExpandedLocal] = useState(false);
  const isMobile = useIsMobile();
  const isExpanded = isExpandedProp ?? isExpandedLocal;

  const setIsExpanded = (value: boolean | ((previous: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(isExpanded) : value;
    if (onToggleExpand && next !== isExpanded) {
      onToggleExpand();
    } else {
      setIsExpandedLocal(next);
    }
  };

  useEffect(() => {
    if (!isActive && isExpandedProp === undefined) setIsExpandedLocal(false);
  }, [isActive, isExpandedProp]);

  const handleHeaderClick = (event: MouseEvent) => {
    const effectiveIsMobile =
      isMobile ?? (typeof window !== "undefined" && window.innerWidth < 1024);

    if (effectiveIsMobile) {
      onOpenMobile?.(dayOfWeek);
      return;
    }

    if ((event.target as HTMLElement).closest("button, [role='switch'], .radix-switch")) {
      return;
    }

    if (!isActive) {
      onToggleDay(true);
      setIsExpanded(true);
      return;
    }

    setIsExpanded((previous) => !previous);
  };

  const isWeekday = WEEKDAYS.includes(dayOfWeek);

  return (
    <>
      <div className={cn("group relative rounded-xl transition-all duration-300 bg-muted/30")}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleHeaderClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleHeaderClick(event as unknown as MouseEvent);
            }
          }}
          className="flex items-center justify-between px-4 py-4 sm:py-3 min-h-[64px] sm:min-h-[52px] select-none cursor-pointer"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pointer-events-none">
            {isActive && !isMobile && (
              <span className="text-muted-foreground shrink-0">
                {isExpanded ? (
                  <RiArrowUpSLine className="h-4 w-4" />
                ) : (
                  <RiArrowDownSLine className="h-4 w-4" />
                )}
              </span>
            )}
            <span
              className={cn(
                "text-[15px] sm:text-[13px] font-medium truncate",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {DAYS_OF_WEEK[dayOfWeek]}
            </span>
            {isActive && intervals.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-muted-foreground/15 text-[11px] font-semibold text-muted-foreground shrink-0 tabular-nums">
                {intervals.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {!isMobile && (
              <BrandButton
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  "text-[11px] font-medium transition-opacity duration-150",
                  isExpanded && isActive && isWeekday
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  onApplyToWeekdays();
                }}
              >
                Aplicar na semana
              </BrandButton>
            )}
            <div className={cn(isMobile && "pointer-events-auto")}>
              <Switch
                id={`day-${dayOfWeek}`}
                checked={isActive}
                onCheckedChange={(checked) => {
                  if (isMobile) {
                    if (!checked) {
                      onToggleDay(false);
                    } else {
                      onOpenMobile?.(dayOfWeek);
                    }
                  } else {
                    onToggleDay(checked);
                  }
                }}
                className="scale-[1.4] sm:scale-[0.8] shadow-none data-checked:bg-[#34C759]"
                onClick={(event) => {
                  if (isMobile && !isActive) {
                    event.stopPropagation();
                    onOpenMobile?.(dayOfWeek);
                  } else {
                    event.stopPropagation();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isMobile && isActive && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex flex-col gap-2 pl-4"
            onClick={(event) => event.stopPropagation()}
          >
            <AnimatePresence initial={false}>
              {intervals.map((interval, index) => (
                <motion.div
                  key={interval.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <IntervalRow
                    index={index + 1}
                    interval={interval}
                    onUpdate={(updates) => onUpdateInterval(interval.id, updates)}
                    onDelete={() => onDeleteInterval(interval.id)}
                    canDelete={intervals.length > 1}
                    locations={locations}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-center py-1 pointer-events-auto">
              <BrandButton
                type="button"
                variant="ghost"
                size="small"
                className="text-[13px] font-medium text-foreground/80 hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddInterval();
                }}
              >
                <RiAddLine className="h-4 w-4 mr-1.5" />
                Adicionar intervalo
              </BrandButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
