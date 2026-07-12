"use client";

import type { TimelineCardFormValues } from "@/compat/features/public-profile/ui/timeline-card";
import { TimelineCard } from "@/compat/features/public-profile/ui/timeline-card";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Plus } from "lucide-react";
import { useState } from "react";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

interface TimelineFormProps {
  type: "academic" | "professional";
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
}

export function TimelineForm({ type, items, onChange }: TimelineFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const showAddForm = isAdding || items.length === 0;

  const handleCreate = (values: TimelineCardFormValues) => {
    const newItem: TimelineItem = {
      id: crypto.randomUUID(),
      title: values.title,
      subtitle: values.subtitle,
      startDate: values.startDate,
      endDate: values.isCurrent ? null : (values.endDate ?? null),
      isCurrent: values.isCurrent ?? false,
      type,
    };
    onChange([...items, newItem]);
    setIsAdding(false);
  };

  const handleUpdate = (id: string, values: TimelineCardFormValues) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              title: values.title,
              subtitle: values.subtitle,
              startDate: values.startDate,
              endDate: values.isCurrent ? null : (values.endDate ?? null),
              isCurrent: values.isCurrent ?? false,
            }
          : item,
      ),
    );
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <TimelineCard
          key={item.id}
          index={index + 1}
          type={type}
          title={item.title}
          subtitle={item.subtitle}
          startDate={item.startDate}
          endDate={item.endDate}
          isCurrent={item.isCurrent}
          defaultValues={{
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            startDate: item.startDate,
            endDate: item.endDate,
            isCurrent: item.isCurrent,
          }}
          onSave={(values: TimelineCardFormValues) => handleUpdate(item.id, values)}
          onRemove={() => handleRemove(item.id)}
        />
      ))}

      {showAddForm ? (
        <TimelineCard
          index={items.length + 1}
          type={type}
          title=""
          subtitle=""
          defaultValues={{
            title: "",
            subtitle: "",
            startDate: "",
            endDate: null,
            isCurrent: false,
          }}
          onSave={(values: TimelineCardFormValues) => handleCreate(values)}
          onCancel={() => setIsAdding(false)}
          showCancelButton={items.length > 0}
          initialEditing={true}
        />
      ) : (
        <BrandButton
          variant="neutral"
          className="w-full border-dashed border-2 py-5"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="size-4 mr-2" />
          Adicionar {type === "academic" ? "Formação" : "Experiência"}
        </BrandButton>
      )}
    </div>
  );
}
