"use client";

import { Calendar, History } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";

export type SessionTypeFilter = "all" | "scheduled" | "past";

export interface SessionTypeToggleProps {
  value: SessionTypeFilter;
  onChange: (value: SessionTypeFilter) => void;
  compact?: boolean;
}

export function SessionTypeToggle({ value, onChange, compact = false }: SessionTypeToggleProps) {
  const [optimisticValue, setOptimisticValue] = useState(value);

  useEffect(() => {
    setOptimisticValue(value);
  }, [value]);

  const handleChange = (newValue: SessionTypeFilter) => {
    setOptimisticValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
      <BrandButton
        variant="ghost"
        size="sm"
        onClick={() => handleChange("past")}
        className={cn(
          "rounded-full transition-all text-sm font-semibold",
          compact ? "px-2.5 py-1.5" : "px-4 py-1.5",
          optimisticValue === "past"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        title={compact ? "Histórico" : undefined}
      >
        {compact ? <History className="size-4" /> : "Histórico"}
      </BrandButton>
      <BrandButton
        variant="ghost"
        size="sm"
        onClick={() => handleChange("scheduled")}
        className={cn(
          "rounded-full transition-all text-sm font-semibold",
          compact ? "px-2.5 py-1.5" : "px-4 py-1.5",
          optimisticValue === "scheduled"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        title={compact ? "Agendadas" : undefined}
      >
        {compact ? <Calendar className="size-4" /> : "Agendadas"}
      </BrandButton>
    </div>
  );
}
