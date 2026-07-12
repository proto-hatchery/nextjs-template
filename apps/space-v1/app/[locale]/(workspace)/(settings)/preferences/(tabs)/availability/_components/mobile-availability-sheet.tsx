"use client";

import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { saveWeeklyAvailabilityConfigAction } from "@workspace/supabase-data/actions/availability/save-weekly-availability-config";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import { animate, AnimatePresence, motion, type PanInfo, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  getDefaultDeliveryMode,
  getLocationSelectValue,
  normalizeAvailabilityIntervalsForLocations,
  ONLINE_LOCATION_SENTINEL,
  type WeeklyAvailabilityInterval,
  type WeeklyDayConfig,
} from "../../../_lib/availability-delivery";

interface MobileAvailabilitySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialDay: number;
  localConfig: Record<number, WeeklyDayConfig>;
  onUpdateConfig: (updatedDays: Record<number, WeeklyDayConfig>) => void;
  locations: { id: string; name: string }[];
}

const DAYS = [
  { id: 1, label: "S", fullName: "Segunda-feira" },
  { id: 2, label: "T", fullName: "Terça-feira" },
  { id: 3, label: "Q", fullName: "Quarta-feira" },
  { id: 4, label: "Q", fullName: "Quinta-feira" },
  { id: 5, label: "S", fullName: "Sexta-feira" },
  { id: 6, label: "S", fullName: "Sábado" },
  { id: 0, label: "D", fullName: "Domingo" },
];

const TIME_OPTIONS = (() => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of ["00", "30"]) {
      options.push(`${hour.toString().padStart(2, "0")}:${minute}`);
    }
  }
  return options;
})();

function createLunchSplitIntervals(defaultLocationId?: string | null): WeeklyAvailabilityInterval[] {
  const deliveryMode = getDefaultDeliveryMode(defaultLocationId);

  return [
    {
      id: `interval-${Date.now()}-1`,
      startTime: "09:00",
      endTime: "13:00",
      locationId: defaultLocationId ?? null,
      deliveryMode,
      dailyAppointmentLimit: null,
    },
    {
      id: `interval-${Date.now()}-2`,
      startTime: "14:00",
      endTime: "18:00",
      locationId: defaultLocationId ?? null,
      deliveryMode,
      dailyAppointmentLimit: null,
    },
  ];
}

interface SwipeableIntervalProps {
  interval: WeeklyAvailabilityInterval;
  onUpdate: (id: string, updates: Partial<WeeklyAvailabilityInterval>) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  locations: { id: string; name: string }[];
}

