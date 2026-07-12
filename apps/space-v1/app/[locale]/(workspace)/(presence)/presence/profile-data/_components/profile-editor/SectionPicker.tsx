"use client";

import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";

interface SectionDefinition {
  id: string;
  label: string;
  group: string;
}

interface SectionPickerProps {
  groupedSections: Record<string, SectionDefinition[]>;
  addedSections: { id: string; active: boolean }[];
  onAddSection: (id: string) => void;
  onOpenEditor: (id: string) => void;
}

export function SectionPicker({
  groupedSections,
  addedSections,
  onAddSection,
  onOpenEditor,
}: SectionPickerProps) {
  return (
    <div className="space-y-6">
      {Object.entries(groupedSections).map(([group, sections]) => (
        <div key={group} className="space-y-3">
          <p className="text-sm font-semibold text-zinc-700">{group}</p>
          <div className="rounded-2xl border border-zinc-100 overflow-hidden">
            {sections.map((section) => {
              const isAdded = addedSections.some((item) => item.id === section.id);
              return (
                <BrandButton
                  key={section.id}
                  type="button"
                  variant="ghost"
                  onClick={() => (isAdded ? onOpenEditor(section.id) : onAddSection(section.id))}
                  className={cn(
                    "w-full h-auto rounded-none flex items-center justify-between px-4 py-4 text-left text-sm font-medium transition-colors",
                    isAdded ? "bg-zinc-50 text-zinc-500" : "hover:bg-zinc-50 text-zinc-900",
                  )}
                >
                  <span>{section.label}</span>
                  <span className="text-xs text-zinc-400">{isAdded ? "Editar" : "Adicionar"}</span>
                </BrandButton>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
