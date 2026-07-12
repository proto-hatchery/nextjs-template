"use client";

import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { CSS, useSortable } from "@workspace/forms/dnd";
import { cn } from "@workspace/ui/lib/utils";
import type { FluriLink } from "./fluri-field-links-v2.component";

export interface FluriSortableLinkItemProps {
  link: FluriLink;
  onUpdate: (id: string, updates: Partial<FluriLink>) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  disabled?: boolean;
  allowRemove?: boolean;
  allowReorder?: boolean;
  showActiveToggle?: boolean;
  titlePlaceholder?: string;
  urlPlaceholder?: string;
}

export function FluriSortableLinkItem({
  link,
  onUpdate,
  onRemove,
  onToggleActive,
  disabled,
  allowRemove = true,
  allowReorder = true,
  showActiveToggle = true,
  titlePlaceholder = "Title",
  urlPlaceholder = "URL",
}: FluriSortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    ...(!allowReorder || disabled ? { disabled: !allowReorder || disabled } : {}),
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 border-transparent rounded-2xl shadow-none transition-all group overflow-hidden",
        "bg-muted/40",
        isDragging && "shadow-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <div className="flex items-start gap-3 min-h-[80px]">
        {/* Drag Handle */}
        {allowReorder ? (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-20 group-hover:opacity-40 transition-opacity shrink-0 self-center p-2 -ml-2"
          >
            <GripVertical className="size-5" />
          </div>
        ) : (
          <div className="shrink-0 self-center p-2 -ml-2 opacity-0 pointer-events-none">
            <GripVertical className="size-5" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
          <div className="flex items-center gap-2 group/title w-fit">
            <div className="relative inline-flex flex-col text-left">
              <span className="invisible whitespace-pre font-bold text-sm h-5 pointer-events-none text-left">
                {link.title || titlePlaceholder}
              </span>
              <input
                value={link.title}
                onChange={(e) => onUpdate(link.id, { title: e.target.value })}
                disabled={disabled}
                className="absolute inset-x-0 top-0 bottom-0 font-bold border-none p-0 focus:ring-0 text-sm bg-transparent outline-none text-foreground min-w-0 w-full h-full text-left"
                placeholder={titlePlaceholder}
              />
            </div>
            {!disabled && (
              <Pencil className="size-3.5 text-muted-foreground/60 group-hover/title:text-foreground transition-colors cursor-pointer shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 group/url w-fit">
            <div className="relative inline-flex flex-col text-left">
              <span className="invisible whitespace-pre font-medium text-[13px] h-4 pointer-events-none text-left">
                {link.url || urlPlaceholder}
              </span>
              <input
                value={link.url}
                onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                disabled={disabled}
                className="absolute inset-x-0 top-0 bottom-0 text-foreground border-none p-0 focus:ring-0 text-[13px] bg-transparent outline-none font-medium min-w-0 w-full h-full text-left"
                placeholder={urlPlaceholder}
              />
            </div>
            {!disabled && (
              <Pencil className="size-3.5 text-muted-foreground/60 group-hover/url:text-foreground transition-colors cursor-pointer shrink-0" />
            )}
          </div>
        </div>

        {/* Right Side Actions Column */}
        <div className="flex flex-col items-end justify-between self-stretch gap-4">
          {showActiveToggle ? (
            <Switch
              checked={link.active}
              onCheckedChange={(val) => onToggleActive(link.id, val)}
              disabled={disabled}
              className="data-[state=checked]:bg-green-500"
            />
          ) : (
            <div className="h-5" />
          )}

          {allowRemove ? (
            <button
              type="button"
              className="size-8 flex items-center justify-center text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mt-auto cursor-pointer"
              onClick={() => onRemove(link.id)}
              disabled={disabled}
            >
              <Trash2 className="size-4" />
            </button>
          ) : (
            <div className="size-8 mt-auto" />
          )}
        </div>
      </div>
    </Card>
  );
}
