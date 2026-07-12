"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface WizardSidebarProps {
  steps: Step[];
  currentStep: number;
  title: string;
  subtitle: string;
}

export function WizardSidebar({ steps, currentStep, title, subtitle }: WizardSidebarProps) {
  return (
    <div className="w-full md:w-72 bg-muted/30 border-b md:border-b-0 md:border-r border-border/50 p-8 shrink-0 flex flex-col">
      <div className="mb-10 px-0 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-base text-muted-foreground/80">{subtitle}</p>
      </div>

      <nav aria-label="Progress" className="flex-1">
        <ol role="list" className="space-y-6">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <li key={step.label} className="relative">
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-8 left-3.5 -ml-px h-full w-0.5",
                      isCompleted ? "bg-primary/20" : "bg-border/40",
                    )}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-center group">
                  <span className="h-9 flex items-center">
                    <span
                      className={cn(
                        "relative z-10 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-300",
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                            ? "bg-background border-primary ring-4 ring-primary/10"
                            : "bg-muted border-transparent text-muted-foreground",
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <step.icon
                          className={cn(
                            "h-3.5 w-3.5",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                      )}
                    </span>
                  </span>
                  <span className="ml-4 min-w-0 flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium tracking-tight transition-colors duration-200",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
