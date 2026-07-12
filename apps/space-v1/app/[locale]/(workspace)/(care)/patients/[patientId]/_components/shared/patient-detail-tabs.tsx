"use client";

import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";

export interface PatientDetailTabItem {
  id: string;
  label: string;
  badge?: number | string;
  disabled?: boolean;
}

export const DEFAULT_PATIENT_TABS: PatientDetailTabItem[] = [
  { id: "clinical-overview", label: "Dados clínicos" },
  { id: "documents", label: "Documentos" },
  { id: "sessions", label: "Sessões" },
  { id: "guardians", label: "Responsáveis" },
  { id: "medical-records", label: "Registro Clínico" },
];

interface PatientDetailTabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs?: PatientDetailTabItem[];
}

// Custom TabsTrigger for patient detail tabs with small size and pointer cursor
function PatientDetailTabsTrigger({
  value,
  disabled,
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      value={value}
      disabled={disabled}
      className={cn(
        // Base styles from TabsTrigger but adjusted for small size
        "relative rounded-full bg-transparent px-3 py-1 text-sm font-semibold text-muted-foreground transition-all whitespace-nowrap",
        // Hover state with pointer cursor
        "hover:text-foreground hover:bg-accent/50 hover:cursor-pointer",
        // Active state
        "data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </TabsTrigger>
  );
}

export function PatientDetailTabs({
  value,
  onChange,
  tabs = DEFAULT_PATIENT_TABS,
}: PatientDetailTabsProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4">
      <Tabs value={value} onValueChange={onChange} className="w-full">
        <TabsList className="h-auto inline-flex w-fit justify-start gap-2 rounded-none border-0 bg-transparent p-0">
          {tabs.map((tab) => (
            <PatientDetailTabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
              <span className="leading-none">{tab.label}</span>
              {tab.badge ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {tab.badge}
                </span>
              ) : null}
            </PatientDetailTabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