function SwipeableInterval({
  interval,
  onUpdate,
  onDelete,
  canDelete,
  locations,
}: SwipeableIntervalProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -20], [1, 0]);
  const scale = useTransform(x, [-100, -20], [1, 0.5]);
  const isRemoteOnly = !interval.locationId && interval.deliveryMode === "telehealth";
  const isPhysicalWithoutLocation = !interval.locationId && interval.deliveryMode !== "telehealth";

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if ((info.offset.x < -80 || x.get() < -80) && canDelete) {
      onDelete(interval.id);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl touch-pan-y shadow-sm">
      {canDelete && (
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-destructive flex items-center justify-end px-8"
        >
          <motion.div style={{ scale }}>
            <RiDeleteBinLine className="h-7 w-7 text-white" />
          </motion.div>
        </motion.div>
      )}

      <motion.div
        drag={canDelete ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={{ left: 0.2, right: 0.1 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative flex flex-col gap-2 p-3 bg-background cursor-grab active:cursor-grabbing border border-border/50 rounded-2xl"
      >
        <div className="flex flex-col gap-3 flex-1 pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1 flex items-center justify-center bg-muted/40 rounded-[16px] h-[72px] pointer-events-auto">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {interval.startTime}
              </span>
              <select
                value={interval.startTime}
                onChange={(event) => onUpdate(interval.id, { startTime: event.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-muted-foreground/40 text-lg font-medium px-1">até</div>

            <div className="relative flex-1 flex items-center justify-center bg-muted/40 rounded-[16px] h-[72px] pointer-events-auto">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {interval.endTime}
              </span>
              <select
                value={interval.endTime}
                onChange={(event) => onUpdate(interval.id, { endTime: event.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "relative flex-2 flex items-center rounded-[16px] h-[56px] px-4 pointer-events-auto border transition-colors",
                isPhysicalWithoutLocation
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-muted/30 border-transparent has-focus:border-secondary/30",
              )}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Local
                </span>
                <span
                  className={cn(
                    "text-[13px] font-semibold truncate",
                    isPhysicalWithoutLocation ? "text-destructive" : "text-foreground",
                  )}
                >
                  {locations.find((location) => location.id === interval.locationId)?.name ??
                    (isRemoteOnly ? "Remoto" : "Local obrigatório")}
                </span>
              </div>
              <select
                value={getLocationSelectValue(interval)}
                onChange={(event) => {
                  if (event.target.value === ONLINE_LOCATION_SENTINEL) {
                    onUpdate(interval.id, {
                      locationId: null,
                      deliveryMode: "telehealth",
                    });
                    return;
                  }

                  onUpdate(interval.id, {
                    locationId: event.target.value || null,
                    deliveryMode:
                      interval.deliveryMode === "telehealth" && event.target.value
                        ? "hybrid"
                        : interval.deliveryMode,
                  });
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
              >
                <option value={ONLINE_LOCATION_SENTINEL}>Remoto</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex items-center justify-between bg-muted/40 rounded-[16px] h-[56px] px-4 pointer-events-auto">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Online
              </span>
              <Switch
                checked={interval.deliveryMode === "hybrid" || interval.deliveryMode === "telehealth"}
                onCheckedChange={(checked) => {
                  if (isRemoteOnly) return;

                  onUpdate(interval.id, {
                    deliveryMode: checked ? "hybrid" : "in_person",
                  });
                }}
                className="scale-[1.2] shadow-none data-checked:bg-[#34C759]"
                disabled={isRemoteOnly}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function MobileAvailabilitySheet({
  isOpen,
  onOpenChange,
  initialDay,
  localConfig,
  onUpdateConfig,
  locations,
}: MobileAvailabilitySheetProps) {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState<number[]>([initialDay]);
  const [intervals, setIntervals] = useState<WeeklyAvailabilityInterval[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedDays([initialDay]);
      const existingIntervals = localConfig[initialDay]?.intervals ?? [];
      const defaultLocationId = locations[0]?.id ?? null;
      setIntervals(
        existingIntervals.length > 0
          ? normalizeAvailabilityIntervalsForLocations(existingIntervals, defaultLocationId)
          : createLunchSplitIntervals(defaultLocationId),
      );
    }
  }, [isOpen, initialDay, localConfig, locations]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [intervals.length]);

  const toggleDay = (dayId: number) => {
    setSelectedDays((previous) =>
      previous.includes(dayId) ? previous.filter((id) => id !== dayId) : [...previous, dayId],
    );
  };

  const addInterval = () => {
    const defaultLocationId = locations[0]?.id ?? null;
    const newInterval: WeeklyAvailabilityInterval = {
      id: `interval-new-${Date.now()}`,
      startTime: "09:00",
      endTime: "18:00",
      locationId: defaultLocationId,
      deliveryMode: getDefaultDeliveryMode(defaultLocationId),
      dailyAppointmentLimit: null,
    };
    setIntervals((previous) => [...previous, newInterval]);
  };

  const updateInterval = (id: string, updates: Partial<WeeklyAvailabilityInterval>) => {
    setIntervals((previous) =>
      previous.map((interval) => (interval.id === id ? { ...interval, ...updates } : interval)),
    );
  };

  const deleteInterval = (id: string) => {
    setIntervals((previous) => previous.filter((interval) => interval.id !== id));
  };

  const handleSave = async () => {
    try {
      const defaultLocationId = locations[0]?.id ?? null;
      const updatedConfig = { ...localConfig };
      const normalizedIntervals = normalizeAvailabilityIntervalsForLocations(
        intervals,
        defaultLocationId,
      );

      selectedDays.forEach((dayId) => {
        updatedConfig[dayId] = {
          dayOfWeek: dayId,
          isActive: normalizedIntervals.length > 0,
          intervals: normalizedIntervals.map((interval) => ({ ...interval })),
        };
      });

      onUpdateConfig(updatedConfig);

      const weeklyDays = Object.values(updatedConfig).map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isActive: day.isActive,
        intervals: day.intervals.map((interval) => ({
          startTime: interval.startTime,
          endTime: interval.endTime,
          locationId: interval.locationId,
          deliveryMode: interval.deliveryMode,
          dailyAppointmentLimit: interval.dailyAppointmentLimit,
        })),
      }));

      unwrapActionResult(await saveWeeklyAvailabilityConfigAction({ weeklyDays }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all });
      toast.success("Disponibilidade salva com sucesso!");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar disponibilidade. Tente novamente.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[32px] p-0 overflow-hidden h-auto max-h-[75vh] w-full border-none flex flex-col"
        showCloseButton={false}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted/40 rounded-full z-10" />

        <div className="flex-none">
          <SheetHeader className="pt-8 pb-1 px-6 text-left">
            <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
              Quando você trabalha?
            </SheetTitle>
            <SheetDescription className="text-muted-foreground/60 text-lg">
              Marque seus dias e horários de trabalho
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-2">
            <div className="flex justify-between items-center gap-2">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                const hasConfig = (localConfig[day.id]?.intervals?.length ?? 0) > 0;

                return (
                  <BrandButton
                    key={day.id}
                    type="button"
                    variant="ghost"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "relative w-11 h-11 rounded-full text-base font-semibold transition-all duration-200 border-2",
                      isSelected
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/20"
                        : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60",
                    )}
                    aria-label={day.fullName}
                  >
                    {day.label}
                    {hasConfig && !isSelected && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
                    )}
                  </BrandButton>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4 pb-4">
            <AnimatePresence initial={false}>
              {intervals.map((interval) => (
                <motion.div
                  key={interval.id}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <SwipeableInterval
                    interval={interval}
                    onUpdate={updateInterval}
                    onDelete={deleteInterval}
                    canDelete={intervals.length > 1}
                    locations={locations}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-none px-4 py-3 pb-6 bg-background border-t border-border/5">
          <div className="flex gap-3">
            <BrandButton
              onClick={() => {
                void handleSave();
              }}
              className="flex-1 h-14 rounded-2xl text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/10 transition-all active:scale-[0.98]"
            >
              Salvar
            </BrandButton>
            <BrandButton
              onClick={addInterval}
              className="size-14 shrink-0 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/10 transition-all active:scale-95 flex items-center justify-center p-0"
              aria-label="Adicionar intervalo"
            >
              <RiAddLine className="size-8" />
            </BrandButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
