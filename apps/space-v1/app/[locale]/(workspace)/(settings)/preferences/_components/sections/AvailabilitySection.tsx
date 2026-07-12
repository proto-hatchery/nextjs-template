"use client";

import { RiAddLine, RiGlobalLine, RiSaveLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { saveWeeklyAvailabilityConfigAction } from "@workspace/supabase-data/actions/availability/save-weekly-availability-config";
import { updatePsychologistProfileAction } from "@workspace/supabase-data/actions/psychologists/update-psychologist-profile";
import { useWeeklyAvailabilityConfig } from "@workspace/supabase-data/hooks/availability";
import {
  usePsychologist,
  usePsychologistLocations,
} from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { getTimezoneOptions } from "@workspace/ui/lib/timezone-utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { toast } from "sonner";

import { MobileAvailabilitySheet } from "../../(tabs)/availability/_components/mobile-availability-sheet";
import { WeeklyDayEditor } from "../../(tabs)/availability/_components/weekly-day-editor";
import {
  getDefaultDeliveryMode,
  normalizeWeeklyAvailabilityForLocations,
  type WeeklyAvailabilityInterval,
  type WeeklyDayConfig,
} from "../../_lib/availability-delivery";

function generateIntervalId() {
  return `interval-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createLunchSplitIntervals(primaryLocationId?: string | null): WeeklyAvailabilityInterval[] {
  const deliveryMode = getDefaultDeliveryMode(primaryLocationId);

  return [
    {
      id: generateIntervalId(),
      startTime: "09:00",
      endTime: "13:00",
      locationId: primaryLocationId ?? null,
      deliveryMode,
      dailyAppointmentLimit: null,
    },
    {
      id: `${generateIntervalId()}-afternoon`,
      startTime: "14:00",
      endTime: "18:00",
      locationId: primaryLocationId ?? null,
      deliveryMode,
      dailyAppointmentLimit: null,
    },
  ];
}

export interface AvailabilitySectionProps {
  isOnboarding?: boolean;
}

export interface AvailabilitySectionRef {
  save: () => Promise<void>;
}

export const AvailabilitySection = forwardRef<AvailabilitySectionRef, AvailabilitySectionProps>(
  ({ isOnboarding = false }, ref) => {
    const { data: weeklyConfig, isPending: isPendingConfig } = useWeeklyAvailabilityConfig();
    const { data: psychologist, isPending: isPendingPsychologist } = usePsychologist();
    const { data: dbLocations, isPending: isPendingLocations } = usePsychologistLocations();
    const queryClient = useQueryClient();

    const [localConfig, setLocalConfig] = useState<Record<number, WeeklyDayConfig>>({
      /* empty */
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState<string>("America/Sao_Paulo");
    const isMobile = useIsMobile();
    const [editingDayMobile, setEditingDayMobile] = useState<number | null>(null);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    const locations = useMemo(() => {
      return (dbLocations ?? [])
        .filter((l) => l.name !== null)
        .map((l) => ({ id: l.id, name: l.name! }));
    }, [dbLocations]);

    const primaryLocationId = useMemo(() => {
      return dbLocations?.[0]?.id ?? null;
    }, [dbLocations]);

    const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

    const handleOpenMobile = (day: number) => {
      setEditingDayMobile(day);
    };

    useImperativeHandle(ref, () => ({
      save: async () => await handleSave(),
    }));

    useEffect(() => {
      if (weeklyConfig) {
        setLocalConfig(normalizeWeeklyAvailabilityForLocations(weeklyConfig, primaryLocationId));
      }
    }, [weeklyConfig, primaryLocationId]);

    useEffect(() => {
      if (psychologist?.timezone) {
        setSelectedTimezone(psychologist.timezone);
      }
    }, [psychologist]);

    useEffect(() => {
      setHasChanges(true);
    }, [localConfig, selectedTimezone]);

    const handleToggleDay = (day: number, active: boolean) => {
      setLocalConfig((prev) => {
        const current = prev[day];
        const existing = current?.intervals ?? [];
        let intervals = existing;

        if (active) {
          const hasDefaultWholeDay =
            intervals.length === 1 &&
            intervals[0]?.startTime === "09:00" &&
            intervals[0]?.endTime === "18:00";

          if (intervals.length === 0 || hasDefaultWholeDay) {
            intervals = createLunchSplitIntervals(primaryLocationId);
          }
        } else {
          intervals = [];
        }

        return {
          ...prev,
          [day]: {
            dayOfWeek: day,
            isActive: active,
            intervals,
          },
        };
      });
    };

    const handleApplyToWeekdays = (sourceDay: number) => {
      const source = localConfig[sourceDay];
      if (!source) return;
      const WEEKDAYS = [1, 2, 3, 4, 5];
      setLocalConfig((prev) => {
        const next = { ...prev };
        for (const d of WEEKDAYS) {
          if (d === sourceDay) continue;
          next[d] = {
            dayOfWeek: d,
            isActive: source.isActive,
            intervals: source.intervals.map((i) => ({
              ...i,
              id: generateIntervalId(),
            })),
          };
        }
        return next;
      });
    };

    const handleAddInterval = (day: number) => {
      const newInterval: WeeklyAvailabilityInterval = {
        id: generateIntervalId(),
        startTime: "09:00",
        endTime: "13:00",
        locationId: primaryLocationId,
        deliveryMode: getDefaultDeliveryMode(primaryLocationId),
        dailyAppointmentLimit: null,
      };

      setLocalConfig((prev) => {
        const current = prev[day];
        return {
          ...prev,
          [day]: {
            dayOfWeek: day,
            isActive: current?.isActive ?? true,
            intervals: [...(current?.intervals ?? []), newInterval],
          },
        };
      });
    };

    const handleUpdateInterval = (
      day: number,
      intervalId: string,
      updates: WeeklyAvailabilityInterval,
    ) => {
      setLocalConfig((prev) => {
        const current = prev[day];
        return {
          ...prev,
          [day]: {
            dayOfWeek: day,
            isActive: current?.isActive ?? true,
            intervals: (current?.intervals ?? []).map((interval) =>
              interval.id === intervalId ? updates : interval,
            ),
          },
        };
      });
    };

    const handleDeleteInterval = (day: number, intervalId: string) => {
      setLocalConfig((prev) => {
        const current = prev[day];
        return {
          ...prev,
          [day]: {
            dayOfWeek: day,
            isActive: current?.isActive ?? true,
            intervals: (current?.intervals ?? []).filter((interval) => interval.id !== intervalId),
          },
        };
      });
    };

    const handleSave = async () => {
      setIsSaving(true);
      try {
        const normalizedConfig = normalizeWeeklyAvailabilityForLocations(
          localConfig,
          primaryLocationId,
        );
        const weeklyDays = Object.values(normalizedConfig).map((day) => ({
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

        const availabilityPromise = saveWeeklyAvailabilityConfigAction({ weeklyDays }).then(
          unwrapActionResult,
        );

        let profilePromise: Promise<unknown> = Promise.resolve();
        if (selectedTimezone !== psychologist?.timezone) {
          profilePromise = updatePsychologistProfileAction({
            timezone: selectedTimezone,
          }).then(unwrapActionResult);
        }

        await Promise.all([availabilityPromise, profilePromise]);
        void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.psychologist.profile() });

        setHasChanges(false);
        if (!isOnboarding) {
          toast.success("Disponibilidade e fuso horário salvos com sucesso!");
        }
      } catch {
        if (!isOnboarding) {
          toast.error("Erro ao salvar as configurações.");
        }
      } finally {
        setIsSaving(false);
      }
    };

    if (isPendingConfig || isPendingPsychologist || isPendingLocations) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    return (
      <section id="availability" className="scroll-mt-20 space-y-4 flex flex-col h-full min-h-0">
        {!isOnboarding && (
          <div className="shrink-0">
            <h3 className="text-2xl font-semibold tracking-tight">Disponibilidade</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure seus horários de atendimento semanais e fuso horário.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="relative group max-w-sm flex-1">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
              <RiGlobalLine className="h-5 w-5 text-muted-foreground/80 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-foreground leading-tight">
                  Fuso Horário
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground truncate">
                  {timezoneOptions.find((tz) => tz.value === selectedTimezone)?.label ??
                    selectedTimezone}
                </span>
              </div>
            </div>
            <select
              id="timezone"
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-1">
          {[1, 2, 3, 4, 5].map((day) => (
            <WeeklyDayEditor
              key={day}
              dayOfWeek={day}
              isActive={localConfig[day]?.isActive ?? false}
              intervals={localConfig[day]?.intervals ?? []}
              onToggleDay={(active) => handleToggleDay(day, active)}
              onAddInterval={() => handleAddInterval(day)}
              onUpdateInterval={(intervalId, updates) =>
                handleUpdateInterval(day, intervalId, updates)
              }
              onDeleteInterval={(intervalId) => handleDeleteInterval(day, intervalId)}
              onApplyToWeekdays={() => handleApplyToWeekdays(day)}
              onOpenMobile={handleOpenMobile}
              locations={locations}
              isExpanded={expandedDay === day}
              onToggleExpand={() => setExpandedDay((prev) => (prev === day ? null : day))}
            />
          ))}

          {isOnboarding && (
            <div className="group relative rounded-xl transition-all duration-300 bg-transparent border-2 border-dashed border-muted-foreground/15 hover:border-muted-foreground/30 hover:bg-muted/5">
              <button
                type="button"
                onClick={() => {
                  // Toggle weekend days (Saturday and Sunday)
                  const isWeekendActive = localConfig[6]?.isActive ?? localConfig[0]?.isActive;
                  handleToggleDay(6, !isWeekendActive);
                  handleToggleDay(0, !isWeekendActive);
                }}
                className="flex items-center justify-center w-full px-4 py-4 sm:py-3 min-h-[64px] sm:min-h-[52px] select-none cursor-pointer"
              >
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <RiAddLine className="h-5 w-5" />
                  <span className="text-[15px] sm:text-[13px] font-medium">
                    Adicionar horários de fim de semana
                  </span>
                </div>
              </button>
            </div>
          )}

          {!isOnboarding &&
            [6, 0].map((day) => (
              <WeeklyDayEditor
                key={day}
                dayOfWeek={day}
                isActive={localConfig[day]?.isActive ?? false}
                intervals={localConfig[day]?.intervals ?? []}
                onToggleDay={(active) => handleToggleDay(day, active)}
                onAddInterval={() => handleAddInterval(day)}
                onUpdateInterval={(intervalId, updates) =>
                  handleUpdateInterval(day, intervalId, updates)
                }
                onDeleteInterval={(intervalId) => handleDeleteInterval(day, intervalId)}
                onApplyToWeekdays={() => handleApplyToWeekdays(day)}
                onOpenMobile={handleOpenMobile}
                locations={locations}
                isExpanded={expandedDay === day}
                onToggleExpand={() => setExpandedDay((prev) => (prev === day ? null : day))}
              />
            ))}
        </div>

        {!isOnboarding && !isMobile && (
          <div className="flex justify-end pt-4">
            <BrandButton
              onClick={() => void handleSave()}
              disabled={!hasChanges || isSaving}
            >
              <RiSaveLine className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Disponibilidade"}
            </BrandButton>
          </div>
        )}

        <MobileAvailabilitySheet
          isOpen={editingDayMobile !== null}
          onOpenChange={(open) => !open && setEditingDayMobile(null)}
          initialDay={editingDayMobile ?? 0}
          localConfig={localConfig}
          onUpdateConfig={(updatedConfig) => {
            setLocalConfig(updatedConfig);
            setHasChanges(true);
          }}
          locations={locations}
        />
      </section>
    );
  },
);

AvailabilitySection.displayName = "AvailabilitySection";
