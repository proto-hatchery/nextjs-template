"use client";

import { FluriLogo } from "@workspace/brand/components/fluri-logo";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";
import { Check, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { type StepGroup } from "../types";

interface OnboardingSidebarProps {
  groups: StepGroup[];
  allSubSteps: string[];
  currentSubStepId?: string;
  app?: "space" | "desk" | "admin" | "clinic" | "connect" | "web";
  subtitle?: string;
  helpLabel?: string;
  onHelpClick?: () => void;
}

export function OnboardingSidebar({
  groups,
  allSubSteps,
  currentSubStepId,
  app = "space",
  subtitle = "Configuração de perfil",
  helpLabel = "Precisa de ajuda?",
  onHelpClick,
}: OnboardingSidebarProps) {
  const currentSubStepIndex = currentSubStepId ? allSubSteps.indexOf(currentSubStepId) : -1;
  const currentGroup = groups.find((group) =>
    group.subSteps.some((s) => s.id === currentSubStepId),
  );

  // Initialize with current group, but allow manual expansion/collapse
  const [userExpandedGroup, setUserExpandedGroup] = useState<string | null>(null);
  const expandedGroup = userExpandedGroup ?? currentGroup?.id ?? null;

  const isGroupCompleted = (group: StepGroup): boolean => {
    const lastSubStep = group.subSteps[group.subSteps.length - 1];
    if (!lastSubStep) return false;
    const lastSubStepIndex = allSubSteps.indexOf(lastSubStep.id);
    return currentSubStepIndex > lastSubStepIndex;
  };

  const isSubStepCompleted = (subStepId: string): boolean => {
    const index = allSubSteps.indexOf(subStepId);
    return currentSubStepIndex > index;
  };

  const isSubStepCurrent = (subStepId: string): boolean => {
    return currentSubStepId === subStepId;
  };

  return (
    <div className="flex shrink-0 flex-col bg-gradient-to-br from-primary to-primary/90 p-6 text-white lg:w-80 lg:p-8">
      {/* Logo */}
      <div className="mb-10">
        <FluriLogo
          {...(app !== "web" ? { app } : {})}
          color="white"
          priority
          className="origin-left scale-[1.35]"
        />
      </div>

      {/* Steps Groups */}
      <div className="flex-1 space-y-0">
        {groups.map((group, groupIndex) => {
          const isCompleted = isGroupCompleted(group);
          const isCurrent = currentGroup?.id === group.id;
          const isExpanded = expandedGroup === group.id || isCurrent;

          return (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              <BrandButton
                variant="ghost"
                onClick={() => {
                  if (isCompleted || isCurrent) {
                    setUserExpandedGroup(isExpanded ? null : group.id);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-2 py-3 transition-all duration-200 h-auto justify-start",
                  isCurrent && "text-white",
                  isCompleted && !isCurrent && "text-white/70",
                  !isCompleted && !isCurrent && "text-white/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isCompleted && "bg-green-400 text-white",
                    isCurrent && "bg-white text-primary",
                    !isCompleted && !isCurrent && "bg-white/20 text-white/60",
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : groupIndex + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium uppercase tracking-wide",
                    isCurrent ? "text-white" : "text-white/80",
                  )}
                >
                  {group.label}
                </span>
              </BrandButton>

              {/* Sub-steps */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0 py-1 pl-11 pr-2">
                      {group.subSteps.map((subStep) => {
                        const subCompleted = isSubStepCompleted(subStep.id);
                        const subCurrent = isSubStepCurrent(subStep.id);

                        return (
                          <div
                            key={subStep.id}
                            className={cn(
                              "flex w-full items-center gap-3 px-2 py-2.5 text-left transition-all duration-200",
                              subCurrent && "text-white",
                              subCompleted && !subCurrent && "text-white/60",
                              !subCompleted && !subCurrent && "cursor-not-allowed text-white/30",
                            )}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                subCompleted && "bg-green-400",
                                subCurrent && "bg-white",
                                !subCompleted && !subCurrent && "bg-white/30",
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm",
                                subCurrent ? "font-medium text-white" : "text-white/70",
                              )}
                            >
                              {subStep.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Help Link */}
      <div className="mt-auto border-t border-white/20 pt-6">
        <BrandButton
          variant="ghost"
          onClick={onHelpClick}
          className="flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-white h-auto justify-start p-0"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>{helpLabel}</span>
        </BrandButton>
      </div>
    </div>
  );
}
