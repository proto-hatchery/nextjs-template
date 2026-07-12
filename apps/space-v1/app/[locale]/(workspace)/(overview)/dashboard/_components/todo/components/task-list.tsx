import { Checkbox } from "@workspace/ui/components/checkbox";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Flag, Flag as FlagFilled, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import type { TodoItem } from "../../../types/todo";
import { formatDueDate } from "../utils/date";

interface TaskListProps {
  items: TodoItem[];
  onToggle: (id: string, checked: boolean) => void;
  onRemove: (id: string) => void;
}

const metaColor: Record<"none" | "low" | "medium" | "high", string> = {
  none: "text-muted-foreground",
  low: "text-blue-600",
  medium: "text-amber-600",
  high: "text-rose-600",
};

export const TaskList = React.memo(function TaskList({ items, onToggle, onRemove }: TaskListProps) {
  return (
    <ul className="space-y-0">
      {items.length === 0 ? (
        <li className="text-muted-foreground px-1 py-2 text-sm">Vazio neste grupo.</li>
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="group"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="px-1">
                <div className={cn("flex items-center gap-3 rounded-md py-2", "hover:bg-muted/40")}>
                  <div className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      className="border-input ml-4 border shadow-none"
                      checked={item.isCompleted}
                      onCheckedChange={(v) => onToggle(item.id, Boolean(v))}
                      aria-label={item.isCompleted ? "Marcar como ativa" : "Marcar como concluída"}
                    />
                    <p
                      className={cn(
                        "truncate text-sm text-foreground",
                        item.isCompleted && "text-muted-foreground line-through",
                      )}
                    >
                      {item.title}
                    </p>
                  </div>
                  <div className="text-muted-foreground ml-auto flex items-center gap-2 pr-2 text-xs">
                    {item.priority === "none" ? (
                      <Flag className={cn("h-3.5 w-3.5", metaColor[item.priority])} />
                    ) : (
                      <FlagFilled className={cn("h-3.5 w-3.5", metaColor[item.priority])} />
                    )}
                    {formatDueDate(item.dueDateISO) && (
                      <span>{formatDueDate(item.dueDateISO)}</span>
                    )}
                    <BrandButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remover tarefa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </BrandButton>
                  </div>
                </div>
                <div className="mx-1 border-b" />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      )}
    </ul>
  );
});
