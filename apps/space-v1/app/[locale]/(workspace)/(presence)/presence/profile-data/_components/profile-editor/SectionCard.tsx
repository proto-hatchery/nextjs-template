"use client";

import { Card } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface SectionCardProps {
  id: string;
  title: string;
  isActive: boolean;
  summary: React.ReactNode;
  onEdit: () => void;
  onToggleActive: (active: boolean) => void;
  isEditing?: boolean;
  children?: React.ReactNode;
}

export function SectionCard({
  id,
  title,
  isActive,
  summary,
  onEdit,
  onToggleActive,
  isEditing = false,
  children,
}: SectionCardProps) {
  const isMandatory = id === "basic";

  return (
    <div className="w-full min-w-0 space-y-2 overflow-hidden">
      <Card
        className={cn(
          "group w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:shadow-md",
          !isActive && !isEditing && "opacity-70",
        )}
      >
        <div className="flex min-h-[100px] min-w-0 flex-col">
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <div className="group/title flex min-w-0 items-center gap-2">
              <h3 className="truncate font-fustat text-sm font-bold text-zinc-900">{title}</h3>
            </div>

            <Switch
              checked={isMandatory ? true : isActive}
              {...(!isMandatory && onToggleActive !== undefined
                ? { onCheckedChange: onToggleActive }
                : {})}
              disabled={isMandatory}
              className="shrink-0 data-[state=checked]:bg-green-500"
            />
          </div>

          <div className="flex-1 min-w-0 py-2">
            <div className="min-w-0 overflow-hidden pt-1">{summary}</div>
          </div>

          <div className="flex justify-end w-full mt-auto">
            <BrandButton
              type="button"
              variant="ghost"
              size="icon"
              family="rounded"
              className={cn(
                "size-8 text-muted-foreground transition-transform duration-200",
                isEditing && "rotate-180 text-zinc-900",
              )}
              onClick={onEdit}
            >
              <ChevronDown className="size-4" />
            </BrandButton>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full min-w-0 max-w-full overflow-hidden"
          >
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white/50 p-6 shadow-sm">
              <div className="w-full min-w-0 overflow-hidden">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
