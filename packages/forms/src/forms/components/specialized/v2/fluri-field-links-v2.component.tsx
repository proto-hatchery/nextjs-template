"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  arrayMove,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  SortableContext,
  sortableKeyboardCoordinates,
  useSensor,
  useSensors,
} from "@workspace/forms/dnd";
import { cn } from "@workspace/ui/lib/utils";
import type { V2BoundFieldProps } from "@workspace/forms/v2/kernel/types";
import { FluriSortableLinkItem } from "./fluri-sortable-link-item.component";

export interface FluriLink {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface FluriFieldLinksV2Props {
  links: FluriLink[];
  onChange: (links: FluriLink[]) => void;
  field?: V2BoundFieldProps<FluriLink[], HTMLDivElement>;
  maxActiveLinks?: number;
  allowAdd?: boolean;
  allowRemove?: boolean;
  allowReorder?: boolean;
  titlePlaceholder?: string;
  urlPlaceholder?: string;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  addButtonLabel?: string;
  showActiveToggle?: boolean;
}

const FluriFieldLinksV2 = ({
  links,
  onChange,
  field,
  maxActiveLinks = 4,
  allowAdd = true,
  allowRemove = true,
  allowReorder = true,
  titlePlaceholder = "Título do link",
  urlPlaceholder = "https://...",
  helperText,
  errorMessage,
  className,
  disabled: propDisabled,
  addButtonLabel = "Adicionar link",
  showActiveToggle = true,
}: FluriFieldLinksV2Props) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const resolvedDisabled = field?.disabled ?? propDisabled ?? false;
  const resolvedLinks = field?.value ?? links;
  const resolvedOnChange = field?.onValueChange ?? onChange;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCount = useMemo(
    () => resolvedLinks.filter((link) => link.active).length,
    [resolvedLinks],
  );

  const addLink = useCallback(() => {
    const canActivate = activeCount < maxActiveLinks;
    const newLink: FluriLink = {
      id: crypto.randomUUID(),
      title: "",
      url: "",
      active: canActivate,
    };
    resolvedOnChange([...resolvedLinks, newLink]);

    if (!canActivate) {
      setLocalError(`Limite de ${maxActiveLinks} links ativos. Desative um para ativar outro.`);
    } else {
      setLocalError(null);
    }
  }, [resolvedLinks, resolvedOnChange, activeCount, maxActiveLinks]);

  const updateLink = useCallback(
    (id: string, updates: Partial<FluriLink>) => {
      resolvedOnChange(
        resolvedLinks.map((link) => (link.id === id ? { ...link, ...updates } : link)),
      );
    },
    [resolvedLinks, resolvedOnChange],
  );

  const removeLink = useCallback(
    (id: string) => {
      resolvedOnChange(resolvedLinks.filter((link) => link.id !== id));
      setLocalError(null);
    },
    [resolvedLinks, resolvedOnChange],
  );

  const toggleLinkActive = useCallback(
    (id: string, nextActive: boolean) => {
      if (!nextActive) {
        setLocalError(null);
        updateLink(id, { active: false });
        return;
      }

      if (activeCount >= maxActiveLinks) {
        setLocalError(`Limite de ${maxActiveLinks} links ativos. Desative um para ativar outro.`);
        return;
      }

      setLocalError(null);
      updateLink(id, { active: true });
    },
    [activeCount, maxActiveLinks, updateLink],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = resolvedLinks.findIndex((item) => item.id === active.id);
        const newIndex = resolvedLinks.findIndex((item) => item.id === over.id);
        const newLinks = arrayMove(resolvedLinks, oldIndex, newIndex);
        resolvedOnChange(newLinks);
      }
    },
    [resolvedLinks, resolvedOnChange],
  );

  const displayError = field?.errorMessage ?? errorMessage ?? localError ?? undefined;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Add Button */}
      {allowAdd && (
        <Button
          onClick={addLink}
          variant="secondary"
          disabled={resolvedDisabled}
          className="w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus className="size-4" />
          {addButtonLabel}
        </Button>
      )}

      {/* Links List */}
      {allowReorder && resolvedLinks.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={resolvedLinks}>
            <div className="space-y-2">
              {resolvedLinks.map((link) => (
                <FluriSortableLinkItem
                  key={link.id}
                  link={link}
                  onUpdate={updateLink}
                  onRemove={removeLink}
                  onToggleActive={toggleLinkActive}
                  disabled={resolvedDisabled}
                  allowRemove={allowRemove}
                  allowReorder={allowReorder}
                  showActiveToggle={showActiveToggle}
                  titlePlaceholder={titlePlaceholder}
                  urlPlaceholder={urlPlaceholder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {resolvedLinks.map((link) => (
            <FluriSortableLinkItem
              key={link.id}
              link={link}
              onUpdate={updateLink}
              onRemove={removeLink}
              onToggleActive={toggleLinkActive}
              disabled={resolvedDisabled}
              allowRemove={allowRemove}
              allowReorder={false}
              showActiveToggle={showActiveToggle}
              titlePlaceholder={titlePlaceholder}
              urlPlaceholder={urlPlaceholder}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {resolvedLinks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhum link adicionado ainda.
        </div>
      )}

      {/* Error / Helper Text */}
      {displayError && <p className="text-sm text-destructive font-medium">{displayError}</p>}
      {helperText && !displayError && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  );
};

export { FluriFieldLinksV2 };
export default FluriFieldLinksV2;
